import { Storage } from "../asyncStorage";

/**
 * Base class for all storage managers with common cache management patterns
 */
export abstract class BaseStorage<T> {
  protected cache: T[] = [];
  protected isInitialized = false;
  protected storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  /**
   * Initialize cache from AsyncStorage
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const stored = await Storage.get<T[]>(this.storageKey);
      this.cache = stored || [];
      this.isInitialized = true;
    } catch (error) {
      console.error(`Failed to initialize ${this.storageKey}:`, error);
      this.cache = [];
      this.isInitialized = true;
    }
  }

  /**
   * Persist cache to AsyncStorage
   */
  async persist(): Promise<boolean> {
    try {
      return await Storage.set(this.storageKey, this.cache);
    } catch (error) {
      console.error(`Failed to persist ${this.storageKey}:`, error);
      return false;
    }
  }

  /**
   * Get all items from cache
   */
  getAll(): T[] {
    return [...this.cache];
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.cache = [];
    this.isInitialized = false;
  }

  /**
   * Get count of items
   */
  count(): number {
    return this.cache.length;
  }
}

