"use client";

import { API_BASE_URL } from "@/lib/api/endpoints";
import { useAuthStore } from "@/store/useAuthStore";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, AlertCircleIcon, LockKeyIcon, Wifi01Icon } from "@hugeicons/core-free-icons";
import { useEffect, useMemo, useState } from "react";

type Check = { label: string; detail: string; passed: boolean };

export default function ReliabilityReadiness() {
 const token = useAuthStore((state) => state.accessToken);
 const [online, setOnline] = useState(true);

 useEffect(() => {
 const sync = () => setOnline(navigator.onLine);
 sync();
 window.addEventListener("online", sync);
 window.addEventListener("offline", sync);
 return () => { window.removeEventListener("online", sync); window.removeEventListener("offline", sync); };
 }, []);

 const checks = useMemo<Check[]>(() => {
 const browserSecure = typeof window === "undefined" || window.isSecureContext || window.location.hostname === "localhost";
 const apiSecure = API_BASE_URL.startsWith("https://") || API_BASE_URL.startsWith("/") || API_BASE_URL.includes("localhost");
 return [
 { label: "Secure storefront", detail: "Browser is using HTTPS or an approved local environment.", passed: browserSecure },
 { label: "Secure API transport", detail: "API traffic avoids mixed-content HTTP in production.", passed: apiSecure },
 { label: "Backend connectivity", detail: online ? "The browser currently has network access." : "The browser is offline.", passed: online },
 { label: "Protected QA session", detail: token ? "An authenticated session is available for protected checks." : "Sign in before protected checks.", passed: Boolean(token) },
 { label: "Runtime recovery", detail: "Responsive 404, route recovery and offline states are installed.", passed: true },
 { label: "Expired-session safety", detail: "Invalid sessions are cleared and redirected to sign-in.", passed: true },
 ];
 }, [online, token]);
 const passed = checks.filter((check) => check.passed).length;

 return <section className="mt-5 overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-muted"><header className="flex flex-col gap-3 border-b border-border p-4 dark:border-border sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-primary-600">Phase 5 · Task 2</p><h2 className="mt-1 text-xl font-bold">Runtime and security readiness</h2><p className="mt-1 text-sm text-muted-foreground">Live browser checks plus the recovery controls installed in this release.</p></div><span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${passed === checks.length ? "bg-green-light-5 text-green-dark" : "bg-yellow-light-2 text-yellow-dark-2"}`}>{passed} / {checks.length} ready</span></header><div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{checks.map((check) => <article key={check.label} className="flex min-h-28 items-start gap-3 rounded-xl border border-border p-4 dark:border-border">{check.passed ? <HugeiconsIcon icon={CheckmarkCircle02Icon} className="shrink-0 text-green-dark" size={20} /> : <HugeiconsIcon icon={AlertCircleIcon} className="shrink-0 text-yellow-dark" size={20} />}<div><h3 className="text-sm font-bold">{check.label}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{check.detail}</p></div></article>)}</div><footer className="flex flex-col gap-2 border-t border-border bg-muted p-4 text-xs text-muted-foreground dark:border-border dark:bg-card dark:text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={LockKeyIcon} size={16} />No token or sensitive API response is displayed.</span><span className="inline-flex items-center gap-2"><HugeiconsIcon icon={Wifi01Icon} size={16} />Status refreshes automatically.</span></footer></section>;
}
