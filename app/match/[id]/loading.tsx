export default function MatchLoading() {
  return (
    <main className="container-page min-h-screen pb-24 pt-32 md:pb-16">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-graphite-900/60 p-12 text-center shadow-panel backdrop-blur-xl md:p-20">
        <div className="absolute -left-16 -top-16 h-32 w-32 rounded-full bg-signal-lime/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-signal-orange/10 blur-3xl" />
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-lime/30 opacity-75" />
            <span className="relative inline-flex h-8 w-8 rounded-full bg-signal-lime shadow-glow" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-lime/10 px-3 py-1 text-[0.68rem] font-bold tracking-widest text-signal-lime animate-pulse border border-signal-lime/20">
              <span className="h-1.5 w-1.5 rounded-full bg-signal-lime animate-ping" />
              LOADING MATCH CENTER
            </span>
            <h3 className="font-display text-sm font-black uppercase tracking-[0.25em] text-white">
              Scanning Match Data
            </h3>
          </div>
        </div>
      </div>
    </main>
  );
}
