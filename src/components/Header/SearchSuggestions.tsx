"use client";

import React, { useEffect, useRef, useState } from "react";
import { discoveryApi } from "@/lib/api/endpoints/discovery";
import type { TrendingSearchItem } from "@/types/api/discovery";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Search01Icon,
  FireIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

const RECENT_KEY = "xerin_recent_searches";
const MAX_RECENT = 6;

const readRecent = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string").slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
};

export const saveRecentSearch = (term: string) => {
  const value = term.trim();
  if (!value) return;
  try {
    const next = [value, ...readRecent().filter((v) => v.toLowerCase() !== value.toLowerCase())].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
};

type Props = {
  query: string;
  onPick: (term: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
};

const SearchSuggestions = ({ query, onPick, onClose, anchorRef }: Props) => {
  const [recent, setRecent] = useState<string[]>([]);
  const [trending, setTrending] = useState<TrendingSearchItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);

  // Focus state: recent + trending (only fetched once per open)
  useEffect(() => {
    setRecent(readRecent());
    discoveryApi
      .trending(6)
      .then((rows) => setTrending(Array.isArray(rows) ? rows : []))
      .catch(() => setTrending([]));
  }, []);

  // Debounced live suggestions
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }
    const handle = window.setTimeout(() => {
      discoveryApi
        .suggestions(term, 8)
        .then((data) => setSuggestions(data.suggestions || []))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => window.clearTimeout(handle);
  }, [query]);

  // Click outside
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        rootRef.current && !rootRef.current.contains(target) &&
        anchorRef.current && !anchorRef.current.contains(target)
      ) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [anchorRef, onClose]);

  const flatItems: { kind: "suggestion" | "recent" | "trending"; label: string }[] =
    query.trim().length >= 2
      ? suggestions.map((label) => ({ kind: "suggestion" as const, label }))
      : [
          ...recent.map((label) => ({ kind: "recent" as const, label })),
          ...trending
            .filter((t) => !recent.some((r) => r.toLowerCase() === t.term.toLowerCase()))
            .map((t) => ({ kind: "trending" as const, label: t.term })),
        ];

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") return onClose();
      if (!flatItems.length) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % flatItems.length);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
      } else if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        onPick(flatItems[activeIndex].label);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatItems.length, activeIndex, onPick, onClose]);

  const removeRecent = (term: string) => {
    const next = recent.filter((v) => v !== term);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  };

  if (!flatItems.length) return null;

  let rowIndex = -1;

  return (
    <div
      ref={rootRef}
      role="listbox"
      aria-label="Search suggestions"
      className="absolute left-0 right-0 top-[calc(100%+8px)] z-[130] overflow-hidden rounded-xl border border-border bg-card shadow-lg"
    >
      {flatItems.map((item) => {
        rowIndex += 1;
        const index = rowIndex;
        const active = index === activeIndex;
        return (
          <button
            key={`${item.kind}-${item.label}`}
            type="button"
            role="option"
            aria-selected={active}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => onPick(item.label)}
            className={`group flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
              active ? "bg-primary/10" : ""
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <HugeiconsIcon
                icon={item.kind === "trending" ? FireIcon : item.kind === "recent" ? Clock01Icon : Search01Icon}
                size={14}
              />
            </span>
            <span className="min-w-0 flex-1 truncate font-medium text-foreground">
              {item.label}
            </span>
            {item.kind === "recent" && (
              <span
                role="button"
                aria-label={`Remove ${item.label} from recent searches`}
                onClick={(event) => {
                  event.stopPropagation();
                  removeRecent(item.label);
                }}
                className="rounded p-1 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={13} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SearchSuggestions;
