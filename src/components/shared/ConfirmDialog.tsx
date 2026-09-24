"use client";

import { ReactNode } from "react";

type Props = {
 open: boolean;
 title: string;
 message: string;
 onConfirm: () => void;
 onCancel: () => void;
 confirmText?: string;
 cancelText?: string;
 children?: ReactNode;
};

export default function ConfirmDialog({
 open,
 title,
 message,
 onConfirm,
 onCancel,
 confirmText = "Confirm",
 cancelText = "Cancel",
}: Props) {
 if (!open) return null;

 return (
 <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
 <div className="w-full max-w-md rounded-xl bg-card p-5 shadow-lg">
 <h3 className="text-lg font-semibold">{title}</h3>
 <p className="mt-2 text-sm text-muted-foreground">{message}</p>
 <div className="mt-4 flex justify-end gap-2">
 <button className="rounded border border-border px-3 py-2 text-sm text-foreground hover:bg-muted" onClick={onCancel}>
 {cancelText}
 </button>
 <button className="rounded bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground" onClick={onConfirm}>
 {confirmText}
 </button>
 </div>
 </div>
 </div>
 );
}
