import type { Metadata } from "next";
import { HomeHub } from "@/components/home/home-hub";

export const metadata: Metadata = {
  title: "Pulse Arena - Live Sports Streaming Discovery",
  description: "A premium live sports streaming discovery platform."
};

export default function HomePage() {
  return <HomeHub />;
}
