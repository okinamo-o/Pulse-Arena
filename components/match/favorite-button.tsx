"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StreamedMatch } from "@/lib/streamed/types";
import { useFavoritesStore } from "@/store/favorites-store";

export function FavoriteButton({ match, compact = false }: { match: StreamedMatch; compact?: boolean }) {
  const isFavorite = useFavoritesStore((state) => state.isMatchFavorite(match.id));
  const toggleMatch = useFavoritesStore((state) => state.toggleMatch);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const active = mounted ? isFavorite : false;

  return (
    <Button
      type="button"
      variant={active ? "default" : "secondary"}
      size={compact ? "icon" : "default"}
      aria-pressed={active}
      aria-label={active ? `Remove ${match.title} from favorites` : `Save ${match.title}`}
      onClick={(event) => {
        event.preventDefault();
        toggleMatch(match.id);
      }}
    >
      <Star className="h-4 w-4" aria-hidden="true" />
      {compact ? null : active ? "Saved" : "Save"}
    </Button>
  );
}
