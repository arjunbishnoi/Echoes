import type { Capsule } from "../types/capsule";

export const dummyCapsules: Capsule[] = Array.from({ length: 10 }, (_, index) => {
  const number = index + 1;
  return {
    id: String(number),
    title: `Time Capsule ${number}`,
    subtitle: `Created on 2025-09-${String(number).padStart(2, "0")}`,
  };
});


