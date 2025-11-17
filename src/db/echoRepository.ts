import type { Echo, EchoActivity } from "@/types/echo";
import { ActivityStorage } from "@/utils/activityStorage";
import { Storage } from "@/utils/asyncStorage";
import { EchoStorage } from "@/utils/echoStorage";

export interface EchoRepository {
  getAllEchoes(): Echo[];
  getAllActivities(): EchoActivity[];
  isPinned(id: string): boolean;
  isFavorite(id: string): boolean;
  togglePin(id: string): boolean;
  toggleFavorite(id: string): void;
}

class LegacyEchoRepository implements EchoRepository {
  private pinned = new Set<string>();
  private favorites = new Set<string>();
  private initialized = false;

  private async ensureLoaded() {
    if (this.initialized) return;
    const [p, f] = await Promise.all([Storage.getPinned(), Storage.getFavorites()]);
    if (p) this.pinned = new Set(p);
    if (f) this.favorites = new Set(f);
    this.initialized = true;
  }

  getAllEchoes(): Echo[] {
    // EchoStorage holds in-memory cache; ensure initialized elsewhere
    return EchoStorage.getAll();
  }

  getAllActivities(): EchoActivity[] {
    return ActivityStorage.getAll();
  }

  isPinned(id: string): boolean {
    // Best-effort sync; caller should have used hooks for UI reactiveness
    void this.ensureLoaded();
    return this.pinned.has(id);
  }
  isFavorite(id: string): boolean {
    void this.ensureLoaded();
    return this.favorites.has(id);
  }
  togglePin(id: string): boolean {
    void this.ensureLoaded();
    if (this.pinned.has(id)) {
      this.pinned.delete(id);
    } else {
      if (this.pinned.size >= 2) return false;
      this.pinned.add(id);
    }
    void Storage.setPinned(Array.from(this.pinned));
    return true;
  }
  toggleFavorite(id: string): void {
    void this.ensureLoaded();
    if (this.favorites.has(id)) this.favorites.delete(id);
    else this.favorites.add(id);
    void Storage.setFavorites(Array.from(this.favorites));
  }
}

export function getEchoRepository(): EchoRepository {
  // For now return legacy adapter; switch to SQLite impl later
  return new LegacyEchoRepository();
}


