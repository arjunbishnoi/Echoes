import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  setDoc, 
  updateDoc, 
  where,
  writeBatch,
  arrayUnion,
  arrayRemove,
  Timestamp
} from "firebase/firestore";
import { db } from "../../config/firebase.config";
import type { FriendRequest, Friendship, User, UserProfile } from "../../types/user";

/**
 * UserService - Handles user profile and friend operations with Firestore
 */
export class UserService {
  private static readonly USERS_COLLECTION = "users";
  private static readonly FRIEND_REQUESTS_COLLECTION = "friendRequests";
  private static readonly FRIENDSHIPS_COLLECTION = "friendships";

  /**
   * Get user by ID from Firestore
   */
  static async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return null;
      }
      
      return userSnap.data() as User;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  /**
   * Update user profile in Firestore
   */
  static async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(userRef, updateData);
      
      // Return updated user
      const updatedUser = await this.getUser(userId);
      if (!updatedUser) {
        throw new Error("User not found after update");
      }
      
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }

  /**
   * Get user profile (minimal data for display)
   */
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
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }

  /**
   * Search users by username or display name
   * Note: For production, consider using Algolia or similar for better search
   */
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
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  }

  /**
   * Send friend request via Firestore
   */
  static async sendFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest> {
    try {
      // Check if request already exists
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
      
      const newRequest: FriendRequest = {
        id: doc(collection(db, this.FRIEND_REQUESTS_COLLECTION)).id,
        fromUserId,
        toUserId,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, this.FRIEND_REQUESTS_COLLECTION, newRequest.id), newRequest);
      
      return newRequest;
    } catch (error) {
      console.error("Error sending friend request:", error);
      throw new Error("Failed to send friend request");
    }
  }

  /**
   * Accept friend request with Firestore batch write
   */
  static async acceptFriendRequest(requestId: string): Promise<Friendship> {
    try {
      const batch = writeBatch(db);
      
      // Get the request
      const requestRef = doc(db, this.FRIEND_REQUESTS_COLLECTION, requestId);
      const requestSnap = await getDoc(requestRef);
      
      if (!requestSnap.exists()) {
        throw new Error("Friend request not found");
      }
      
      const request = requestSnap.data() as FriendRequest;
      
      // Update request status
      batch.update(requestRef, {
        status: "accepted",
        updatedAt: new Date().toISOString(),
      });
      
      // Create friendship
      const friendshipId = doc(collection(db, this.FRIENDSHIPS_COLLECTION)).id;
      const newFriendship: Friendship = {
        id: friendshipId,
        userId1: request.fromUserId,
        userId2: request.toUserId,
        createdAt: new Date().toISOString(),
      };
      
      batch.set(doc(db, this.FRIENDSHIPS_COLLECTION, friendshipId), newFriendship);
      
      // Update both users' friendIds arrays
      batch.update(doc(db, this.USERS_COLLECTION, request.fromUserId), {
        friendIds: arrayUnion(request.toUserId),
      });
      batch.update(doc(db, this.USERS_COLLECTION, request.toUserId), {
        friendIds: arrayUnion(request.fromUserId),
      });
      
      await batch.commit();
      
      return newFriendship;
    } catch (error) {
      console.error("Error accepting friend request:", error);
      throw new Error("Failed to accept friend request");
    }
  }

  /**
   * Get user's friends from Firestore
   */
  static async getFriends(userId: string): Promise<UserProfile[]> {
    try {
      const friendshipsRef = collection(db, this.FRIENDSHIPS_COLLECTION);
      
      // Query for friendships where user is userId1
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
      
      // Fetch all friend profiles
      const profiles: UserProfile[] = [];
      for (const friendId of friendIds) {
        const profile = await this.getUserProfile(friendId);
        if (profile) profiles.push(profile);
      }
      
      return profiles;
    } catch (error) {
      console.error("Error getting friends:", error);
      return [];
    }
  }
}

