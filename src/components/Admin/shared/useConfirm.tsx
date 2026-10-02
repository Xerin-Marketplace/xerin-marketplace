"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { ConfirmActionDialog } from "./ActionDialog";

type ConfirmOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "danger" | "warning";
};

type Pending = ConfirmOptions & { resolve: (v: boolean) => void };

/**
 * Hook version of window.confirm that renders the styled admin dialog.
 * Usage:
 *   const { confirm, confirmDialog } = useConfirmDialog();
 *   if (!(await confirm({ title: "Delete?", description: "..." }))) return;
 *   ... {confirmDialog} in JSX
 */
export function useConfirmDialog() {
  const [pending, setPending] = useState<Pending | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setPending({ ...opts, resolve });
      }),
    [],
  );

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setPending(null);
  };

  const confirmDialog = (
    <ConfirmActionDialog
      open={pending != null}
      title={pending?.title ?? ""}
      description={pending?.description ?? ""}
      confirmLabel={pending?.confirmLabel ?? "Confirm"}
      tone={pending?.tone ?? "danger"}
      onCancel={() => settle(false)}
      onConfirm={() => settle(true)}
    />
  );

  return { confirm, confirmDialog };
}

type PromptOptions = {
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  confirmLabel?: string;
  required?: boolean;
  defaultValue?: string;
};

type PendingPrompt = PromptOptions & { resolve: (v: string | null) => void };

/**
 * Hook version of window.prompt that renders a styled admin input dialog.
 * Resolves null when cancelled — same semantics as prompt().
 */
export function usePromptDialog() {
  const [pending, setPending] = useState<PendingPrompt | null>(null);
  const [value, setValue] = useState("");
  const resolver = useRef<((v: string | null) => void) | null>(null);

  useEffect(() => {
    if (pending) setValue(pending.defaultValue ?? "");
  }, [pending]);

  const prompt = useCallback(
    (opts: PromptOptions) =>
      new Promise<string | null>((resolve) => {
        resolver.current = resolve;
        setPending({ ...opts, resolve });
      }),
    [],
  );

  const settle = (v: string | null) => {
    resolver.current?.(v);
    resolver.current = null;
    setPending(null);
  };

  const promptDialog = pending == null ? null : (
    <div className="fixed inset-0 z-[180] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-prompt-title"
        className="w-full max-w-md rounded-t-2xl bg-card p-5 shadow-lg sm:rounded-xl sm:p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const v = value.trim();
          if (pending.required !== false && !v) return;
          settle(pending.required === false ? v || null : v);
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="admin-prompt-title" className="font-bold text-foreground">
              {pending.title}
            </h2>
            {pending.description && (
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {pending.description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => settle(null)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={pending.placeholder}
          className="mt-4 w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-primary"
        />
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => settle(null)}
            className="min-h-11 rounded-xl border border-border px-4 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            disabled={pending.required !== false && !value.trim()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {pending.confirmLabel ?? "Save"}
          </button>
        </div>
      </form>
    </div>
  );

  return { prompt, promptDialog };
}
