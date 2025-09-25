import type { Capsule } from "../types/capsule";

export type CapsuleFilter = "recent" | "locked" | "completed" | "all";

export function filterCapsulesByStatus(capsules: Capsule[], filter: CapsuleFilter): Capsule[] {
  switch (filter) {
    case "recent":
      return capsules.filter(c => c.status === "ongoing");
    case "locked":
      return capsules.filter(c => c.status === "locked");
    case "completed":
      return capsules.filter(c => c.status === "unlocked");
    case "all":
    default:
      return capsules;
  }
}

export function searchCapsules(capsules: Capsule[], query: string): Capsule[] {
  const q = query.trim().toLowerCase();
  if (!q) return capsules;
  return capsules.filter(c => c.title.toLowerCase().includes(q));
}

export function computeCapsuleProgressPercent(capsule: Capsule): number {
  // Mirrors previous deterministic pseudo-random progress used across the app
  return ((Number(capsule.id) * 3) % 10) / 10;
}


