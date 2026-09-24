"use client";


import { Spinner } from "@/components/ui/Spinner";
import { HugeiconsIcon } from "@hugeicons/react";
import { BellIcon, CheckCheckIcon, LinkSquare01Icon, Loading03Icon, RefreshCwIcon, Delete02Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
 notificationsApi,
 type NotificationItem,
 type NotificationSummary,
} from "@/lib/api/endpoints/notifications";

function formatDate(value: string) {
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return value;
 return date.toLocaleString();
}

export default function NotificationCenter({
 compact = false,
}: {
 compact?: boolean;
}) {
 const [items, setItems] = useState<NotificationItem[]>([]);
 const [summary, setSummary] = useState<NotificationSummary>({
 total: 0,
 unread: 0,
 read: 0,
 });
 const [loading, setLoading] = useState(true);
 const [unreadOnly, setUnreadOnly] = useState(false);

 const load = useCallback(async () => {
 try {
 const [list, counts] = await Promise.all([
 notificationsApi.list({ unread_only: unreadOnly, limit: compact ? 20 : 50 }),
 notificationsApi.summary(),
 ]);
 setItems(list);
 setSummary(counts);
 } catch {
 toast.error("Unable to load notifications.");
 } finally {
 setLoading(false);
 }
 }, [compact, unreadOnly]);

 useEffect(() => {
 void load();
 const timer = window.setInterval(() => void load(), 15000);
 return () => window.clearInterval(timer);
 }, [load]);

 async function markRead(item: NotificationItem) {
 if (item.is_read) return;
 try {
 const updated = await notificationsApi.markRead(item.id);
 setItems((current) =>
 current.map((row) => (row.id === item.id ? updated : row)),
 );
 setSummary((current) => ({
 ...current,
 unread: Math.max(0, current.unread - 1),
 read: current.read + 1,
 }));
 } catch {
 toast.error("Unable to mark notification as read.");
 }
 }

 async function markAllRead() {
 try {
 const next = await notificationsApi.markAllRead();
 setSummary(next);
 setItems((current) => current.map((row) => ({ ...row, is_read: true })));
 toast.success("All notifications marked as read.");
 } catch {
 toast.error("Unable to update notifications.");
 }
 }

 async function remove(id: string) {
 try {
 await notificationsApi.remove(id);
 const removed = items.find((row) => row.id === id);
 setItems((current) => current.filter((row) => row.id !== id));
 setSummary((current) => ({
 total: Math.max(0, current.total - 1),
 unread:
 removed && !removed.is_read
 ? Math.max(0, current.unread - 1)
 : current.unread,
 read:
 removed && removed.is_read
 ? Math.max(0, current.read - 1)
 : current.read,
 }));
 } catch {
 toast.error("Unable to delete notification.");
 }
 }

 return (
 <div className="space-y-4">
 <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-card p-4 shadow-sm dark:border-border dark:bg-muted sm:flex-row sm:items-center sm:justify-between">
 <div>
 <div className="flex items-center gap-2">
 <HugeiconsIcon icon={BellIcon} size={19} className="text-[var(--primary)]" />
 <p className="font-bold text-[var(--foreground)]">
 {summary.unread} unread notification{summary.unread === 1 ? "" : "s"}
 </p>
 </div>
 <p className="mt-1 text-xs text-[var(--muted-foreground)]">
 Workflow alerts refresh automatically every 15 seconds.
 </p>
 </div>
 <div className="flex flex-wrap gap-2">
 <button
 type="button"
 onClick={() => setUnreadOnly((value) => !value)}
 className={`rounded-xl border px-3 py-2 text-xs font-semibold ${
 unreadOnly
 ? "border-[var(--primary)] bg-primary/10 text-[var(--primary)] dark:bg-orange-400/10 dark:text-primary-300"
 : "border-[var(--border)] text-[var(--foreground)] dark:border-border /70"
 }`}
 >
 {unreadOnly ? "Show all" : "Unread only"}
 </button>
 <button
 type="button"
 onClick={() => void load()}
 className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] dark:border-border /70"
 >
 <HugeiconsIcon icon={RefreshCwIcon} size={14} />
 Refresh
 </button>
 <button
 type="button"
 disabled={!summary.unread}
 onClick={() => void markAllRead()}
 className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-semibold text-background disabled:opacity-40 dark:bg-[var(--primary)]"
 >
 <HugeiconsIcon icon={CheckCheckIcon} size={14} />
 Mark all read
 </button>
 </div>
 </div>

 {loading ? (
 <div className="flex min-h-40 items-center justify-center text-[var(--muted-foreground)]">
 <Spinner className="mr-2" size={18} />
 Loading notifications...
 </div>
 ) : !items.length ? (
 <div className="rounded-2xl border border-dashed border-[var(--muted-foreground)] bg-card p-8 text-center dark:border-border dark:bg-muted">
 <HugeiconsIcon icon={BellIcon} className="mx-auto text-[var(--primary)]" />
 <h3 className="mt-3 font-bold text-[var(--foreground)]">
 No notifications
 </h3>
 <p className="mt-1 text-sm text-[var(--muted-foreground)]">
 Order, pickup, verification and wallet guidance will appear here.
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 {items.map((item) => (
 <article
 key={item.id}
 className={`rounded-2xl border p-4 transition ${
 item.is_read
 ? "border-[var(--border)] bg-card dark:border-border dark:bg-muted"
 : "border-primary/25 bg-primary/10/60 dark:border-primary-400/30 dark:bg-orange-400/10"
 }`}
 onClick={() => void markRead(item)}
 >
 <div className="flex items-start gap-3">
 <span
 className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
 item.is_read ? "bg-slate-300" : "bg-[var(--primary)]"
 }`}
 />
 <div className="min-w-0 flex-1">
 <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
 <h3 className="font-bold text-[var(--foreground)]">
 {item.title}
 </h3>
 <time className="shrink-0 text-xs text-[var(--muted-foreground)]">
 {formatDate(item.created_at)}
 </time>
 </div>
 <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)] /70">
 {item.message}
 </p>
 {item.action_url && (
 <Link
 href={item.action_url}
 onClick={() => void markRead(item)}
 className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-bold text-primary-foreground"
 >
 Open action
 <HugeiconsIcon icon={LinkSquare01Icon} size={13} />
 </Link>
 )}
 </div>
 <button
 type="button"
 aria-label="Delete notification"
 onClick={(event) => {
 event.stopPropagation();
 void remove(item.id);
 }}
 className="rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-red-light-6 hover:text-destructive dark:hover:bg-red-400/10"
 >
 <HugeiconsIcon icon={Delete02Icon} size={15} />
 </button>
 </div>
 </article>
 ))}
 </div>
 )}
 </div>
 );
}
