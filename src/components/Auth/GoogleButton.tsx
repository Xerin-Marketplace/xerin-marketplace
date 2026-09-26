"use client";

import { useEffect, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const SCRIPT_LOAD_TIMEOUT_MS = 8000;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`);
      const script = existing ?? document.createElement("script");
      if (!existing) {
        script.src = GIS_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      const timer = window.setTimeout(() => reject(new Error("Google sign-in took too long to load.")), SCRIPT_LOAD_TIMEOUT_MS);
      script.addEventListener("load", () => { window.clearTimeout(timer); resolve(); }, { once: true });
      script.addEventListener("error", () => { window.clearTimeout(timer); reject(new Error("Google sign-in failed to load.")); }, { once: true });
    });
  }
  return scriptPromise;
}

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
          callback: (resp: { credential?: string }) => {
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
