import type { Metadata } from "next";
import { SportsDirectory } from "@/components/system/sports-directory";

export const metadata: Metadata = {
  title: "Sports",
  description: "Browse every live sport and category available on PPV.st."
};

export default function SportsPage() {
  return <SportsDirectory />;
}
