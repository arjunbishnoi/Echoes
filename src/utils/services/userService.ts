import { db } from "@/config/firebase.config";
import type { FriendCodeLookupResult, FriendRequest, Friendship, User, UserProfile } from "@/types/user";
import { generateFriendCode } from "@/utils/friendCode";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore";

export class UserService {
  private static readonly USERS_COLLECTION = "users";
  private static readonly FRIEND_REQUESTS_COLLECTION = "friendRequests";
  private static readonly FRIENDSHIPS_COLLECTION = "friendships";

  // Cache user data to AsyncStorage for offline access
  private static async cacheUserData(user: User): Promise<void> {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      await AsyncStorage.setItem(`user_${user.id}`, JSON.stringify(user));
    } catch {
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return null;
      }
      
      const user = userSnap.data() as User;
      if (!user.friendCode) {
        user.friendCode = generateFriendCode(userId);
        try {
          await setDoc(doc(db, this.USERS_COLLECTION, userId), { friendCode: user.friendCode }, { merge: true });
        } catch {
          // Ignore backfill failures
        }
      }
      
      // Cache the user data for offline access
      await this.cacheUserData(user);
      
      return user;
    } catch (error) {
      return null;
    }
  }

  static async getUserByFriendCode(friendCode: string): Promise<User | null> {
    try {
      const normalizedCode = friendCode.trim().toUpperCase();
      if (!normalizedCode) {
        return null;
      }
      const usersRef = collection(db, this.USERS_COLLECTION);
      const q = query(usersRef, where("friendCode", "==", normalizedCode));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const user = snapshot.docs[0].data() as User;
      user.friendCode = user.friendCode ?? normalizedCode;
      await this.cacheUserData(user);
      return user;
    } catch {
      return null;
    }
  }

  static async resolveFriendCode(friendCode: string): Promise<FriendCodeLookupResult | null> {
    const user = await this.getUserByFriendCode(friendCode);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      displayName: user.displayName || user.username || user.email,
      username: user.username ?? undefined,
    };
  }

  static async updateUser(userId: string, data: Partial<User>, retryCount = 0): Promise<User> {
    const maxRetries = 3;
    
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(userRef, updateData, { merge: true });
      
      // Instead of fetching from Firestore (which might fail), construct the updated user
      // We'll try to get the existing user data first, but fall back to basic data if it fails
      let existingUser: User | null = null;
      try {
        existingUser = await this.getUser(userId);
      } catch {
      }
      
      // Construct the updated user from existing data + new data
      const updatedUser: User = {
        id: userId,
        email: existingUser?.email || "",
        displayName: updateData.displayName ?? existingUser?.displayName ?? "",
        photoURL: updateData.photoURL ?? existingUser?.photoURL,
        username: updateData.username ?? existingUser?.username,
        bio: updateData.bio ?? existingUser?.bio,
        friendCode: existingUser?.friendCode ?? updateData.friendCode ?? generateFriendCode(userId),
        createdAt: existingUser?.createdAt || new Date().toISOString(),
        updatedAt: updateData.updatedAt,
        profileCompleted: updateData.profileCompleted ?? existingUser?.profileCompleted ?? false,
        friendIds: existingUser?.friendIds || [],
        blockedUserIds: existingUser?.blockedUserIds || [],
        settings: existingUser?.settings || {
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
      
      // Cache the updated user data
      await this.cacheUserData(updatedUser);
      
      return updatedUser;
    } catch (error: any) {
      
      // Check if it's a Firestore "Target ID already exists" error and retry
      if (error?.message?.includes("Target ID already exists") && retryCount < maxRetries) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.updateUser(userId, data, retryCount + 1);
      }
      
      throw new Error("Failed to update user");
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const user = await this.getUser(userId);
      if (!user) return null;
      
      return {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        photoURL: user.photoURL,
        bio: user.bio,
      };
    } catch {
      return null;
    }
  }

  static async searchUsers(searchQuery: string): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, this.USERS_COLLECTION);
      const querySnapshot = await getDocs(usersRef);
      
      const lowerQuery = searchQuery.toLowerCase();
      const profiles: UserProfile[] = [];
      
      querySnapshot.forEach((docSnap) => {
        const user = docSnap.data() as User;
        if (
          user.displayName.toLowerCase().includes(lowerQuery) ||
          user.username?.toLowerCase().includes(lowerQuery) ||
          user.email.toLowerCase().includes(lowerQuery)
        ) {
          profiles.push({
            id: user.id,
            displayName: user.displayName,
            username: user.username,
            photoURL: user.photoURL,
            bio: user.bio,
          });
        }
      });
      
      return profiles;
    } catch {
      return [];
    }
  }

  static async hasPendingFriendRequest(fromUserId: string, toUserId: string): Promise<boolean> {
    try {
      const requestsRef = collection(db, this.FRIEND_REQUESTS_COLLECTION);
      const q = query(
        requestsRef,
        where("fromUserId", "==", fromUserId),
        where("toUserId", "==", toUserId),
        where("status", "==", "pending")
      );
      
      const existingSnap = await getDocs(q);
      return !existingSnap.empty;
    } catch {
      return false;
    }
  }

  static async sendFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest> {
    try {
      const requestsRef = collection(db, this.FRIEND_REQUESTS_COLLECTION);
      const q = query(
        requestsRef,
        where("fromUserId", "==", fromUserId),
        where("toUserId", "==", toUserId),
        where("status", "==", "pending")
      );
      
      const existingSnap = await getDocs(q);
      if (!existingSnap.empty) {
        throw new Error("Friend request already sent");
      }
      
      const fromProfile = await this.getUserProfile(fromUserId);

      const newRequest: FriendRequest = {
        id: doc(collection(db, this.FRIEND_REQUESTS_COLLECTION)).id,
        fromUserId,
        toUserId,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fromDisplayName: fromProfile?.displayName,
        fromUsername: fromProfile?.username,
        fromPhotoURL: fromProfile?.photoURL,
      };
      
      await setDoc(doc(db, this.FRIEND_REQUESTS_COLLECTION, newRequest.id), newRequest);
      
      return newRequest;
    } catch {
      throw new Error("Failed to send friend request");
    }
  }

  static async sendFriendRequestByFriendCode(
    fromUserId: string,
    friendCode: string
  ): Promise<{ request: FriendRequest; target: FriendCodeLookupResult }> {
    const target = await this.resolveFriendCode(friendCode);
    if (!target) {
      throw new Error("No Echoes user found for that code.");
    }
    if (target.id === fromUserId) {
      throw new Error("You can't send a friend request to yourself.");
    }

    const request = await this.sendFriendRequest(fromUserId, target.id);
    return { request, target };
  }

  static subscribeToIncomingFriendRequests(
    userId: string,
    callback: (requests: FriendRequest[]) => void
  ): () => void {
    const requestsRef = collection(db, this.FRIEND_REQUESTS_COLLECTION);
    const q = query(
      requestsRef,
      where("toUserId", "==", userId),
      where("status", "==", "pending")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs
          .map((docSnap) => ({ ...(docSnap.data() as FriendRequest), id: docSnap.id }))
          .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
        callback(requests);
      },
      (_error) => {
        callback([]);
      }
    );
  }

  static subscribeToAcceptedFriendRequests(
    userId: string,
    callback: (requests: FriendRequest[]) => void
  ): () => void {
    const requestsRef = collection(db, this.FRIEND_REQUESTS_COLLECTION);
    const q = query(
      requestsRef,
      where("fromUserId", "==", userId),
      where("status", "==", "accepted")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const requests = snapshot.docs
          .map((docSnap) => ({ ...(docSnap.data() as FriendRequest), id: docSnap.id }))
          .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
        callback(requests);
      },
      (_error) => {
        callback([]);
      }
    );
  }

  static async declineFriendRequest(requestId: string): Promise<void> {
    try {
      const requestRef = doc(db, this.FRIEND_REQUESTS_COLLECTION, requestId);
      await updateDoc(requestRef, {
        status: "rejected",
        updatedAt: new Date().toISOString(),
      });
    } catch {
      throw new Error("Failed to decline friend request");
    }
  }

  static async acceptFriendRequest(requestId: string): Promise<Friendship> {
    try {
      const batch = writeBatch(db);
      
      const requestRef = doc(db, this.FRIEND_REQUESTS_COLLECTION, requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error("Friend request not found");
      }
      
      const request = requestSnap.data() as FriendRequest;
      
      batch.update(requestRef, {
        status: "accepted",
        updatedAt: new Date().toISOString(),
      });
      
      const friendshipId = doc(collection(db, this.FRIENDSHIPS_COLLECTION)).id;
      const newFriendship: Friendship = {
        id: friendshipId,
        userId1: request.fromUserId,
        userId2: request.toUserId,
        createdAt: new Date().toISOString(),
      };
      
      batch.set(doc(db, this.FRIENDSHIPS_COLLECTION, friendshipId), newFriendship);
      
      batch.update(doc(db, this.USERS_COLLECTION, request.fromUserId), {
        friendIds: arrayUnion(request.toUserId),
      });
      batch.update(doc(db, this.USERS_COLLECTION, request.toUserId), {
        friendIds: arrayUnion(request.fromUserId),
      });
      
      await batch.commit();
      
      return newFriendship;
    } catch {
      throw new Error("Failed to accept friend request");
    }
  }

  static async getFriends(userId: string): Promise<UserProfile[]> {
    try {
      const friendshipsRef = collection(db, this.FRIENDSHIPS_COLLECTION);
      
      const q1 = query(friendshipsRef, where("userId1", "==", userId));
      const q2 = query(friendshipsRef, where("userId2", "==", userId));
      
      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      
      const friendIds = new Set<string>();
      snap1.forEach((docSnap) => {
        const friendship = docSnap.data() as Friendship;
        friendIds.add(friendship.userId2);
      });
      snap2.forEach((docSnap) => {
        const friendship = docSnap.data() as Friendship;
        friendIds.add(friendship.userId1);
      });
      
      const profiles: UserProfile[] = [];
      for (const friendId of friendIds) {
        const profile = await this.getUserProfile(friendId);
        if (profile) profiles.push(profile);
      }
      
      return profiles;
    } catch {
      return [];
    }
  }

  static async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    try {
      const usersRef = collection(db, this.USERS_COLLECTION);
      const q = query(usersRef, where("username", "==", username.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return true;
      }
      
      // If we're excluding a user ID (for updates), check if the username belongs to that user
      if (excludeUserId) {
        const existingUser = querySnapshot.docs[0]?.data() as User;
        return existingUser?.id === excludeUserId;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  static needsProfileCompletion(user: User): boolean {
    // A user needs profile completion if they haven't completed it yet or don't have a username
    return !user.profileCompleted || !user.username || user.username.trim().length === 0;
  }
}

