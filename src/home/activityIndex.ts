import type { Echo, EchoActivity } from "@/types/echo";

export function buildLastActivityIndex(
  echoes: Echo[],
  activities: EchoActivity[]
): Record<string, number> {
  const lastFor: Record<string, number> = {};

  // Seed with echo updatedAt/createdAt
  for (const e of echoes) {
    const updated = e.updatedAt ? new Date(e.updatedAt).getTime() : 0;
    const created = e.createdAt ? new Date(e.createdAt).getTime() : 0;
    lastFor[e.id] = Math.max(updated, created);
  }

  // Apply activities timestamps
  for (const a of activities) {
    const ts = new Date(a.timestamp).getTime();
    const prev = lastFor[a.echoId] ?? 0;
    if (ts > prev) lastFor[a.echoId] = ts;
  }

  return lastFor;
}


