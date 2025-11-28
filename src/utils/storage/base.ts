import { Storage } from "../asyncStorage";

export abstract class BaseStorage<T> {
  protected cache: T[] = [];
  protected isInitialized = false;
  protected storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const stored = await Storage.get<T[]>(this.storageKey);
      this.cache = stored || [];
      this.isInitialized = true;
    } catch {
      this.cache = [];
      this.isInitialized = true;
    }
  }

  async persist(): Promise<boolean> {
    try {
      return await Storage.set(this.storageKey, this.cache);
    } catch {
      return false;
    }
  }

  getAll(): T[] {
    return [...this.cache];
  }

  clear(): void {
    this.cache = [];
    this.isInitialized = false;
  }

  count(): number {
    return this.cache.length;
  }
}

