import type { Echo } from "../types/echo";

export type EchoFilterType = "recent" | "locked" | "completed" | "all";

export function filterEchoesByStatus(echoes: Echo[], filter: EchoFilterType): Echo[] {
  switch (filter) {
    case "recent":
      return echoes.filter(c => c.status === "ongoing");
    case "locked":
      return echoes.filter(c => c.status === "locked");
    case "completed":
      return echoes.filter(c => c.status === "unlocked");
    case "all":
    default:
      return echoes;
  }
}

export function searchEchoes(echoes: Echo[], query: string): Echo[] {
  const q = query.trim().toLowerCase();
  if (!q) return echoes;
  return echoes.filter(c => c.title.toLowerCase().includes(q));
}

export function computeEchoProgressPercent(echo: Echo): number {
  const created = echo.createdAt ? new Date(echo.createdAt).getTime() : undefined;
  const lockMs = echo.lockDate ? new Date(echo.lockDate).getTime() : undefined;
  const unlockMs = echo.unlockDate ? new Date(echo.unlockDate).getTime() : undefined;

  if (!created || (!lockMs && !unlockMs)) return 0;

  if (lockMs && Date.now() <= lockMs) {
    const span = lockMs - created;
    if (span <= 0) return 0;
    return Math.min(1, Math.max(0, (Date.now() - created) / span));
  }

  if (unlockMs && lockMs) {
    const span = unlockMs - lockMs;
    if (span <= 0) return 1;
    return Math.min(1, Math.max(0, (Date.now() - lockMs) / span));
  }

  if (unlockMs && !lockMs) {
    const span = unlockMs - created;
    if (span <= 0) return 0;
    return Math.min(1, Math.max(0, (Date.now() - created) / span));
  }

  return 0;
}
