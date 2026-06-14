"use client";

import Link from "next/link";
import { Bell, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassPanel } from "@/components/ui/glass-panel";
import { MatchCard } from "@/components/match/match-card";
import { useAllMatches, useSports } from "@/hooks/use-streamed";
import { useFavoritesStore } from "@/store/favorites-store";
import { useRemindersStore } from "@/store/reminders-store";
import { formatMatchDate } from "@/lib/streamed/selectors";

export function FavoritesView() {
  const { data: matches = [] } = useAllMatches();
  const { data: sports = [] } = useSports();
  const favoriteMatchIds = useFavoritesStore((state) => state.favoriteMatchIds);
  const favoriteSports = useFavoritesStore((state) => state.favoriteSports);
  const toggleSport = useFavoritesStore((state) => state.toggleSport);
  const reminders = useRemindersStore((state) => state.reminders);
  const removeReminder = useRemindersStore((state) => state.removeReminder);

  const favoriteMatches = matches.filter((match) => favoriteMatchIds.includes(match.id));
  const recommended = matches
    .filter((match) => favoriteSports.includes(match.category) || favoriteMatchIds.includes(match.id))
    .slice(0, 12);

  return (
    <main className="container-page pb-24 pt-32 md:pb-16">
      <section className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-panel backdrop-blur-2xl">
        <Badge variant="live">
          <Star className="h-3.5 w-3.5" aria-hidden="true" />
          Personalized homepage
        </Badge>
        <h1 className="mt-5 text-balance font-display text-5xl font-black uppercase leading-[0.92] text-white md:text-7xl">
          Your saved sports command deck
        </h1>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase text-white">Favorite matches</h2>
            <Badge variant="cyan">{favoriteMatches.length} saved</Badge>
          </div>
          {favoriteMatches.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {favoriteMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <EmptyPanel
              icon={Star}
              title="No saved matches yet"
              action={
                <Button asChild>
                  <Link href="/live">Browse live matches</Link>
                </Button>
              }
            />
          )}
        </div>
        <aside className="space-y-5">
          <GlassPanel className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-signal-orange" aria-hidden="true" />
              <h2 className="font-black uppercase text-white">Reminders</h2>
            </div>
            <div className="space-y-2">
              {reminders.length > 0 ? (
                reminders
                  .slice()
                  .sort((a, b) => a.date - b.date)
                  .map((reminder) => (
                    <div key={reminder.matchId} className="rounded-lg border border-white/10 bg-black/20 p-3">
                      <p className="text-sm font-bold text-white">{reminder.title}</p>
                      <p className="mt-1 text-xs text-white/46">{formatMatchDate(reminder.date)}</p>
                      <button
                        className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-signal-orange"
                        onClick={() => removeReminder(reminder.matchId)}
                      >
                        Remove
                      </button>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-white/52">Set reminders from any match card or match center.</p>
              )}
            </div>
          </GlassPanel>
          <GlassPanel className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-signal-lime" aria-hidden="true" />
              <h2 className="font-black uppercase text-white">Favorite sports</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {sports.map((sport) => {
                const selected = favoriteSports.includes(sport.id);
                return (
                  <button
                    key={sport.id}
                    className={`rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-[0.13em] transition ${
                      selected ? "border-signal-lime bg-signal-lime text-graphite-950" : "border-white/10 bg-white/[0.06] text-white/58"
                    }`}
                    onClick={() => toggleSport(sport.id)}
                  >
                    {sport.name}
                  </button>
                );
              })}
            </div>
          </GlassPanel>
        </aside>
      </section>

      {recommended.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-black uppercase text-white">Smart recommendations</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommended.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  action
}: {
  icon: typeof Star;
  title: string;
  action: React.ReactNode;
}) {
  return (
    <GlassPanel className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
      <Icon className="h-10 w-10 text-signal-lime" aria-hidden="true" />
      <h3 className="mt-4 text-2xl font-black uppercase text-white">{title}</h3>
      <div className="mt-6">{action}</div>
    </GlassPanel>
  );
}
