"use client";

import React, { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, ArrowRight01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export type TourStep = {
 title: string;
 body: string;
};

const storageKey = (tourId: string) => `xerin_tour_done_${tourId}`;

export function useTour(tourId: string) {
 const [active, setActive] = useState(false);

 useEffect(() => {
 try {
 if (!window.localStorage.getItem(storageKey(tourId))) setActive(true);
 } catch {
 /* storage unavailable */
 }
 }, [tourId]);

 const finish = () => {
 try {
 window.localStorage.setItem(storageKey(tourId), "1");
 } catch {
 /* storage unavailable */
 }
 setActive(false);
 };

 const replay = () => setActive(true);

 return { active, finish, replay };
}

type OnboardingTourProps = {
 steps: TourStep[];
 active: boolean;
 onFinish: () => void;
};

/**
 * Short first-time tour · a small card (not a spotlight trap).
 * Skippable, persistent via localStorage, ESC closes.
 */
export default function OnboardingTour({ steps, active, onFinish }: OnboardingTourProps) {
 const [index, setIndex] = useState(0);

 useEffect(() => {
 if (active) setIndex(0);
 }, [active]);

 useEffect(() => {
 if (!active) return;
 const onKey = (e: KeyboardEvent) => {
 if (e.key === "Escape") onFinish();
 if (e.key === "ArrowRight") setIndex((i) => Math.min(steps.length - 1, i + 1));
 if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
 };
 document.addEventListener("keydown", onKey);
 return () => document.removeEventListener("keydown", onKey);
 }, [active, steps.length, onFinish]);

 if (!active || steps.length === 0) return null;

 const step = steps[index];
 const last = index === steps.length - 1;

 return (
 <div
 role="dialog"
 aria-modal="false"
 aria-label="Getting started tour"
 className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-sm rounded-xl border border-border bg-card p-5 shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6"
 >
 <div className="flex items-start justify-between gap-3">
 <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
 {index + 1} of {steps.length}
 </p>
 <button
 type="button"
 onClick={onFinish}
 aria-label="Close tour"
 className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
 >
 <HugeiconsIcon icon={Cancel01Icon} size={15} />
 </button>
 </div>

 <h3 className="mt-2 text-sm font-bold text-card-foreground">{step.title}</h3>
 <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{step.body}</p>

 <div className="mt-2 flex gap-1" aria-hidden="true">
 {steps.map((_, i) => (
 <span
 key={i}
 className={`h-1 flex-1 rounded-full ${i <= index ? "bg-primary" : "bg-muted"}`}
 />
 ))}
 </div>

 <div className="mt-4 flex items-center justify-between">
 <button
 type="button"
 onClick={onFinish}
 className="text-xs font-semibold text-muted-foreground transition hover:text-foreground"
 >
 Skip
 </button>
 <div className="flex items-center gap-2">
 {index > 0 && (
 <button
 type="button"
 onClick={() => setIndex((i) => i - 1)}
 className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-muted"
 >
 <HugeiconsIcon icon={ArrowLeft01Icon} size={12} /> Back
 </button>
 )}
 <button
 type="button"
 onClick={() => (last ? onFinish() : setIndex((i) => i + 1))}
 className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
 >
 {last ? "Finish" : "Next"} <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
 </button>
 </div>
 </div>
 </div>
 );
}
