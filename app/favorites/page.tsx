import type { Metadata } from "next";
import { FavoritesView } from "@/components/system/favorites-view";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Saved matches, favorite sports, reminders, and smart recommendations."
};

export default function FavoritesPage() {
  return <FavoritesView />;
}
