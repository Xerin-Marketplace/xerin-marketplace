"use client";
import React, { useState, useRef, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { GlobeIcon, ArrowDown01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/app/context/LanguageContext";
import { LANGUAGES } from "@/lib/i18n/dictionary";

const FLAGS: Record<string, string> = { en: "🇬🇧", sw: "🇹🇿" };

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("header_language")}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
      >
        <HugeiconsIcon icon={GlobeIcon} size={15} className="text-primary" />
        {compact ? current.code.toUpperCase() : current.native}
        <HugeiconsIcon icon={ArrowDown01Icon} size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <p className="border-b border-border px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {t("header_language")}
          </p>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors hover:bg-muted ${
                l.code === lang ? "font-semibold text-primary" : "text-foreground"
              }`}
            >
              <span className="text-base leading-none">{FLAGS[l.code]}</span>
              <span className="flex-1 text-left">{l.native}</span>
              {l.code === lang && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
