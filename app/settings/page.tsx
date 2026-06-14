import type { Metadata } from "next";
import { SettingsView } from "@/components/system/settings-view";

export const metadata: Metadata = {
  title: "Settings Control Panel",
  description: "Configure system settings, animation preferences, default filters, and clear search history."
};

export default function SettingsPage() {
  return <SettingsView />;
}
