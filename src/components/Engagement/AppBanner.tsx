"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, PhoneIcon } from "@hugeicons/core-free-icons";
import { useAuthStore } from "@/store/useAuthStore";
import {
  EngagementRules,
  appDeepLink,
  appStoreUrl,
  claimPrompt,
  getVisitorState,
  hasActivePrompt,
  isMobileBrowser,
  isPromptSuppressed,
  releasePrompt,
  suppressPrompt,
  trackEvent,
} from "@/lib/engagement";

const rules = EngagementRules.appBanner;
const SHOW_DELAY_MS = 8000; // only after the visitor has settled into the page

/**
 * Smart app promotion — mobile web only, engagement-gated, single-slot via
 * the orchestrator mutex. Tries a context-aware deep link first (xerin://…)
 * and falls back to the configured store URL when the app isn't installed.
 * "Maybe later" suppresses for 7 days. Renders nothing on desktop, on
 * workspace routes, while another prompt is active, or when no store URL
 * is configured.
 */
export default function AppBanner() {
  const pathname = usePathname();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const [visible, setVisible] = useState(false);
  const timer = useRef<number | null>(null);

  const storeUrl = appStoreUrl();
  const eligiblePath =
    rules.eligiblePaths.some((p) => (p.endsWith("/") ? pathname.startsWith(p) : pathname === p)) &&
    !rules.blockedPaths.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!rules.enabled || !hasHydrated || !isMobileBrowser() || !storeUrl) return;
    if (!eligiblePath || isPromptSuppressed("app_banner")) return;
    if (getVisitorState(useAuthStore.getState().isAuthenticated) === "new_visitor") return;

    // Only after meaningful engagement: n-th visit or returning pages like
    // order tracking/success are intrinsically app-relevant.
    timer.current = window.setTimeout(() => {
      if (hasActivePrompt()) return;
      if (!claimPrompt("app_banner")) return;
      trackEvent("app_prompt_displayed", { path: pathname });
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hasHydrated]);

  if (!visible || !storeUrl) return null;

  const close = (dismissed: boolean) => {
    setVisible(false);
    releasePrompt("app_banner");
    if (dismissed) {
      suppressPrompt("app_banner", rules.dismissCooldownMs);
      trackEvent("app_prompt_dismissed");
    }
  };

  const open = () => {
    trackEvent("app_open_clicked", { path: pathname });
    const deepLink = appDeepLink(pathname);
    // Attempt deep link; fall back to the store when nothing claims it.
    const start = Date.now();
    const onVisibility = () => {
      if (document.hidden) clearTimeout(fallback);
    };
    const fallback = window.setTimeout(() => {
      if (Date.now() - start < 2500 && !document.hidden) {
        window.open(storeUrl, "_blank", "noopener");
      }
    }, 1800);
    document.addEventListener("visibilitychange", onVisibility, { once: true });
    window.location.href = deepLink;
    close(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[8500] px-3 pb-3 sm:px-4" role="region" aria-label="Xerin app promotion">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-2xl">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10">
          <Image src="/images/logo/xerin-logo-mark.png" alt="Xerin" width={40} height={40} className="object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">Get the Xerin app</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            Shop faster, track orders and manage your account easily.
          </p>
        </div>
        <button
          onClick={open}
          className="shrink-0 rounded-lg bg-orange px-3.5 py-2 text-xs font-bold text-white transition hover:bg-primary/90-dark"
        >
          <HugeiconsIcon icon={PhoneIcon} size={12} className="mr-1 inline" />Open App
        </button>
        <button
          onClick={() => close(true)}
          aria-label="Maybe later"
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>
      </div>
    </div>
  );
}
