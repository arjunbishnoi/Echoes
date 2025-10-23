import type { Echo } from "@/types/echo";

export function sortEchoesForHome(
  echoes: Echo[],
  pinnedIds: Set<string> | ((id: string) => boolean)
): Echo[] {
  const isPinned = typeof pinnedIds === "function" ? pinnedIds : (id: string) => pinnedIds.has(id);

  const pinned: Echo[] = [];
  const unpinned: Echo[] = [];

  echoes.forEach((echo) => {
    if (isPinned(echo.id)) {
      pinned.push(echo);
    } else {
      unpinned.push(echo);
    }
  });

  unpinned.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return [...pinned, ...unpinned];
}
