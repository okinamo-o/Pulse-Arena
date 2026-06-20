import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/app/providers";
import { AppShell } from "@/components/layout/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap"
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://pulse-arena.local"),
  title: {
    default: "Pulse Arena - Live Sports Streaming Discovery",
    template: "%s - Pulse Arena"
  },
  description: "A premium live sports streaming discovery platform powered by the Streamed public API.",
  applicationName: "Pulse Arena",
  keywords: ["sports streaming", "live sports", "football streams", "basketball streams", "match discovery"],
  authors: [{ name: "Pulse Arena" }],
  openGraph: {
    title: "Pulse Arena",
    description: "Find the strongest live sports moments instantly.",
    type: "website",
    siteName: "Pulse Arena"
  },
  twitter: {
    card: "summary_large_image",
    title: "Pulse Arena",
    description: "Find the strongest live sports moments instantly."
  }
};

export const viewport: Viewport = {
  themeColor: "#07090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
