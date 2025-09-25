export type Capsule = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  // Participants represent collaborators for shared echoes.
  // Private echoes have zero participants.
  participants?: string[];
  description?: string;
  status?: "ongoing" | "locked" | "unlocked";
};


