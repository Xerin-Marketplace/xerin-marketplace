/**
 * Xerin Engagement Orchestrator
 *
 * One central place deciding WHEN the customer is interrupted:
 *   Priority 1 — checkout/auth requirements
 *   Priority 2 — Google One Tap
 *   Priority 3 — app promotion
 *   Priority 4 — marketing prompts
 *
 * Rules: only ONE interruptive experience active at a time; dismissals are
 * respected via cooldowns; guests are never blocked from browsing.
 */

// ── Visitor state ──────────────────────────────────────────────

export type VisitorState =
  | "new_visitor"
  | "returning_guest"
  | "engaged_guest"
  | "authenticated_customer";

const VISITS_KEY = "xerin_visits";

export function recordVisit(): number {
  try {
    const n = Number(localStorage.getItem(VISITS_KEY) || 0) + 1;
    localStorage.setItem(VISITS_KEY, String(n));
    return n;
  } catch {
    return 1;
  }
}

export function getVisitorState(isAuthenticated: boolean): VisitorState {
  if (isAuthenticated) return "authenticated_customer";
  let visits = 0;
  try {
    visits = Number(localStorage.getItem(VISITS_KEY) || 0);
  } catch {}
  if (visits <= 1) return "new_visitor";
  // "engaged" — has interacted enough that gentle prompts are fair game.
  const engaged = visits >= 3;
  return engaged ? "engaged_guest" : "returning_guest";
}

// ── Suppression / cooldown registry ────────────────────────────

type PromptKind = "one_tap" | "auth_prompt" | "app_banner" | "profile_prompt";

const key = (k: PromptKind) => `xerin_suppress_${k}`;

export function suppressPrompt(kind: PromptKind, ms: number) {
  try {
    localStorage.setItem(key(kind), String(Date.now() + ms));
  } catch {}
}

export function isPromptSuppressed(kind: PromptKind): boolean {
  try {
    return Number(localStorage.getItem(key(kind)) || 0) > Date.now();
  } catch {
    return true;
  }
}

// ── Prompt mutex — only one interruptive UX at a time ──────────

let activePrompt: PromptKind | null = null;

/** Returns true if this prompt may show; claims the slot atomically. */
export function claimPrompt(kind: PromptKind): boolean {
  if (activePrompt) return false;
  if (isPromptSuppressed(kind)) return false;
  activePrompt = kind;
  return true;
}

export function releasePrompt(kind: PromptKind) {
  if (activePrompt === kind) activePrompt = null;
}

export function hasActivePrompt() {
  return activePrompt !== null;
}

// ── Rules ──────────────────────────────────────────────────────

export const EngagementRules = {
  oneTap: {
    enabled: true,
    dismissCooldownMs: 24 * 60 * 60 * 1000,
    skipCooldownMs: 2 * 60 * 60 * 1000,
    skipPathPrefixes: [
      "/signin", "/signup", "/forgot-password", "/reset-password", "/verify-otp",
      "/choose-role", "/onboarding", "/checkout", "/admin", "/seller", "/broker",
      "/logistics", "/account", "/order-success", "/payment-success", "/payment-failed",
    ],
  },
  authPrompt: {
    cooldownMs: 30 * 60 * 1000, // don't reopen instantly after a dismiss
  },
  appBanner: {
    enabled: true,
    dismissCooldownMs: 7 * 24 * 60 * 60 * 1000, // "Maybe later" → 7 days
    minVisitsBeforeShow: 2,
    eligiblePaths: ["/", "/products/", "/category/", "/order-success/", "/track"],
    blockedPaths: ["/checkout", "/signin", "/signup", "/verify-otp", "/admin", "/seller", "/broker", "/logistics"],
  },
} as const;

// ── App config (env-driven; nothing hard-coded) ────────────────

export const appConfig = {
  androidUrl: process.env.NEXT_PUBLIC_ANDROID_APP_URL || "",
  iosUrl: process.env.NEXT_PUBLIC_IOS_APP_URL || "",
  deepLinkScheme: process.env.NEXT_PUBLIC_APP_DEEP_LINK_SCHEME || "xerin",
};

export function isMobileBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
}

export function isIOS(): boolean {
  return typeof navigator !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Platform-appropriate store link, or null when nothing is configured. */
export function appStoreUrl(): string | null {
  if (isAndroid() && appConfig.androidUrl) return appConfig.androidUrl;
  if (isIOS() && appConfig.iosUrl) return appConfig.iosUrl;
  return appConfig.androidUrl || appConfig.iosUrl || null;
}

/** Map a storefront path to a deep link inside the Xerin app. */
export function appDeepLink(path: string): string {
  const s = appConfig.deepLinkScheme;
  if (path.startsWith("/products/")) return `${s}://product/${path.split("/")[2]}`;
  if (path.startsWith("/cart")) return `${s}://cart`;
  if (path.startsWith("/account/orders")) return `${s}://orders`;
  if (path.startsWith("/account")) return `${s}://account`;
  if (path.startsWith("/category/")) return `${s}://category/${path.split("/")[2]}`;
  if (path.startsWith("/stores/")) return `${s}://store/${path.split("/")[2]}`;
  if (path.startsWith("/order-success/")) return `${s}://orders`;
  return `${s}://home`;
}

// ── Lightweight event tracking (no secrets, no PII beyond action names) ──

export type EngagementEvent =
  | "google_one_tap_initialized"
  | "google_one_tap_displayed"
  | "google_one_tap_skipped"
  | "google_one_tap_dismissed"
  | "google_auth_started"
  | "google_auth_success"
  | "google_auth_failed"
  | "smart_auth_displayed"
  | "smart_auth_dismissed"
  | "smart_auth_completed"
  | "app_prompt_displayed"
  | "app_prompt_dismissed"
  | "app_open_clicked"
  | "app_store_clicked"
  | "checkout_auth_required"
  | "guest_cart_merged"
  | "profile_completion_prompted";

export function trackEvent(event: EngagementEvent, detail?: Record<string, string | number | boolean>) {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[xerin:engagement] ${event}`, detail ?? "");
  }
}

// ── Profile completion ─────────────────────────────────────────

const PROFILE_PROMPT_KEY = "xerin_profile_prompt_seen";
const PROFILE_PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

/**
 * Soft post-login nudge for a profile missing a phone number — a toast with
 * an action, never a blocking form. Once per 24h.
 */
export function maybeNudgeProfileCompletion(user: { phone?: string | null } | null | undefined) {
  if (!user || user.phone) return;
  try {
    if (Number(localStorage.getItem(PROFILE_PROMPT_KEY) || 0) > Date.now()) return;
    localStorage.setItem(PROFILE_PROMPT_KEY, String(Date.now() + PROFILE_PROMPT_COOLDOWN_MS));
  } catch {
    return;
  }
  // Lazy import to avoid a hard toast dependency in this module's users.
  void import("react-hot-toast").then(({ default: toast }) => {
    toast("Your account is ready. Add your phone number for faster checkout and delivery updates.", {
      duration: 6000,
      icon: "📱",
    });
    trackEvent("profile_completion_prompted");
  });
}
