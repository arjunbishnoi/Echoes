import { auth, db } from "@/config/firebase.config";
import type { User } from "@/types/user";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import {
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    OAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, enableNetwork } from "firebase/firestore";
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

      if (__DEV__) {
        // Debug log to verify the exact redirect used by the app at runtime
        // Expected for Expo Go: https://auth.expo.dev/@arjunbishnoi/echoes
        console.log(
          "[Auth] Google redirect URI:",
          redirectUri,
          "| useProxy:",
          useProxy,
          "| ownership:",
          Constants.appOwnership
        );
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
      
      // Ensure Firestore network is enabled (but don't fail if it errors)
      try {
        await enableNetwork(db);
      } catch (error) {
        // Network might already be enabled or there might be connection issues
        // This is not critical - Firestore will work offline/online automatically
        if (__DEV__) {
          console.log("[Auth] Firestore network enable (non-critical):", error);
        }
      }
      
      const user: User = {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: userCredential.user.displayName || "User",
        photoURL: userCredential.user.photoURL || undefined,
        username: userCredential.user.email?.split("@")[0],
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
      
      // Try to get user document, but don't fail if offline
      let userDoc;
      try {
        userDoc = await getDoc(userRef);
      } catch (error) {
        // If offline or network error, create new user document
        if (__DEV__) {
          console.log("[Auth] Firestore getDoc error (offline?), creating new user:", error);
        }
        userDoc = null;
      }
      
      // Save or update user document
      try {
        if (userDoc?.exists()) {
          await setDoc(userRef, { 
            ...userDoc.data(),
            updatedAt: new Date().toISOString() 
          }, { merge: true });
        } else {
          await setDoc(userRef, user);
        }
      } catch (error) {
        // If still offline, log but don't fail - user is authenticated
        if (__DEV__) {
          console.warn("[Auth] Failed to save user to Firestore (may be offline):", error);
        }
        // User is still authenticated, just Firestore write failed
      }
      
      return user;
    } catch (error: unknown) {
      throw new Error((error as Error).message || "Failed to sign in with Google");
    }
  }

  static async signInWithApple(): Promise<User> {
    try {
      let available = false;
      if (Platform.OS === "ios") {
        available = await AppleAuthentication.isAvailableAsync();
      }

      if (!available) {
        throw new Error("Apple Sign In is only available on iOS devices running iOS 13 or later.");
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
      
      // Try to get user from Firestore
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          return userDoc.data() as User;
        }
      } catch (error) {
        // If Firestore is offline or fails, create user from Firebase Auth data
        if (__DEV__) {
          console.log("[Auth] Firestore unavailable, using Firebase Auth data:", error);
        }
      }
      
      // If Firestore doesn't have the user or is offline, create from Firebase Auth
      const user: User = {
        id: currentUser.uid,
        email: currentUser.email || "",
        displayName: currentUser.displayName || "User",
        photoURL: currentUser.photoURL || undefined,
        username: currentUser.email?.split("@")[0] || "user",
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
      if (__DEV__) {
        console.log("[Auth] onAuthStateChanged fired, firebaseUser:", !!firebaseUser);
      }
      
      if (firebaseUser) {
        try {
          const user = await this.getCurrentUser();
          if (__DEV__) {
            console.log("[Auth] getCurrentUser result:", !!user);
          }
          callback(user);
        } catch (error) {
          if (__DEV__) {
            console.error("[Auth] getCurrentUser failed in onAuthStateChanged:", error);
          }
          // If getCurrentUser fails, still provide a basic user from Firebase Auth
          const fallbackUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "User",
            photoURL: firebaseUser.photoURL || undefined,
            username: firebaseUser.email?.split("@")[0] || "user",
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
          callback(fallbackUser);
        }
      } else {
        callback(null);
      }
    });
  }
}
