"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Megaphone01Icon,
  RefreshCwIcon,
  PlusSignIcon,
  Calendar01Icon,
  Settings02Icon,
  MailSend01Icon,
} from "@hugeicons/core-free-icons";
import toast from "react-hot-toast";
import {
  marketingApi,
  MarketingCampaign,
  MarketingEvent,
  MarketingOverview,
  MarketingSegment,
  MarketingTemplate,
  MonthlyAutomation,
} from "@/lib/api/endpoints/marketing";

export type EngagementView =
  | "overview"
  | "campaigns"
  | "templates"
  | "calendar"
  | "automation";

const TITLES: Record<EngagementView, [string, string, string]> = {
  overview: ["Marketing", "Engagement overview", "Audience, campaigns and delivery metrics from real send data."],
  campaigns: ["Marketing", "Campaigns", "Create, approve, schedule and send email or SMS campaigns."],
  templates: ["Marketing", "Message templates", "Reusable approved copy for campaigns."],
  calendar: ["Marketing", "Holiday calendar", "Tanzanian holidays and marketing events — estimated dates are flagged."],
  automation: ["Marketing", "Monthly engagement", "Recurring monthly campaign. Enabled only after review."],
};

const err = (e: unknown) => {
  const x = e as { response?: { data?: { detail?: string } }; message?: string };
  const d = x.response?.data?.detail;
  return (typeof d === "string" ? d : undefined) || x.message || "We couldn't complete your request. Please try again.";
};

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  approved: "bg-blue-light-4 text-blue-dark",
  scheduled: "bg-blue-light-4 text-blue-dark",
  sending: "bg-amber-100 text-amber-700",
  sent: "bg-green-light-6 text-green-dark",
  paused: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-light-6 text-red-dark",
  failed: "bg-red-light-6 text-red-dark",
};

export default function AdminEngagement({ view }: { view: EngagementView }) {
  const [eyebrow, title, description] = TITLES[view];
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<MarketingOverview | null>(null);
  const [segments, setSegments] = useState<MarketingSegment[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [templates, setTemplates] = useState<MarketingTemplate[]>([]);
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [automation, setAutomation] = useState<MonthlyAutomation | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", channel: "sms", segment_key: "all_customers", subject: "", body: "", scheduled_at: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const jobs: Promise<void>[] = [];
      if (view === "overview") jobs.push(marketingApi.overview().then(setOverview));
      jobs.push(marketingApi.segments("email").then(setSegments));
      if (view === "campaigns") jobs.push(marketingApi.campaigns().then(setCampaigns));
      if (view === "templates") jobs.push(marketingApi.templates().then(setTemplates));
      if (view === "calendar") jobs.push(marketingApi.events().then(setEvents));
      if (view === "automation") jobs.push(marketingApi.monthlyAutomation().then(setAutomation));
      await Promise.all(jobs);
    } catch (e) {
      toast.error(err(e));
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, label: string, fn: () => Promise<unknown>) => {
    setBusy(id);
    try {
      await fn();
      toast.success(label);
      await load();
    } catch (e) {
      toast.error(err(e));
    } finally {
      setBusy(null);
    }
  };

  const createCampaign = async (e: FormEvent) => {
    e.preventDefault();
    await act("create", "Campaign saved as draft", () =>
      marketingApi.createCampaign({
        name: form.name,
        channel: form.channel as "email" | "sms",
        segment_key: form.segment_key,
        subject: form.subject || null,
        body: form.body,
        scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      } as Partial<MarketingCampaign>));
    setFormOpen(false);
    setForm({ name: "", channel: "sms", segment_key: "all_customers", subject: "", body: "", scheduled_at: "" });
  };

  const cards = [
    ["Customers", overview?.contacts.total_customers ?? "—"],
    ["Email eligible", overview?.contacts.email_eligible ?? "—"],
    ["SMS eligible", overview?.contacts.sms_eligible ?? "—"],
    ["Opted out", overview?.contacts.opted_out ?? "—"],
    ["Campaigns", Object.values(overview?.campaigns ?? {}).reduce((a, b) => a + b, 0) || "—"],
    ["Emails sent", overview?.delivery.email?.sent ?? "—"],
    ["SMS sent", overview?.delivery.sms?.sent ?? "—"],
    ["Failed", (overview?.delivery.email?.failed ?? 0) + (overview?.delivery.sms?.failed ?? 0)],
  ];

  return (
    <div className="space-y-5 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-primary">{eyebrow}</p>
          <h1 className="mt-1 text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex gap-2">
          {view === "campaigns" && (
            <button
              onClick={() => setFormOpen((v) => !v)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={15} /> New campaign
            </button>
          )}
          {view === "calendar" && (
            <button
              disabled={busy === "seed"}
              onClick={() => void act("seed", "Holiday calendar loaded", () => marketingApi.seedEvents())}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              <HugeiconsIcon icon={Calendar01Icon} size={15} /> Seed calendar
            </button>
          )}
          <button
            onClick={() => void load()}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-muted-foreground"
          >
            <HugeiconsIcon icon={RefreshCwIcon} size={15} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">Loading…</div>
      ) : (
        <>
          {view === "overview" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map(([label, value]) => (
                  <article key={label} className="rounded-xl border bg-card p-5">
                    <p className="text-sm font-semibold text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
                  </article>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-xl border bg-card p-5">
                  <h2 className="font-bold text-foreground">Audience segments</h2>
                  <div className="mt-4 divide-y divide-border">
                    {segments.map((s) => (
                      <div key={s.key} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-bold text-foreground">{s.estimated_recipients}</span>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="rounded-xl border bg-card p-5">
                  <h2 className="font-bold text-foreground">Upcoming events</h2>
                  <div className="mt-4 divide-y divide-border">
                    {(overview?.upcoming_events ?? []).map((e) => (
                      <div key={e.name} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="text-muted-foreground">
                          {e.name}
                          {e.estimated && <span className="ml-1 text-xs text-amber-600">(estimated)</span>}
                        </span>
                        <span className="font-semibold text-foreground">{e.date ?? "—"}</span>
                      </div>
                    ))}
                    {!overview?.upcoming_events?.length && (
                      <p className="py-4 text-sm text-muted-foreground">
                        No events yet — open the Holiday calendar section and seed the Tanzanian calendar.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}

          {view === "campaigns" && (
            <>
              {formOpen && (
                <form onSubmit={createCampaign} className="rounded-xl border bg-card p-5">
                  <h2 className="font-bold text-foreground">New campaign</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Campaign name" className="h-11 rounded-xl border border-border bg-muted px-4 text-sm" />
                    <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}
                      className="h-11 rounded-xl border border-border bg-muted px-4 text-sm">
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                    </select>
                    <select value={form.segment_key} onChange={(e) => setForm({ ...form, segment_key: e.target.value })}
                      className="h-11 rounded-xl border border-border bg-muted px-4 text-sm">
                      {segments.map((s) => (
                        <option key={s.key} value={s.key}>{s.label} (~{s.estimated_recipients})</option>
                      ))}
                    </select>
                    <input type="datetime-local" value={form.scheduled_at}
                      onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                      className="h-11 rounded-xl border border-border bg-muted px-4 text-sm" />
                    {form.channel === "email" && (
                      <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="Email subject" className="h-11 rounded-xl border border-border bg-muted px-4 text-sm sm:col-span-2" />
                    )}
                    <textarea required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                      placeholder="Message body — {{name}} is personalized automatically"
                      rows={3} className="rounded-xl border border-border bg-muted p-4 text-sm sm:col-span-2" />
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={() => setFormOpen(false)}
                      className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">Cancel</button>
                    <button disabled={busy === "create"}
                      className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                      Save draft
                    </button>
                  </div>
                </form>
              )}
              <section className="overflow-x-auto rounded-xl border bg-card">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-muted text-xs uppercase text-muted-foreground">
                    <tr>
                      {["Campaign", "Channel", "Audience", "Status", "Delivery", "Scheduled", "Actions"].map((h) => (
                        <th key={h} className="px-5 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {campaigns.map((c) => (
                      <tr key={c.id}>
                        <td className="px-5 py-4">
                          <p className="font-semibold">{c.name}</p>
                          <p className="max-w-[240px] truncate text-xs text-muted-foreground">{c.body}</p>
                        </td>
                        <td className="px-5 py-4 uppercase">{c.channel}</td>
                        <td className="px-5 py-4 text-muted-foreground">{c.segment_key}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[c.status] ?? STATUS_STYLE.draft}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">
                          {c.stats?.sent ?? 0} sent · {c.stats?.failed ?? 0} failed · {c.stats?.queued ?? 0} queued
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {c.scheduled_at ? new Date(c.scheduled_at).toLocaleString() : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2 text-xs font-semibold">
                            {c.status === "draft" && (
                              <button disabled={busy === c.id}
                                onClick={() => void act(c.id, "Campaign approved", () => marketingApi.approveCampaign(c.id))}
                                className="text-primary">Approve</button>
                            )}
                            {(c.status === "draft" || c.status === "approved" || c.status === "paused") && (
                              <button disabled={busy === c.id}
                                onClick={() => {
                                  if (confirm(`Send "${c.name}" now? Messages will be queued to the eligible audience immediately.`))
                                    void act(c.id, "Campaign queued", () => marketingApi.sendCampaign(c.id));
                                }}
                                className="text-green-dark">Send now</button>
                            )}
                            {(c.status === "approved" || c.status === "sending") && (
                              <button disabled={busy === c.id}
                                onClick={() => void act(c.id, "Campaign paused", () => marketingApi.pauseCampaign(c.id))}
                                className="text-amber-600">Pause</button>
                            )}
                            {c.status !== "sent" && c.status !== "cancelled" && (
                              <button disabled={busy === c.id}
                                onClick={() => {
                                  if (confirm("Cancel this campaign? Queued messages will be skipped."))
                                    void act(c.id, "Campaign cancelled", () => marketingApi.cancelCampaign(c.id));
                                }}
                                className="text-red-dark">Cancel</button>
                            )}
                            <button disabled={busy === c.id}
                              onClick={() => void act(c.id, "Campaign duplicated", () => marketingApi.duplicateCampaign(c.id))}
                              className="text-muted-foreground">Duplicate</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!campaigns.length && (
                      <tr><td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                        No campaigns yet. Create your first campaign to reach customers.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </section>
            </>
          )}

          {view === "templates" && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {templates.map((t) => (
                <article key={t.id} className="rounded-xl border bg-card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.key} · v{t.version} · {t.language}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${t.is_approved ? "bg-green-light-6 text-green-dark" : "bg-amber-100 text-amber-700"}`}>
                      {t.is_approved ? "approved" : "draft"}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-xs leading-5 text-muted-foreground">{t.body}</p>
                  <div className="mt-4 flex gap-3 text-xs font-semibold">
                    <span className="uppercase text-muted-foreground">{t.channel}</span>
                    {!t.is_approved && (
                      <button disabled={busy === t.id}
                        onClick={() => void act(t.id, "Template approved", () => marketingApi.approveTemplate(t.id))}
                        className="text-primary">Approve</button>
                    )}
                  </div>
                </article>
              ))}
              {!templates.length && (
                <p className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
                  No templates yet. Create approved reusable copy for campaigns.
                </p>
              )}
            </div>
          )}

          {view === "calendar" && (
            <section className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    {["Event", "Date", "Jurisdiction", "Category", "Status", "Lead time"].map((h) => (
                      <th key={h} className="px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {events.map((e) => (
                    <tr key={e.id}>
                      <td className="px-5 py-4 font-semibold">{e.name}</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {e.date_this_year ?? "—"}
                        {e.is_estimated && <span className="ml-1 text-xs text-amber-600">(estimated)</span>}
                      </td>
                      <td className="px-5 py-4 capitalize text-muted-foreground">{e.jurisdiction}</td>
                      <td className="px-5 py-4 capitalize text-muted-foreground">{e.category?.replace(/_/g, " ")}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${e.is_enabled ? "bg-green-light-6 text-green-dark" : "bg-muted text-muted-foreground"}`}>
                          {e.is_enabled ? "enabled" : "disabled"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{e.lead_days} days</td>
                    </tr>
                  ))}
                  {!events.length && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                      No events yet — use "Seed calendar" to load Tanzanian holidays and marketing events.
                    </td></tr>
                  )}
                </tbody>
              </table>
            </section>
          )}

          {view === "automation" && automation && (
            <section className="rounded-xl border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 font-bold text-foreground">
                    <HugeiconsIcon icon={Settings02Icon} size={18} />
                    Monthly customer engagement
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Sends one engagement campaign per month on day {automation.day_of_month} at {automation.send_time} ({automation.timezone}).
                    {!automation.auto_send && " New campaigns are created as drafts for admin approval before sending."}
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" checked={automation.is_enabled}
                    onChange={(e) => void act("auto", e.target.checked ? "Automation enabled" : "Automation paused",
                      () => marketingApi.updateMonthlyAutomation({ is_enabled: e.target.checked }))}
                    className="h-4 w-4" />
                  Enabled
                </label>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Next run</p>
                  <p className="mt-1 font-bold text-foreground">
                    {automation.next_run_at ? new Date(automation.next_run_at).toLocaleString() : "Not scheduled"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Channels</p>
                  <p className="mt-1 font-bold uppercase text-foreground">{(automation.channels || []).join(", ") || "—"}</p>
                </div>
                <div className="rounded-xl bg-muted p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Audience</p>
                  <p className="mt-1 font-bold text-foreground">{automation.segment_key}</p>
                </div>
              </div>
              <label className="mt-5 flex items-start gap-2 text-sm text-muted-foreground">
                <input type="checkbox" checked={automation.auto_send}
                  onChange={(e) => void act("autosend", e.target.checked ? "Auto-send enabled" : "Draft mode enabled",
                    () => marketingApi.updateMonthlyAutomation({ auto_send: e.target.checked }))}
                  className="mt-0.5 h-4 w-4" />
                <span>
                  Auto-send monthly campaigns without manual approval.
                  <span className="block text-xs">Leave off to review each month's campaign as a draft first.</span>
                </span>
              </label>
            </section>
          )}
        </>
      )}
    </div>
  );
}
