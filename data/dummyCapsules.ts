import type { Capsule } from "../types/capsule";

const stockImages = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493558103817-58b2924bce98?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop",
];

export const dummyCapsules: Capsule[] = Array.from({ length: 20 }, (_, index) => {
  const number = index + 1;
  // Status: 1-10 ongoing, 11-13 locked, 14-20 unlocked
  let status: Capsule["status"] = "ongoing";
  if (number >= 11 && number <= 13) status = "locked";
  if (number >= 14) status = "unlocked";

  // Half private, half collaborated (alternate by number)
  const isShared = number % 2 === 0;
  // Deterministic pseudo-random count between 2 and 4 for shared echoes
  const participantCount = 2 + ((number * 5) % 3); // 2..4
  const participants = isShared
    ? Array.from({ length: participantCount }, (_, i) => `https://i.pravatar.cc/100?img=${(number * (i + 3) * 5) % 70}`)
    : [];

  return {
    id: String(number),
    title: `Time Capsule ${number}`,
    subtitle: `Created on 2025-09-${String(number).padStart(2, "0")}`,
    imageUrl: stockImages[index % stockImages.length],
    participants,
    description: "Description",
    status,
  };
}).sort((a, b) => Number(b.id) - Number(a.id));


