import type { Metadata } from "next";
import { LiveDashboard } from "@/components/home/live-dashboard";
import { getLiveMatches, getSports } from "@/lib/streamed/client";

export const revalidate = 20;

export const metadata: Metadata = {
  title: "Live Sports",
  description: "Live sports matches ranked by activity, source availability, and heat index."
};

export default async function LivePage() {
  const [matches, sports] = await Promise.all([getLiveMatches(), getSports()]);
  return <LiveDashboard matches={matches} sports={sports} />;
}
