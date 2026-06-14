import type { Metadata } from "next";
import { SearchView } from "@/components/system/search-view";

export const metadata: Metadata = {
  title: "Search",
  description: "Instant fuzzy search across live and upcoming sports streams."
};

export default function SearchPage() {
  return <SearchView />;
}
