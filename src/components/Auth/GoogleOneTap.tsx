"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api/endpoints/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { getPostLoginPath } from "@/guards/auth-routing";
import { GOOGLE_CLIENT_ID, loadGoogleScript, type GoogleCredentialResponse } from "@/lib/google-gis";

const SUPPRESS_KEY = "xerin_one_tap_suppressed_until";
const SUPPRESS_DISMISSED_MS = 24 * 60 * 60 * 1000; // user explicitly dismissed → 24h
const SUPPRESS_SKIPPED_MS = 2 * 60 * 60 * 1000; // browser didn't show it → 2h

// Pages where an unsolicited auth prompt is the wrong UX — the user is
// already inside an auth flow, a workspace, or checkout.
const SKIP_PREFIXES = [
  "/signin", "/signup", "/forgot-password", "/reset-password", "/verify-otp",
  "/choose-role", "/onboarding", "/checkout", "/admin", "/seller", "/broker",
  "/logistics", "/account", "/order-success", "/payment-success", "/payment-failed",
];

const isSuppressed = () => {
  try {
    const until = Number(localStorage.getItem(SUPPRESS_KEY) || 0);
    return until > Date.now();
  } catch {
    return true; // storage unavailable → don't nag
  }
};

const suppressFor = (ms: number) => {
  try {
    localStorage.setItem(SUPPRESS_KEY, String(Date.now() + ms));
  } catch {}
};

/**
 * Official Google One Tap for unauthenticated guests.
 * Google/browser decide whether the prompt actually appears — this component
 * only initializes + calls prompt() once per eligible page view, tracks the
 * moment outcome to respect dismissals, and never blocks browsing.
 */
export default function GoogleOneTap() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setSession, mergeGuestCart } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const promptedForPath = useRef<string | null>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !hasHydrated || isAuthenticated) return;
    if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return;
    if (promptedForPath.current === pathname) return;
    promptedForPath.current = pathname;
    if (isSuppressed()) return;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp: GoogleCredentialResponse) => {
            if (!resp.credential) return;
            try {
              const session = await authApi.loginWithGoogle(resp.credential);
              setSession(session);
              if (getPostLoginPath("/account", session.user) === "/account") {
                await mergeGuestCart().catch(() => {});
              }
              const destination = getPostLoginPath(searchParams.get("redirect"), session.user);
              toast.success("Signed in with Google.");
              router.push(destination);
            } catch (error) {
              toast.error(error instanceof ApiError ? error.message : "Google sign-in failed.");
            }
          },
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });
        window.google.accounts.id.prompt((moment) => {
          if (moment.isDismissedMoment()) suppressFor(SUPPRESS_DISMISSED_MS);
          else if (moment.isNotDisplayed() || moment.isSkippedMoment()) suppressFor(SUPPRESS_SKIPPED_MS);
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hasHydrated, isAuthenticated]);

  return null;
}
