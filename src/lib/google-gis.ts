export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const SCRIPT_LOAD_TIMEOUT_MS = 8000;

export type GoogleCredentialResponse = { credential?: string };

export type GooglePromptMoment = {
  isDisplayMoment: () => boolean;
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  getNotDisplayedReason: () => string;
  isSkippedMoment: () => boolean;
  getSkippedReason: () => string;
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
          prompt: (listener?: (moment: GooglePromptMoment) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

export function loadGoogleScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
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
      const timer = window.setTimeout(
        () => reject(new Error("Google sign-in took too long to load.")),
        SCRIPT_LOAD_TIMEOUT_MS,
      );
      script.addEventListener("load", () => { window.clearTimeout(timer); resolve(); }, { once: true });
      script.addEventListener("error", () => { window.clearTimeout(timer); reject(new Error("Google sign-in failed to load.")); }, { once: true });
    });
  }
  return scriptPromise;
}
