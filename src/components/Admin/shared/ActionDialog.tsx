"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type ConfirmProps = {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  busy?: boolean;
  tone?: "danger" | "warning";
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmActionDialog({ open, title, description, confirmLabel, busy = false, tone = "danger", onCancel, onConfirm }: ConfirmProps) {
  if (!open) return null;
  const danger = tone === "danger";
  return <div className="fixed inset-0 z-[180] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"><div role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-[#1f2937] sm:rounded-2xl sm:p-6"><div className="flex items-start gap-3"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${danger ? "bg-red-50 text-red-600 dark:bg-red-500/10" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10"}`}><AlertTriangle size={20} /></span><div><h2 id="admin-confirm-title" className="font-bold text-slate-900 dark:text-white">{title}</h2><div className="mt-1 text-sm leading-6 text-slate-500">{description}</div></div></div><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={busy} onClick={onCancel} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold dark:border-white/10">Cancel</button><button type="button" disabled={busy} onClick={onConfirm} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-50 ${danger ? "bg-red-600" : "bg-amber-600"}`}>{busy && <Loader2 className="animate-spin" size={16} />}{confirmLabel}</button></div></div></div>;
}

type ReasonProps = {
  open: boolean;
  title: string;
  description: string;
  busy?: boolean;
  onCancel: () => void;
  onSubmit: (reason: string) => void;
};

export function ReasonActionDialog({ open, title, description, busy = false, onCancel, onSubmit }: ReasonProps) {
  const [reason, setReason] = useState("");
  useEffect(() => { if (open) setReason(""); }, [open]);
  if (!open) return null;
  const submit = (event: FormEvent) => { event.preventDefault(); const value = reason.trim(); if (value) onSubmit(value); };
  return <div className="fixed inset-0 z-[180] flex items-end justify-center bg-black/60 sm:items-center sm:p-4"><form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="admin-reason-title" className="w-full max-w-lg rounded-t-2xl bg-white shadow-2xl dark:bg-[#1f2937] sm:rounded-2xl"><div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-white/10"><div><h2 id="admin-reason-title" className="font-bold text-slate-900 dark:text-white">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div><button type="button" disabled={busy} onClick={onCancel} aria-label="Close" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 dark:border-white/10"><X size={17} /></button></div><div className="p-5"><label className="text-sm font-semibold text-slate-700 dark:text-white/80">Rejection reason<textarea autoFocus required minLength={3} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Enter a clear reason for the applicant or seller..." className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-orange dark:border-white/10 dark:bg-white/5 dark:text-white" /></label><p className="mt-1 text-right text-xs text-slate-400">{reason.length}/1000</p><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" disabled={busy} onClick={onCancel} className="min-h-11 rounded-xl border px-4 text-sm font-semibold">Cancel</button><button disabled={busy || reason.trim().length < 3} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white disabled:opacity-50">{busy && <Loader2 className="animate-spin" size={16} />}Reject with reason</button></div></div></form></div>;
}
