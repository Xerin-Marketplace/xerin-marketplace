"use client";

import { useEffect, useRef, useState } from "react";
import { GOOGLE_CLIENT_ID, loadGoogleScript, type GoogleCredentialResponse } from "@/lib/google-gis";

export type GoogleButtonProps = {
  /** Called with the Google-issued ID token (JWT credential). */
  onCredential: (credential: string) => void | Promise<void>;
  disabled?: boolean;
  context?: "signin" | "signup" | "use";
};

/**
 * Renders Google's official Identity Services button — the button itself is
 * produced by Google's script (correct branding, accessibility, locale).
 * The Xerin backend verifies the returned credential cryptographically.
 * Renders nothing when NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured.
 */
export default function GoogleButton({ onCredential, disabled, context = "signin" }: GoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp: GoogleCredentialResponse) => {
            if (resp.credential) void onCredential(resp.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: context === "signup" ? "signup_with" : "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 320,
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => { cancelled = true; };
  }, [context, onCredential]);

  if (!GOOGLE_CLIENT_ID) return null;
  if (failed) return null; // silently fall back to password auth

  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className={`min-h-[44px] transition-opacity ${ready ? "opacity-100" : "opacity-40"} ${disabled ? "pointer-events-none opacity-50" : ""}`}
        aria-busy={!ready}
      />
      {!ready && <p className="mt-1 text-xs text-muted-foreground">Loading Google sign-in…</p>}
    </div>
  );
}
