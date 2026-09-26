"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, LockIcon } from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import GoogleButton from "./GoogleButton";
import { authApi } from "@/lib/api/endpoints/auth";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/useAuthStore";
import { getPostLoginPath } from "@/guards/auth-routing";
import Link from "next/link";

export const AUTH_PROMPT_EVENT = "xerin:auth-prompt";

export type AuthPromptPayload = {
  action?: string;
  description?: string;
};

/** Fire from anywhere (including non-React code): show the Xerin auth drawer. */
export function requestAuthPrompt(payload: AuthPromptPayload = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AuthPromptPayload>(AUTH_PROMPT_EVENT, { detail: payload }));
}

const ACTION_LABELS: Record<string, { title: string; body: string }> = {
  wishlist: { title: "Save it to your wishlist", body: "Sign in to keep this product in your wishlist across devices." },
  checkout: { title: "Sign in to check out", body: "Your cart stays exactly as it is — sign in to continue to checkout." },
  follow: { title: "Follow this store", body: "Sign in to follow sellers and see their updates." },
  default: { title: "Sign in to continue", body: "Use your account to unlock this action." },
};

export default function AuthPrompt() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setSession, mergeGuestCart } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [open, setOpen] = useState<AuthPromptPayload | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      if (useAuthStore.getState().isAuthenticated) return;
      setOpen((e as CustomEvent<AuthPromptPayload>).detail ?? {});
    };
    window.addEventListener(AUTH_PROMPT_EVENT, handler);
    return () => window.removeEventListener(AUTH_PROMPT_EVENT, handler);
  }, []);

  // Close once authenticated (covers password login happening elsewhere).
  useEffect(() => {
    if (isAuthenticated) setOpen(null);
  }, [isAuthenticated]);

  const close = useCallback(() => setOpen(null), []);

  const returnTo = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;

  const handleGoogle = async (credential: string) => {
    setBusy(true);
    try {
      const session = await authApi.loginWithGoogle(credential);
      setSession(session);
      if (getPostLoginPath("/account", session.user) === "/account") {
        await mergeGuestCart().catch(() => {});
      }
      toast.success("Signed in with Google.");
      close();
      const destination = getPostLoginPath(returnTo, session.user);
      if (destination !== returnTo) router.push(destination);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Google sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;
  const copy = ACTION_LABELS[open.action ?? "default"] ?? ACTION_LABELS.default;
  const signinHref = `/signin?redirect=${encodeURIComponent(returnTo)}`;
  const signupHref = `/signup?redirect=${encodeURIComponent(returnTo)}`;

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-end justify-center bg-black/50 px-4 pb-4 sm:items-center sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-prompt-title"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon icon={LockIcon} size={18} />
          </span>
          <button onClick={close} aria-label="Close" className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        <h3 id="auth-prompt-title" className="mt-4 text-lg font-bold text-foreground">{copy.title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{open.description ?? copy.body}</p>

        <div className="mt-5 flex justify-center">
          <GoogleButton onCredential={handleGoogle} disabled={busy} context="signin" />
        </div>

        <div className="my-4 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Link
          href={signinHref}
          onClick={close}
          className="flex h-11 w-full items-center justify-center rounded-lg bg-orange text-sm font-semibold text-white transition hover:bg-primary/90-dark"
        >
          Continue with email
        </Link>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          New to Xerin?{" "}
          <Link href={signupHref} onClick={close} className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
