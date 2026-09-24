"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");

export default function HeroCountdown({ endsAt }: { endsAt: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(endsAt).getTime();
    if (!Number.isFinite(end)) return;

    const tick = () => setRemaining(Math.max(0, end - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  if (remaining === null || remaining <= 0) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <div
      role="timer"
      aria-label="Offer ends in"
      className="inline-flex items-center gap-1.5 rounded-xl bg-black/45 px-3 py-2 text-white backdrop-blur-sm"
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide text-white/70">
        Ends in
      </span>
      {days > 0 && (
        <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-xs font-bold tabular-nums">
          {days}d
        </span>
      )}
      <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-xs font-bold tabular-nums">
        {pad(hours)}h
      </span>
      <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-xs font-bold tabular-nums">
        {pad(minutes)}m
      </span>
      <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-xs font-bold tabular-nums">
        {pad(seconds)}s
      </span>
    </div>
  );
}
