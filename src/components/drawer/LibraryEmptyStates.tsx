import EmptyState from "@/components/ui/EmptyState";

export function OngoingEmptyState() {
  return (
    <EmptyState
      icon="time-outline"
      title="No Ongoing Echoes"
      subtitle="Create your first echo to get started"
    />
  );
}

export function LockedEmptyState() {
  return (
    <EmptyState
      icon="lock-closed-outline"
      title="No Locked Echoes"
      subtitle="Echoes will appear here when they're locked"
    />
  );
}

export function UnlockedEmptyState() {
  return (
    <EmptyState
      icon="lock-open-outline"
      title="No Unlocked Echoes"
      subtitle="Unlocked echoes will appear here"
    />
  );
}

export function AllEmptyState() {
  return (
    <EmptyState
      icon="albums-outline"
      title="No Echoes Yet"
      subtitle="Start creating echoes to build your collection"
    />
  );
}

export function SearchEmptyState() {
  return (
    <EmptyState
      icon="search-outline"
      title="No Results Found"
      subtitle="Try a different search term"
    />
  );
}

