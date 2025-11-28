import type { User } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_COMPLETION_KEY = 'profile_completion_tracker';

export class ProfileCompletionTracker {
  /**
   * Mark a user as having completed the personalization flow
   */
  static async markProfileCompleted(userId: string): Promise<void> {
    try {
      const existingData = await this.getCompletedUsers();
      const updatedData = {
        ...existingData,
        [userId]: {
          completedAt: new Date().toISOString(),
          version: 1, // For future migrations if needed
        }
      };
      
      await AsyncStorage.setItem(PROFILE_COMPLETION_KEY, JSON.stringify(updatedData));
    } catch {
    }
  }

  /**
   * Check if a user has completed the personalization flow
   */
  static async hasCompletedProfile(userId: string): Promise<boolean> {
    try {
      const completedUsers = await this.getCompletedUsers();
      const hasCompleted = !!completedUsers[userId];
      
      return hasCompleted;
    } catch {
      return false;
    }
  }

  /**
   * Check if user needs profile completion using multiple sources
   */
  static async needsProfileCompletion(user: User): Promise<boolean> {
    try {
      // First check: Local storage tracker (most reliable)
      const hasCompletedLocally = await this.hasCompletedProfile(user.id);
      if (hasCompletedLocally) {
        return false;
      }

      // Second check: User object from Firestore
      if (user.profileCompleted === true) {
        // Mark in local storage for future reference
        await this.markProfileCompleted(user.id);
        return false;
      }

      // Third check: Has username (legacy check)
      if (user.username && user.username.trim().length > 0) {
        // User has username, assume they completed it before we added tracking
        await this.markProfileCompleted(user.id);
        return false;
      }

      // User needs to complete profile
      return true;
    } catch (error) {
      // Fallback to original logic
      return !user.profileCompleted || !user.username || user.username.trim().length === 0;
    }
  }

  /**
   * Get all completed users from storage
   */
  private static async getCompletedUsers(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(PROFILE_COMPLETION_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * Clear all completion data (for testing)
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROFILE_COMPLETION_KEY);
    } catch {
    }
  }
}

