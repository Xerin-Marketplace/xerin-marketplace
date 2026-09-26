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
import {
  EngagementRules,
  claimPrompt,
  releasePrompt,
  suppressPrompt,
  hasActivePrompt,
  getVisitorState,
  recordVisit,
  trackEvent,
  maybeNudgeProfileCompletion,
} from "@/lib/engagement";

const rules = EngagementRules.oneTap;

/**
 * Official Google One Tap for unauthenticated guests — governed by the
 * engagement orchestrator (mutex + suppression). Google/browser decide
 * whether the prompt appears; we only initialize + call prompt() once per
 * eligible visit and track the moment outcome. Never blocks browsing.
 */
export default function GoogleOneTap() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setSession, mergeGuestCart } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const prompted = useRef(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !hasHydrated || isAuthenticated || prompted.current) return;
    if (rules.skipPathPrefixes.some((p) => pathname.startsWith(p))) return;

    prompted.current = true;
    const visits = recordVisit();
    const state = getVisitorState(false);
    void visits; // visits already recorded for other consumers (app banner gating)

    loadGoogleScript()
      .then(() => {
        if (hasActivePrompt() || !window.google) return;
        trackEvent("google_one_tap_initialized", { visitor: state });
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp: GoogleCredentialResponse) => {
            if (!resp.credential) return;
            trackEvent("google_auth_started");
            try {
              const session = await authApi.loginWithGoogle(resp.credential);
              setSession(session);
              if (getPostLoginPath("/account", session.user) === "/account") {
                await mergeGuestCart().catch(() => {});
                trackEvent("guest_cart_merged");
              }
              const destination = getPostLoginPath(searchParams.get("redirect"), session.user);
              maybeNudgeProfileCompletion(session.user);
              toast.success("Signed in with Google.");
              trackEvent("google_auth_success");
              router.push(destination);
            } catch (error) {
              trackEvent("google_auth_failed");
              toast.error(error instanceof ApiError ? error.message : "Google sign-in failed.");
            } finally {
              releasePrompt("one_tap");
            }
          },
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
        });
        window.google.accounts.id.prompt((moment) => {
          if (moment.isDisplayed()) trackEvent("google_one_tap_displayed");
          else if (moment.isDismissedMoment()) {
            suppressPrompt("one_tap", rules.dismissCooldownMs);
            trackEvent("google_one_tap_dismissed", { reason: moment.getDismissedReason() });
          } else if (moment.isNotDisplayed() || moment.isSkippedMoment()) {
            suppressPrompt("one_tap", rules.skipCooldownMs);
            trackEvent("google_one_tap_skipped", { reason: moment.isSkippedMoment() ? moment.getSkippedReason() : moment.getNotDisplayedReason() });
          }
        });
      })
      .catch(() => {});

    return () => {
      releasePrompt("one_tap");
      window.google?.accounts.id.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hasHydrated, isAuthenticated]);

  return null;
}
