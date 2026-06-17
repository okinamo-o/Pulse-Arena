import type { Metadata } from "next";
import { LiveDashboard } from "@/components/home/live-dashboard";

export const metadata: Metadata = {
  title: "Live Sports",
  description: "Live sports matches ranked by activity, source availability, and heat index."
};

export default function LivePage() {
  return <LiveDashboard />;
}
