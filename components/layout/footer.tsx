"use client";

import Link from "next/link";
import { Activity, Github, Facebook, Instagram, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-graphite-950/72 backdrop-blur-2xl">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand block */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link href="/" className="group flex items-center gap-3" aria-label="Pulse Arena home">
              <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-signal-lime text-graphite-950 shadow-glow">
                <Activity className="h-4.5 w-4.5" aria-hidden="true" />
                <span className="absolute inset-0 bg-gradient-to-br from-white/35 to-transparent" />
              </span>
              <span className="leading-none">
                <span className="block text-xs font-black uppercase tracking-[0.18em] text-white">Pulse</span>
                <span className="block text-[0.6rem] font-bold uppercase tracking-[0.34em] text-signal-lime">Arena</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm text-white/50 leading-relaxed">
              A premium, high-octane live sports command center. Track, anticipate, and stream your favorite matches instantly.
            </p>
          </div>

          {/* Links block 1 */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/38 mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="text-white/62 hover:text-signal-lime transition">
                  Home Hub
                </Link>
              </li>
              <li>
                <Link href="/live" className="text-white/62 hover:text-signal-lime transition">
                  Live Matches
                </Link>
              </li>
              <li>
                <Link href="/sports" className="text-white/62 hover:text-signal-lime transition">
                  Sports Directory
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-white/62 hover:text-signal-lime transition">
                  Favorites & Reminders
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-white/62 hover:text-signal-lime transition">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Links block 2 */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/38 mb-4">Connected</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="https://github.com/okinamo-o" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/62 hover:text-signal-lime transition">
                  <Github className="h-4 w-4" /> Github
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/louay.hamdi.52056" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/62 hover:text-signal-lime transition">
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/okinamo_o/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-white/62 hover:text-signal-lime transition">
                  <Instagram className="h-4 w-4" /> Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.06] pt-8 md:flex-row md:items-center md:justify-between text-xs text-white/38">
          <p>
            &copy; {new Date().getFullYear()} Pulse Arena. All rights reserved. Powered by Streamed API.
          </p>
          <p className="flex items-center gap-1.5">
            Designed for live action with <Heart className="h-3 w-3 text-signal-red fill-signal-red" />
          </p>
        </div>
      </div>
    </footer>
  );
}
