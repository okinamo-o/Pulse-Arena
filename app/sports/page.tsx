import type { Metadata } from "next";
import { SportsDirectory } from "@/components/system/sports-directory";

export const metadata: Metadata = {
  title: "Sports",
  description: "Browse every sport available from the Streamed public API."
};

export default function SportsPage() {
  return <SportsDirectory />;
}
