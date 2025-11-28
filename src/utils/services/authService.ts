import { auth, db } from "@/config/firebase.config";
import type { User } from "@/types/user";
import { generateFriendCode } from "@/utils/friendCode";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import {
  signOut as firebaseSignOut,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
} from "firebase/auth";
import { doc, enableNetwork, getDoc, setDoc } from "firebase/firestore";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

function generateRandomNonce(length: number = 32): string {
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._";
  let result = "";
  const randomValues = Crypto.getRandomBytes(length);
  for (let i = 0; i < randomValues.length; i++) {
    result += charset[randomValues[i] % charset.length];
  }
  return result;
}

export class AuthService {
  static async signInWithGoogle(): Promise<User> {
    try {
      // Resolve client IDs from env (preferred) or extra (fallback)
      const expoExtra = (Constants?.expoConfig?.extra ?? (Constants as any)?.manifest?.extra) ?? {};
      const envExpoClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      const envIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
      const envAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
      const extraAuth = (expoExtra as any)?.auth?.google ?? {};
      const expoClientId = envExpoClientId ?? extraAuth?.expoClientId;
      const iosClientId = envIosClientId ?? extraAuth?.iosClientId;
      const androidClientId = envAndroidClientId ?? extraAuth?.androidClientId;

      // Expo Go/dev: use proxy + expoClientId; EAS native: platform-specific client ID, no proxy
      const isExpoGo = Constants.appOwnership === "expo";
      const useProxy = isExpoGo && !!expoClientId;
      const clientId = useProxy
        ? expoClientId
        : Platform.select({
            ios: iosClientId,
            android: androidClientId,
            default: expoClientId,
          });

      if (!clientId) {
        throw new Error("Google OAuth client IDs not configured");
      }

      // Build correct redirect:
      // - Expo Go (proxy): https://auth.expo.dev/@owner/slug
      // - Dev/Prod native (no proxy): com.googleusercontent.apps.<CLIENT_ID>:/oauth2redirect
      let redirectUri: string;
      if (useProxy) {
        const owner = (Constants.expoConfig as any)?.owner ?? (Constants as any)?.manifest?.owner;
        const slug = (Constants.expoConfig as any)?.slug ?? (Constants as any)?.manifest?.slug;
        redirectUri = `https://auth.expo.dev/@${owner}/${slug}`;
      } else {
        const nativeClient = Platform.OS === "ios" ? iosClientId : androidClientId;
        if (!nativeClient) {
          throw new Error("Missing native Google OAuth client ID for this platform");
        }
        // Extract just the client ID part if it's a full client ID string
        // e.g., "956489650665-xxx.apps.googleusercontent.com" -> "956489650665-xxx"
        let clientIdPart = nativeClient;
        if (nativeClient.includes(".apps.googleusercontent.com")) {
          clientIdPart = nativeClient.replace(".apps.googleusercontent.com", "");
        }
        // Native redirect must use the GIS scheme format: com.googleusercontent.apps.{CLIENT_ID}:/oauth2redirect
        redirectUri = `com.googleusercontent.apps.${clientIdPart}:/oauth2redirect`;
      }

      const discovery = {
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
      };

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ["openid", "profile", "email"],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
        extraParams: {
          // Request a fresh consent if needed; harmless otherwise
          // prompt: "consent",
        },
      });

      await request.makeAuthUrlAsync(discovery);
      const result = await request.promptAsync(discovery, { useProxy });

      if (result?.type !== "success") {
        throw new Error("Google sign-in cancelled or failed");
      }

      const code = (result.params as any)?.code as string | undefined;
      if (!code) {
        throw new Error("No authorization code received from Google");
      }

      // Exchange the authorization code for tokens using PKCE
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId,
          code,
          redirectUri,
          extraParams: request.codeVerifier ? { code_verifier: request.codeVerifier } : undefined,
        },
        discovery
      );

      const idToken =
        (tokenResponse as any)?.idToken ??
        (tokenResponse as any)?.id_token ??
        undefined;
      const accessToken = (tokenResponse as any)?.accessToken ?? (tokenResponse as any)?.access_token ?? undefined;
      if (!idToken && !accessToken) {
        throw new Error("Failed to retrieve tokens from Google");
      }

      const credential = idToken
        ? GoogleAuthProvider.credential(idToken)
        : GoogleAuthProvider.credential(null, accessToken);
      const userCredential = await signInWithCredential(auth, credential);
      const additionalInfo = getAdditionalUserInfo(userCredential);
      const isNewUser = additionalInfo?.isNewUser;
      
      // Ensure Firestore network is enabled (but don't fail if it errors)
      try {
        await enableNetwork(db);
      } catch {
        // Network enable failures are non-critical
      }
      
      const user: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: "", // Let user set their own display name
        friendCode: generateFriendCode(userCredential.user.uid),
        // Don't include photoURL and username if they're undefined - Firestore doesn't like undefined values
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profileCompleted: false, // New users haven't completed profile yet
        friendIds: [],
        blockedUserIds: [],
        settings: {
          notifications: {
            pushEnabled: true,
            emailEnabled: true,
            friendRequests: true,
            echoUpdates: true,
            echoUnlocks: true,
          },
          privacy: {
            profileVisibility: "friends",
            allowFriendRequests: true,
          },
          theme: "dark",
        },
      };

      const userRef = doc(db, "users", user.id);
      
      // Optimistic Check: Just try to read once
      let existingUserData: User | null = null;
      try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
           existingUserData = userDoc.data() as User;
           // Backfill friend code if missing
           if (!existingUserData.friendCode) {
              const newFriendCode = generateFriendCode(userCredential.user.uid);
              existingUserData.friendCode = newFriendCode;
              // Fire and forget update
              setDoc(userRef, { friendCode: newFriendCode }, { merge: true }).catch(() => {});
           }
        }
      } catch {
      }
      
      // If we found existing user data, return it (with optional timestamp update)
      if (existingUserData) {
        // Try to update timestamp, but don't fail if it doesn't work
        try {
          await setDoc(
            userRef,
            {
            ...existingUserData,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch {
          // Non-critical
        }
        
        // Cache the user data for future offline access
        try {
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          await AsyncStorage.setItem(`user_${existingUserData.id}`, JSON.stringify(existingUserData));
        } catch {
        }
        
        return existingUserData;
      }
      
      // If Firestore is unavailable/empty, check Cache
      if (!existingUserData) {
        try {
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          const cachedUserData = await AsyncStorage.getItem(`user_${userCredential.user.uid}`);
          if (cachedUserData) {
             return JSON.parse(cachedUserData) as User;
          }
        } catch (e) {}
      }
      
      // No existing user found, create new user ONLY if we are sure it's a new user OR we checked cache and found nothing
      // CRITICAL: Do NOT overwrite if getDoc failed and it's NOT a new user.
      
      if (isNewUser) {
        try {
          await setDoc(userRef, user);
        } catch {
        }
      } else {
        // Not a new user, but we failed to fetch/cache data.
        // Try to save ONLY the fields that should be present, using merge
        // But avoid overwriting complex fields like friends/settings with defaults if possible
        // Safest is to skip writing and just return the user object for the session
      }
      
      return user;
    } catch (error: unknown) {
      throw new Error((error as Error).message || "Failed to sign in with Google");
    }
  }

  static async signInWithApple(): Promise<User> {
    try {
      // Check if Apple Authentication is available (requires paid Apple Developer account)
      let available = false;
      if (Platform.OS === "ios") {
        try {
          available = await AppleAuthentication.isAvailableAsync();
        } catch (error) {
          throw new Error("Apple Sign In is not available. This feature requires a paid Apple Developer account with Sign in with Apple capability enabled.");
        }
      }

      if (!available) {
        throw new Error("Apple Sign In is only available on iOS devices running iOS 13 or later with a paid Apple Developer account.");
      }

      const rawNonce = generateRandomNonce();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!appleCredential.identityToken) {
        throw new Error("Apple Sign In failed: Missing identity token.");
      }

      const provider = new OAuthProvider("apple.com");
      const firebaseCredential = provider.credential({
        idToken: appleCredential.identityToken,
        rawNonce,
      });

      const userCredential = await signInWithCredential(auth, firebaseCredential);

      const displayNameFromApple =
        appleCredential.fullName?.givenName || appleCredential.fullName?.familyName
          ? `${appleCredential.fullName?.givenName ?? ""} ${
              appleCredential.fullName?.familyName ?? ""
            }`.trim()
          : undefined;

      const emailFromApple =
        appleCredential.email ??
        userCredential.user.email ??
        `${userCredential.user.uid}@privaterelay.appleid.com`;

      const user: User = {
        id: userCredential.user.uid,
        email: emailFromApple,
        displayName: displayNameFromApple || userCredential.user.displayName || "Apple User",
        friendCode: generateFriendCode(userCredential.user.uid),
        photoURL: userCredential.user.photoURL || undefined,
        username: emailFromApple.split("@")[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        friendIds: [],
        blockedUserIds: [],
        settings: {
          notifications: {
            pushEnabled: true,
            emailEnabled: true,
            friendRequests: true,
            echoUpdates: true,
            echoUnlocks: true,
          },
          privacy: {
            profileVisibility: "friends",
            allowFriendRequests: true,
          },
          theme: "dark",
        },
      };

      const userRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await setDoc(
          userRef,
          {
            ...userDoc.data(),
            displayName: user.displayName,
            photoURL: user.photoURL,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } else {
        await setDoc(userRef, user);
      }

      return user;
    } catch (error) {
      const appleError = error as AppleAuthentication.AppleAuthenticationError;
      if (appleError?.code === "ERR_CANCELED") {
        throw new Error("Apple Sign In was cancelled.");
      }
      throw new Error((error as Error).message || "Failed to sign in with Apple");
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      
      // 1. Offline-First: Check Cache Immediately
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const cachedUserData = await AsyncStorage.getItem(`user_${currentUser.uid}`);
        
        if (cachedUserData) {
          const parsedUser = JSON.parse(cachedUserData) as User;
          return parsedUser;
        }
      } catch (storageError) {
        // Cache failed, proceed to network
      }

      // 2. Network Fallback
      const userRef = doc(db, "users", currentUser.uid);
      try {
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            
            // Update Cache
            try {
              const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
              await AsyncStorage.setItem(`user_${userData.id}`, JSON.stringify(userData));
            } catch (e) {}
            
            return userData;
          }
      } catch {
      }
      
      // If no cache and no network, return basic user from Auth
      const user: User = {
        id: currentUser.uid,
        email: currentUser.email || "",
        displayName: "", // Let user set their own display name
        friendCode: generateFriendCode(currentUser.uid),
        // Don't include photoURL and username if they're undefined - Firestore doesn't like undefined values
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profileCompleted: false, // Default to false for new users
        friendIds: [],
        blockedUserIds: [],
        settings: {
          notifications: {
            pushEnabled: true,
            emailEnabled: true,
            friendRequests: true,
            echoUpdates: true,
            echoUnlocks: true,
          },
          privacy: {
            profileVisibility: "friends",
            allowFriendRequests: true,
          },
          theme: "dark",
        },
      };
      
      return user;
    } catch {
      return null;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch {
      throw new Error("Failed to sign out");
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    return !!auth.currentUser;
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await this.getCurrentUser();
          callback(user);
        } catch (error) {
          // Try to get from cache as a last resort
          try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            const cachedUserData = await AsyncStorage.getItem(`user_${firebaseUser.uid}`);
            
            if (cachedUserData) {
              const parsedUser = JSON.parse(cachedUserData) as User;
              if (!parsedUser.friendCode) {
                parsedUser.friendCode = generateFriendCode(firebaseUser.uid);
              }
              callback(parsedUser);
              return;
            }
          } catch (cacheError) {
            // Ignore cache error
          }

          // If getCurrentUser fails and no cache, provide a basic user from Firebase Auth
          const fallbackUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: "", // Let user set their own display name
            friendCode: generateFriendCode(firebaseUser.uid),
            // Don't include photoURL and username if they're undefined - Firestore doesn't like undefined values
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            profileCompleted: false, // Default to false for fallback users
            friendIds: [],
            blockedUserIds: [],
            settings: {
              notifications: {
                pushEnabled: true,
                emailEnabled: true,
                friendRequests: true,
                echoUpdates: true,
                echoUnlocks: true,
              },
              privacy: {
                profileVisibility: "friends",
                allowFriendRequests: true,
              },
              theme: "dark",
            },
          };
          callback(fallbackUser);
        }
      } else {
        callback(null);
      }
    });
  }
}
