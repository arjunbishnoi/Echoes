import { auth, db } from "@/config/firebase.config";
import type { User } from "@/types/user";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { signOut as firebaseSignOut, GoogleAuthProvider, onAuthStateChanged, signInWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

WebBrowser.maybeCompleteAuthSession();

export class AuthService {
  static async signInWithGoogle(): Promise<User> {
    try {
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
      
      if (!clientId) {
        throw new Error("Google Web Client ID not configured");
      }

      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      };

      const redirectUri = 'https://auth.expo.io';

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
      });

      await request.makeAuthUrlAsync(discovery);
      const result = await request.promptAsync(discovery);

      if (result?.type !== "success") {
        throw new Error("Google sign-in cancelled or failed");
      }

      const code = result.params.code as string | undefined;
      if (!code) {
        throw new Error("No authorization code received from Google");
      }

      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId,
          code,
          redirectUri,
          extraParams: request.codeVerifier ? { code_verifier: request.codeVerifier } : undefined,
        },
        discovery
      );

      const idToken = tokenResponse.idToken;
      const accessToken = tokenResponse.accessToken;
      if (!idToken && !accessToken) {
        throw new Error("Failed to retrieve tokens from Google");
      }

      const credential = idToken
        ? GoogleAuthProvider.credential(idToken)
        : GoogleAuthProvider.credential(null, accessToken);
      const userCredential = await signInWithCredential(auth, credential);
      
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
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await setDoc(userRef, { 
          ...userDoc.data(),
          updatedAt: new Date().toISOString() 
        }, { merge: true });
      } else {
        await setDoc(userRef, user);
      }
      
      return user;
    } catch (error: unknown) {
      throw new Error((error as Error).message || "Failed to sign in with Google");
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return null;
      
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      
      return null;
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
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}
