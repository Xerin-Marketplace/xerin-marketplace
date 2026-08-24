"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  activateAdvertisement,
  createAdvertisement,
  deleteAdvertisement,
  listAdvertisements,
  getAdvertisementAnalytics,
  pauseAdvertisement,
  updateAdvertisement,
  uploadAdvertisementImage,
  type AdvertisementAnalyticsOverview,
  type AdvertisementBillingType,
  type AdvertisementEffectiveStatus,
  type AdvertisementPayload,
  type AdvertisementPlacement,
  type AdminAdvertisement,
} from "@/lib/api/endpoints/admin";
import { ConfirmActionDialog } from "@/components/Admin/shared/ActionDialog";

export type AdvertisementView =
  | "all"
  | "create"
  | "active"
  | "scheduled"
  | "paused"
  | "expired"
  | "analytics";

const PLACEMENTS: AdvertisementPlacement[] = [
  "hero_side_top",
  "hero_side_bottom",
  "homepage_banner",
  "category_banner",
  "search_banner",
];

const BILLING_TYPES: AdvertisementBillingType[] = ["fixed", "cpc", "cpm"];

const pretty = (value: string) =>
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const money = (value: number | null, currency: string) =>
  value == null
    ? "—"
    : new Intl.NumberFormat("en-TZ", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(value);

const localInputValue = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 16);
};

const statusClasses: Record<AdvertisementEffectiveStatus, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  scheduled: "bg-blue-50 text-blue-700 ring-blue-600/10",
  paused: "bg-amber-50 text-amber-700 ring-amber-600/10",
  expired: "bg-slate-100 text-slate-600 ring-slate-500/10",
  draft: "bg-violet-50 text-violet-700 ring-violet-600/10",
};

const effectiveFilterForView = (
  view: AdvertisementView,
): AdvertisementEffectiveStatus | undefined => {
  if (view === "all" || view === "create" || view === "analytics") return undefined;
  return view;
};

export default function AdminAdvertisements({
  view = "all",
}: {
  view?: AdvertisementView;
}) {
  return view === "analytics" ? (
    <AdvertisementAnalyticsDashboard />
  ) : (
    <AdvertisementManager view={view} />
  );
}

function AdvertisementManager({
  view = "all",
}: {
  view?: AdvertisementView;
}) {
  const [ads, setAds] = useState<AdminAdvertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [placement, setPlacement] = useState<AdvertisementPlacement | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [editor, setEditor] = useState<AdminAdvertisement | "new" | null>(
    view === "create" ? "new" : null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminAdvertisement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAdvertisements({
        page,
        page_size: 20,
        search: search.trim() || undefined,
        placement: placement || undefined,
        effective_status: effectiveFilterForView(view),
      });
      setAds(data.results);
      setTotal(data.total);
      setTotalPages(data.total_pages || 0);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load advertisements.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, placement, search, view]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
    if (view === "create") setEditor("new");
  }, [view]);

  const stats = useMemo(() => {
    const counts = {
      active: 0,
      scheduled: 0,
      paused: 0,
      expired: 0,
      draft: 0,
    };
    ads.forEach((ad) => {
      counts[ad.effective_status] += 1;
    });
    return counts;
  }, [ads]);

  const act = async (
    ad: AdminAdvertisement,
    action: "activate" | "pause" | "delete",
  ) => {
    setBusy(`${action}:${ad.id}`);
    setError("");
    setMessage("");
    try {
      if (action === "activate") {
        const result = await activateAdvertisement(ad.id);
        setMessage(result.message);
      } else if (action === "pause") {
        const result = await pauseAdvertisement(ad.id);
        setMessage(result.message);
      } else {
        await deleteAdvertisement(ad.id);
        setMessage("Advertisement deleted.");
        setDeleteTarget(null);
      }
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Advertisement action failed.",
      );
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f47524]">
              Marketplace monetization
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
              Advertisements
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-white/60">
              Schedule sponsored placements with an exact start and end time.
              Expired campaigns automatically stop appearing on the storefront.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditor("new")}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#111827] px-5 text-sm font-bold text-white transition hover:bg-[#f47524]"
          >
            + New Advertisement
          </button>

          <button
            type="button"
            onClick={() => setEditor("new")}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#111827] px-5 text-sm font-bold text-white transition hover:bg-[#f47524]"
          >
            + Logistics Partnership
          </button>
          
        </div>

        <div className="grid gap-px bg-slate-200 sm:grid-cols-5 dark:bg-white/10">
          {[
            ["Loaded", total],
            ["Active", stats.active],
            ["Scheduled", stats.scheduled],
            ["Paused", stats.paused],
            ["Expired", stats.expired],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="bg-white px-5 py-4 dark:bg-[#1f2937]"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
        <div className="grid gap-3 border-b border-slate-200 p-4 sm:grid-cols-[minmax(0,1fr)_220px_auto] dark:border-white/10">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search advertiser, title, description..."
            className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#f47524] dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
          <select
            value={placement}
            onChange={(event) => {
              setPlacement(event.target.value as AdvertisementPlacement | "");
              setPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#f47524] dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            <option value="">All placements</option>
            {PLACEMENTS.map((item) => (
              <option key={item} value={item}>
                {pretty(item)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-white"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-white/5 dark:text-white/50">
              <tr>
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3">Placement</th>
                <th className="px-5 py-3">Schedule</th>
                <th className="px-5 py-3">Billing</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Performance</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {ads.map((ad) => (
                <tr key={ad.id} className="align-top hover:bg-slate-50/70 dark:hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="flex max-w-[300px] gap-3">
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={ad.image_url}
                          alt={ad.alt_text || ad.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900 dark:text-white">
                          {ad.title}
                        </p>
                        <p className="truncate text-xs font-medium text-[#f47524]">
                          {ad.advertiser_name}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-white/50">
                          {ad.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-700 dark:text-white/80">
                    {pretty(ad.placement)}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-600 dark:text-white/60">
                    <p>{new Date(ad.starts_at).toLocaleString()}</p>
                    <p className="mt-1">→ {new Date(ad.ends_at).toLocaleString()}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold uppercase">{ad.billing_type}</p>
                    <p className="text-xs text-slate-500">
                      {money(ad.price, ad.currency)}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-bold">{ad.priority}</td>
                  <td className="px-5 py-4 text-xs">
                    <p>{ad.impression_count.toLocaleString()} impressions</p>
                    <p>{ad.click_count.toLocaleString()} clicks</p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusClasses[ad.effective_status]}`}
                    >
                      {pretty(ad.effective_status)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setEditor(ad)}
                        className="text-slate-700 hover:text-[#f47524] dark:text-white/80"
                      >
                        Edit
                      </button>
                      {ad.status === "active" &&
                      ad.effective_status !== "expired" ? (
                        <button
                          type="button"
                          disabled={busy === `pause:${ad.id}`}
                          onClick={() => void act(ad, "pause")}
                          className="text-amber-600 disabled:opacity-40"
                        >
                          Pause
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={
                            busy === `activate:${ad.id}` ||
                            ad.effective_status === "expired"
                          }
                          onClick={() => void act(ad, "activate")}
                          className="text-emerald-600 disabled:opacity-40"
                          title={
                            ad.effective_status === "expired"
                              ? "Extend the end time before reactivating"
                              : undefined
                          }
                        >
                          Activate
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy === `delete:${ad.id}`}
                        onClick={() => setDeleteTarget(ad)}
                        className="text-red-600 disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <p className="p-10 text-center text-sm text-slate-500">
            Loading advertisements...
          </p>
        ) : ads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl">📢</div>
            <h3 className="mt-3 text-lg font-bold">No advertisements found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create a campaign or change the current filters.
            </p>
          </div>
        ) : null}

        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm dark:border-white/10">
            <p className="text-slate-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border px-3 py-2 font-semibold disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border px-3 py-2 font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {editor ? (
        <AdvertisementEditor
          advertisement={editor === "new" ? null : editor}
          onClose={() => setEditor(null)}
          onSaved={async (savedMessage) => {
            setEditor(null);
            setMessage(savedMessage);
            await load();
          }}
          onError={setError}
        />
      ) : null}
      <ConfirmActionDialog open={Boolean(deleteTarget)} title="Delete advertisement?" description={<>The campaign <strong>{deleteTarget?.title}</strong> will be permanently deleted and removed from all placements.</>} confirmLabel="Delete advertisement" busy={Boolean(deleteTarget && busy === `delete:${deleteTarget.id}`)} onCancel={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && void act(deleteTarget, "delete")} />
    </div>
  );
}

function AdvertisementAnalyticsDashboard() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AdvertisementAnalyticsOverview | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    setAnalyticsError("");

    try {
      setData(await getAdvertisementAnalytics(days, 10));
    } catch (cause) {
      setAnalyticsError(
        cause instanceof Error
          ? cause.message
          : "Could not load advertisement analytics.",
      );
    } finally {
      setLoadingAnalytics(false);
    }
  }, [days]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const maxDaily = Math.max(
    1,
    ...(data?.daily_engagement.map((point) =>
      Math.max(point.impressions, point.clicks),
    ) || [1]),
  );

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f47524]">
              Advertising performance
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
              Revenue & Analytics
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-white/60">
              Monitor sponsored campaign reach, engagement, CTR and estimated
              advertising revenue.
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last 12 months</option>
            </select>
            <button
              type="button"
              onClick={() => void loadAnalytics()}
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold dark:border-white/10"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>

      {analyticsError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {analyticsError}
        </div>
      ) : null}

      {loadingAnalytics || !data ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-[#1f2937]">
          Loading advertisement analytics...
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <AnalyticsCard
              label="Impressions"
              value={data.total_impressions.toLocaleString()}
              helper={`${data.days}-day engagement window`}
            />
            <AnalyticsCard
              label="Clicks"
              value={data.total_clicks.toLocaleString()}
              helper="Tracked sponsored clicks"
            />
            <AnalyticsCard
              label="CTR"
              value={`${data.ctr_percent.toFixed(2)}%`}
              helper="Clicks ÷ impressions"
            />
            <AnalyticsCard
              label="Active campaigns"
              value={data.status_counts.active.toLocaleString()}
              helper={`${data.status_counts.scheduled} scheduled`}
            />
            <AnalyticsCard
              label="All campaigns"
              value={data.status_counts.total.toLocaleString()}
              helper={`${data.status_counts.expired} expired`}
            />
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Estimated earned advertising revenue
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {data.revenue_by_currency.length ? (
                    data.revenue_by_currency.map((row) => (
                      <div
                        key={row.currency}
                        className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/5"
                      >
                        <p className="text-xs font-bold text-slate-400">
                          {row.currency}
                        </p>
                        <p className="mt-1 text-2xl font-black text-[#f47524]">
                          {money(row.estimated_revenue, row.currency)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No revenue data yet.</p>
                  )}
                </div>
              </div>
              <p className="max-w-lg rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                {data.revenue_note}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950 dark:text-white">
                  Daily engagement
                </h3>
                <p className="text-xs text-slate-500">
                  Impression and click activity in the selected period.
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <div className="flex min-w-[680px] items-end gap-2">
                {data.daily_engagement.map((point) => {
                  const impressionHeight = Math.max(
                    3,
                    Math.round((point.impressions / maxDaily) * 150),
                  );
                  const clickHeight = Math.max(
                    point.clicks > 0 ? 3 : 0,
                    Math.round((point.clicks / maxDaily) * 150),
                  );

                  return (
                    <div
                      key={point.date}
                      className="flex min-w-[24px] flex-1 flex-col items-center"
                      title={`${point.date}: ${point.impressions} impressions, ${point.clicks} clicks`}
                    >
                      <div className="flex h-40 items-end gap-0.5">
                        <div
                          className="w-2 rounded-t bg-slate-300"
                          style={{ height: `${impressionHeight}px` }}
                        />
                        <div
                          className="w-2 rounded-t bg-[#f47524]"
                          style={{ height: `${clickHeight}px` }}
                        />
                      </div>
                      <span className="mt-2 rotate-[-45deg] whitespace-nowrap text-[9px] text-slate-400">
                        {new Date(`${point.date}T00:00:00`).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 flex gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-slate-300" />
                Impressions
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#f47524]" />
                Clicks
              </span>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <h3 className="font-bold">Top campaigns</h3>
              <p className="text-xs text-slate-500">
                Ranked by clicks, then impressions and estimated revenue.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 dark:bg-white/5">
                  <tr>
                    <th className="px-5 py-3">Campaign</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Impressions</th>
                    <th className="px-5 py-3">Clicks</th>
                    <th className="px-5 py-3">CTR</th>
                    <th className="px-5 py-3">Billing</th>
                    <th className="px-5 py-3">Estimated Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                  {data.top_campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td className="px-5 py-4">
                        <p className="font-bold">{campaign.title}</p>
                        <p className="text-xs text-[#f47524]">
                          {campaign.advertiser_name}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusClasses[campaign.effective_status]}`}
                        >
                          {pretty(campaign.effective_status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        {campaign.impressions.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 font-semibold">
                        {campaign.clicks.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        {campaign.ctr_percent.toFixed(2)}%
                      </td>
                      <td className="px-5 py-4 uppercase">
                        {campaign.billing_type}
                      </td>
                      <td className="px-5 py-4 font-bold text-[#f47524]">
                        {money(campaign.estimated_revenue, campaign.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <h3 className="font-bold">Advertiser performance</h3>
              <p className="text-xs text-slate-500">
                Aggregated campaign reach and engagement by brand/advertiser.
              </p>
            </div>
            <div className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-3 dark:bg-white/10">
              {data.advertisers.map((advertiser) => (
                <article
                  key={advertiser.advertiser_name}
                  className="bg-white p-5 dark:bg-[#1f2937]"
                >
                  <h4 className="font-bold">{advertiser.advertiser_name}</h4>
                  <p className="mt-1 text-xs text-slate-500">
                    {advertiser.campaigns} campaigns
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">Impressions</p>
                      <p className="font-bold">
                        {advertiser.impressions.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Clicks</p>
                      <p className="font-bold">
                        {advertiser.clicks.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">CTR</p>
                      <p className="font-bold">
                        {advertiser.ctr_percent.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {advertiser.revenue_by_currency.map((row) => (
                      <span
                        key={row.currency}
                        className="rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-bold text-[#f47524]"
                      >
                        {money(row.estimated_revenue, row.currency)}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function AnalyticsCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </article>
  );
}

function AdvertisementEditor({
  advertisement,
  onClose,
  onSaved,
  onError,
}: {
  advertisement: AdminAdvertisement | null;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(advertisement?.image_url || "");
  const [desktopImageUrl, setDesktopImageUrl] = useState(advertisement?.image_url || "");
  const [mobileImageUrl, setMobileImageUrl] = useState(advertisement?.mobile_image_url || "");
  const [uploading, setUploading] = useState<"desktop" | "mobile" | null>(null);

  const uploadCreative = async (
    file: File,
    variant: "desktop" | "mobile",
  ) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      onError("Only JPEG, PNG and WEBP banner images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError("Banner image must not exceed 5 MB.");
      return;
    }

    setUploading(variant);
    onError("");

    const localPreview = URL.createObjectURL(file);
    if (variant === "desktop") {
      setPreviewUrl(localPreview);
    }

    try {
      const uploaded = await uploadAdvertisementImage(file, variant);

      if (variant === "desktop") {
        setDesktopImageUrl(uploaded.image_url);
        setPreviewUrl(uploaded.image_url);
      } else {
        setMobileImageUrl(uploaded.image_url);
      }
    } catch (cause) {
      onError(
        cause instanceof Error
          ? cause.message
          : "Could not upload advertisement image.",
      );
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploading(null);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    onError("");

    const data = new FormData(event.currentTarget);
    const starts = String(data.get("starts_at") || "");
    const ends = String(data.get("ends_at") || "");

    if (!starts || !ends) {
      onError("Start and end date/time are required.");
      setSaving(false);
      return;
    }

    if (!desktopImageUrl.trim()) {
      onError("Upload a desktop advertisement banner before saving.");
      setSaving(false);
      return;
    }

    const startsAt = new Date(starts);
    const endsAt = new Date(ends);

    if (endsAt <= startsAt) {
      onError("Advertisement end time must be later than its start time.");
      setSaving(false);
      return;
    }

    const payload: AdvertisementPayload = {
      advertiser_name: String(data.get("advertiser_name") || "").trim(),
      title: String(data.get("title") || "").trim(),
      description: String(data.get("description") || "").trim() || null,
      image_url: desktopImageUrl.trim(),
      mobile_image_url: mobileImageUrl.trim() || null,
      alt_text: String(data.get("alt_text") || "").trim() || null,
      target_url: String(data.get("target_url") || "").trim() || null,
      cta_label: String(data.get("cta_label") || "").trim() || "Shop Now",
      placement: String(data.get("placement")) as AdvertisementPlacement,
      status: String(data.get("status") || "draft") as
        | "draft"
        | "active"
        | "paused",
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      priority: Number(data.get("priority") || 0),
      billing_type: String(
        data.get("billing_type") || "fixed",
      ) as AdvertisementBillingType,
      price: data.get("price") ? Number(data.get("price")) : null,
      currency: String(data.get("currency") || "TZS").toUpperCase(),
    };

    try {
      if (advertisement) {
        await updateAdvertisement(advertisement.id, payload);
        await onSaved("Advertisement updated successfully.");
      } else {
        await createAdvertisement(payload);
        await onSaved("Advertisement created successfully.");
      }
    } catch (cause) {
      onError(
        cause instanceof Error
          ? cause.message
          : "Could not save advertisement.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex justify-end bg-black/50"
      onClick={onClose}
    >
      <aside
        onClick={(event) => event.stopPropagation()}
        className="h-[100dvh] w-full max-w-2xl overflow-y-auto bg-white p-5 shadow-2xl dark:bg-[#111827] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#f47524]">
              Advertisement manager
            </p>
            <h3 className="mt-1 text-2xl font-bold">
              {advertisement ? "Edit Advertisement" : "Create Advertisement"}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
              Use exact start/end date and time. Xerin automatically removes the
              campaign when the end time is reached.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-3xl leading-none text-slate-400"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <section className="grid gap-4 rounded-2xl border border-slate-200 p-4 dark:border-white/10 sm:grid-cols-2">
            <Field
              label="Advertiser / Brand"
              name="advertiser_name"
              defaultValue={advertisement?.advertiser_name}
              required
            />
            <Field
              label="Campaign title"
              name="title"
              defaultValue={advertisement?.title}
              required
            />
            <label className="sm:col-span-2">
              <span className="text-sm font-semibold">Description</span>
              <textarea
                name="description"
                defaultValue={advertisement?.description || ""}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#f47524] dark:border-white/10 dark:bg-white/5"
              />
            </label>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-white/10">
            <div>
              <h4 className="font-bold">Creative</h4>
              <p className="text-xs text-slate-500">
                Upload campaign creatives directly from your computer.
                Xerin validates the image and stores a browser-friendly WEBP file.
              </p>
            </div>
            <CreativeUploader
              label="Desktop banner"
              description="Required. JPEG, PNG or WEBP, maximum 5 MB."
              value={desktopImageUrl}
              uploading={uploading === "desktop"}
              onUpload={(file) => void uploadCreative(file, "desktop")}
            />
            <CreativeUploader
              label="Mobile banner"
              description="Optional. Upload a separate crop for phones."
              value={mobileImageUrl}
              uploading={uploading === "mobile"}
              onUpload={(file) => void uploadCreative(file, "mobile")}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Alt text"
                name="alt_text"
                defaultValue={advertisement?.alt_text || ""}
              />
              <Field
                label="CTA label"
                name="cta_label"
                defaultValue={advertisement?.cta_label || "Shop Now"}
              />
            </div>
            <Field
              label="Target URL"
              name="target_url"
              defaultValue={advertisement?.target_url || ""}
              placeholder="https://..."
            />
            {previewUrl ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                <img
                  src={previewUrl}
                  alt="Advertisement preview"
                  className="h-44 w-full object-cover"
                />
              </div>
            ) : null}
          </section>

          <section className="grid gap-4 rounded-2xl border border-slate-200 p-4 dark:border-white/10 sm:grid-cols-2">
            <SelectField
              label="Placement"
              name="placement"
              defaultValue={advertisement?.placement || "hero_side_top"}
              options={PLACEMENTS}
            />
            <SelectField
              label="Stored status"
              name="status"
              defaultValue={advertisement?.status || "draft"}
              options={["draft", "active", "paused"]}
            />
            <Field
              label="Starts at"
              name="starts_at"
              type="datetime-local"
              defaultValue={localInputValue(advertisement?.starts_at)}
              required
            />
            <Field
              label="Ends at"
              name="ends_at"
              type="datetime-local"
              defaultValue={localInputValue(advertisement?.ends_at)}
              required
            />
            <Field
              label="Priority"
              name="priority"
              type="number"
              defaultValue={String(advertisement?.priority ?? 0)}
              min="0"
            />
            <SelectField
              label="Billing type"
              name="billing_type"
              defaultValue={advertisement?.billing_type || "fixed"}
              options={BILLING_TYPES}
            />
            <Field
              label="Price"
              name="price"
              type="number"
              defaultValue={
                advertisement?.price != null
                  ? String(advertisement.price)
                  : ""
              }
              min="0"
            />
            <Field
              label="Currency"
              name="currency"
              defaultValue={advertisement?.currency || "TZS"}
              maxLength={3}
            />
          </section>

          <div className="sticky bottom-0 -mx-5 flex gap-3 border-t border-slate-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#111827] sm:-mx-7 sm:px-7">
            <button
              type="button"
              onClick={onClose}
              className="h-12 flex-1 rounded-xl border border-slate-200 font-semibold dark:border-white/10"
            >
              Cancel
            </button>
            <button
              disabled={saving || uploading !== null}
              className="h-12 flex-[1.5] rounded-xl bg-[#f47524] font-bold text-white disabled:opacity-50"
            >
              {uploading
                ? "Uploading banner..."
                : saving
                  ? "Saving..."
                : advertisement
                  ? "Save Advertisement"
                  : "Create Advertisement"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required = false,
  placeholder,
  min,
  maxLength,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        min={min}
        maxLength={maxLength}
        onChange={(event) => onChange?.(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#f47524] dark:border-white/10 dark:bg-white/5"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: readonly string[];
}) {
  return (
    <label>
      <span className="text-sm font-semibold">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#f47524] dark:border-white/10 dark:bg-white/5"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {pretty(option)}
          </option>
        ))}
      </select>
    </label>
  );
}


function CreativeUploader({
  label,
  description,
  value,
  uploading,
  onUpload,
}: {
  label: string;
  description: string;
  value: string;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-white/50">
            {description}
          </p>
        </div>
        {value ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            Uploaded
          </span>
        ) : null}
      </div>

      <label className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center transition hover:border-[#f47524] hover:bg-orange-50/30 dark:border-white/10 dark:bg-white/[0.03]">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.currentTarget.value = "";
          }}
        />

        <span className="text-2xl">🖼️</span>
        <span className="mt-2 text-sm font-bold text-slate-800 dark:text-white">
          {uploading
            ? "Uploading..."
            : value
              ? "Replace banner"
              : "Choose banner image"}
        </span>
        <span className="mt-1 text-xs text-slate-500">
          Click to select a file from this device
        </span>
      </label>

      {value ? (
        <p className="mt-2 break-all text-[11px] text-slate-400">{value}</p>
      ) : null}
    </div>
  );
}
