"use client";

import { SESSION_EXPIRED_EVENT } from "@/lib/reliability/runtime-events";
import { WifiOff, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function RuntimeStatus() {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const sync = () => {
      const nextOffline = !navigator.onLine;
      setOffline(nextOffline);
      if (!nextOffline) setDismissed(false);
    };
    const sessionExpired = () => toast.error("Your session expired. Please sign in again.", { id: "session-expired" });

    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    window.addEventListener(SESSION_EXPIRED_EVENT, sessionExpired);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
      window.removeEventListener(SESSION_EXPIRED_EVENT, sessionExpired);
    };
  }, []);

  if (!offline || dismissed) return null;
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-3 top-3 z-[200] mx-auto flex max-w-xl items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-950 shadow-xl sm:items-center">
      <WifiOff className="mt-0.5 shrink-0 sm:mt-0" size={19} aria-hidden="true" />
      <p className="min-w-0 flex-1 text-sm"><strong>You are offline.</strong> Some information may be unavailable. Your page will remain open while the connection recovers.</p>
      <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss offline notice" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-amber-100"><X size={18} /></button>
    </div>
  );
}
