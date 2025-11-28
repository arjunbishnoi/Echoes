import type { User } from "@/types/user";
import { ActivityStorage } from "@/utils/activityStorage";
import { Storage } from "@/utils/asyncStorage";
import { EchoStorage } from "@/utils/echoStorage";
import { FriendStorage } from "@/utils/friendStorage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthService } from "./services/authService";
import { EchoService } from "./services/echoService";
import { UserService } from "./services/userService";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<User | void>;
  signInWithApple: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const namespaceRef = useRef<string | null>(null);

  useEffect(() => {
    // Check initial auth state immediately to speed up initial load
    const checkInitialAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser && !isGuest) {
          setUser(currentUser);
        }
        // Set loading to false regardless - either we have a user or we don't
        setIsLoading(false);
      } catch {
        // If check fails, still set loading to false and wait for onAuthStateChanged
        setIsLoading(false);
      }
    };
    
    void checkInitialAuth();

    const unsubscribe = AuthService.onAuthStateChanged((firebaseUser) => {
      if (isGuest) {
        setIsLoading(false);
        return;
      }
      
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [isGuest]);

  const signInWithGoogle = async () => {
    try {
      const user = await AuthService.signInWithGoogle();
      setIsGuest(false);

      return user;
    } catch (error) {
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      await AuthService.signInWithApple();
      setIsGuest(false);
    } catch (error) {
      // Apple Sign In not available with personal developer account
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
      setIsGuest(false);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const signInAsGuest = async () => {
    try {
      const guestUser: User = {
        id: `guest_${Date.now()}`,
        email: "guest@echoes.app",
        displayName: "Guest User",
        username: "guest",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        friendIds: [],
        blockedUserIds: [],
        settings: {
          notifications: {
            pushEnabled: false,
            emailEnabled: false,
            friendRequests: false,
            echoUpdates: false,
            echoUnlocks: false,
          },
          privacy: {
            profileVisibility: "private",
            allowFriendRequests: false,
          },
          theme: "dark",
        },
      };

      setIsGuest(true);
      setUser(guestUser);
      setIsLoading(false);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) throw new Error("No user logged in");

      const updatedUser = await UserService.updateUser(user.id, data);
      setUser(updatedUser);
    } catch (error: any) {
      // If Firestore fails but we have the data, update local state as fallback
      if (user && (error?.message?.includes("Target ID already exists") || 
                   error?.message?.includes("offline"))) {
        const localUpdatedUser = {
          ...user,
          ...data,
          updatedAt: new Date().toISOString(),
        };
        setUser(localUpdatedUser);
        
        // Don't throw error if we successfully updated local state
        return;
      }
      
      throw error;
    }
  };

  useEffect(() => {
    const applyNamespace = async () => {
      const nextNamespace = isGuest ? "guest" : user?.id ?? "anon";
      if (namespaceRef.current === nextNamespace) {
        return;
      }
      namespaceRef.current = nextNamespace;
      Storage.setNamespace(nextNamespace);
      await Promise.all([
        EchoStorage.clear(),
        ActivityStorage.clear(),
        FriendStorage.clear(),
      ]);
      
      // Sync new data for the new user
      if (user && !isGuest) {
        try {
          // 1. Fetch remote echoes first
          const remoteEchoes = await EchoService.getUserEchoes(user.id);
          
          // 2. Sync them to local storage
          await EchoStorage.syncRemoteEchoes(remoteEchoes, user.id);
          
          // 3. Now fetch activities (since we now have the echoes locally)
          await EchoStorage.refreshActivitiesFromRemote(user.id);
        } catch {
        }
      }
    };
    void applyNamespace();
  }, [user?.id, isGuest]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isGuest,
        signInWithGoogle,
        signInWithApple,
        signInAsGuest,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  // Graceful fallback for useAuth
  if (!context) {
    return {
      user: null,
      isLoading: true, // Assume loading if context is missing
      isAuthenticated: false,
      isGuest: false,
      signInWithGoogle: async () => {},
      signInWithApple: async () => {},
      signInAsGuest: async () => {},
      signOut: async () => {},
      updateProfile: async () => {},
    };
  }
  return context;
}
