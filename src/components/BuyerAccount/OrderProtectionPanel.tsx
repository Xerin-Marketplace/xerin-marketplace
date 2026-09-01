"use client";

import { ordersApi } from "@/lib/api/endpoints/commerce";
import { formatCurrency } from "@/lib/formatCurrency";
import type {
  CustomerEscrowItemSummary,
  CustomerEscrowSummary,
  SettlementProtectionClaimReason,
} from "@/types/api/commerce";
import { AlertTriangle, BadgeCheck, Clock3, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

const REASONS: Array<[SettlementProtectionClaimReason, string]> = [
  ["wrong_product", "Wrong product received"],
  ["not_as_described", "Product is not as described"],
  ["defective_on_arrival", "Defective on arrival"],
  ["damaged_on_arrival", "Damaged on arrival"],
  ["missing_item", "Item missing"],
  ["package_damaged", "Package damaged during delivery"],
  ["package_tampered", "Package tampered during delivery"],
  ["wrong_delivery_recipient", "Delivered to the wrong recipient"],
  ["entire_delivery_missing", "Entire delivery is missing"],
  ["late_delivery", "Late delivery"],
  ["customer_accidental_damage", "I damaged it after delivery"],
  ["change_of_mind", "Changed my mind"],
  ["other", "Other"],
];

const pretty = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (x) => x.toUpperCase());

export default function OrderProtectionPanel({
  orderId,
  escrow,
  onEscrowChange,
  onAcceptAll,
  acceptingAll,
}: {
  orderId: string;
  escrow: CustomerEscrowSummary;
  onEscrowChange: (value: CustomerEscrowSummary) => void;
  onAcceptAll: () => void;
  acceptingAll: boolean;
}) {
  const [busyItem, setBusyItem] = useState("");
  const [reporting, setReporting] = useState<CustomerEscrowItemSummary | null>(null);
  const [reason, setReason] = useState<SettlementProtectionClaimReason>("damaged_on_arrival");
  const [notes, setNotes] = useState("");
  const [scope, setScope] = useState<"item" | "order">("item");
  const [whenNoticed, setWhenNoticed] = useState<
    "before_acceptance" | "on_opening" | "after_initial_use" | "later_after_delivery"
  >("on_opening");
  const [packageDamaged, setPackageDamaged] = useState(false);
  const [productUsed, setProductUsed] = useState(false);
  const [error, setError] = useState("");

  const deadline = useMemo(
    () => (escrow.release_after ? new Date(escrow.release_after) : null),
    [escrow.release_after],
  );

  const acceptItem = async (item: CustomerEscrowItemSummary) => {
    if (!item.can_customer_accept || busyItem) return;
    setBusyItem(item.order_item_id);
    setError("");
    try {
      const updated = await ordersApi.acceptEscrowItem(
        orderId,
        item.order_item_id,
        "Customer accepted delivered product",
      );
      onEscrowChange(updated);
    } catch (cause) {
      const candidate = cause as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      setError(
        candidate.response?.data?.detail ||
          candidate.message ||
          "Unable to accept this product.",
      );
    } finally {
      setBusyItem("");
    }
  };

  const submitProblem = async () => {
    if (!reporting || busyItem) return;
    if (notes.trim().length < 5) {
      setError("Please briefly describe what happened before submitting the claim.");
      return;
    }

    setBusyItem(reporting.order_item_id);
    setError("");
    try {
      await ordersApi.createProtectionClaim(orderId, {
        scope,
        order_item_id: scope === "item" ? reporting.order_item_id : undefined,
        reason,
        notes: notes.trim(),
        when_noticed: whenNoticed,
        package_damaged: packageDamaged,
        product_used: productUsed,
      });
      onEscrowChange(await ordersApi.escrowStatus(orderId));
      setReporting(null);
      setNotes("");
      setPackageDamaged(false);
      setProductUsed(false);
    } catch (cause) {
      const candidate = cause as {
        response?: { data?: { detail?: string } };
        message?: string;
      };
      setError(
        candidate.response?.data?.detail ||
          candidate.message ||
          "Unable to submit the problem.",
      );
    } finally {
      setBusyItem("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-4 text-sm text-slate-700">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-[#f47524]" size={20} />
          <div>
            <p className="font-bold text-slate-950">Delivery protection</p>
            {escrow.delivery_verified_at ? (
              <p className="mt-1 leading-6">
                Delivery has been verified. Seller funds remain protected
                {deadline ? (
                  <>
                    {" "}until <b>{deadline.toLocaleString()}</b>
                  </>
                ) : (
                  " until the configured deadline"
                )}
                . You can release an eligible item earlier when you are satisfied.
              </p>
            ) : (
              <p className="mt-1 leading-6">
                Seller funds remain in escrow. The protection clock starts only after verified delivery.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {escrow.items.map((item, index) => {
          const released = Number(item.remaining_amount) <= 0 || item.status === "released";
          return (
            <article
              key={item.order_item_id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-bold text-slate-950 dark:text-white">
                    Order item {index + 1}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Reference: {item.order_item_id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#f47524]">
                    Seller entitlement: {formatCurrency(item.seller_amount, escrow.currency)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Remaining protected: {formatCurrency(item.remaining_amount, escrow.currency)}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                    released
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {pretty(item.status)}
                </span>
              </div>

              {item.release_after && !released ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Clock3 size={14} />
                  Automatic release after {new Date(item.release_after).toLocaleString()}
                </div>
              ) : null}

              {released ? (
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <BadgeCheck size={15} />
                  This seller entitlement has been released.
                </div>
              ) : null}

              {!released && (item.can_customer_accept || item.can_report_problem) ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.can_customer_accept ? (
                    <button
                      type="button"
                      disabled={busyItem === item.order_item_id}
                      onClick={() => void acceptItem(item)}
                      className="rounded-xl bg-[#f47524] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50"
                    >
                      Everything is OK — Accept Item
                    </button>
                  ) : null}
                  {item.can_report_problem ? (
                    <button
                      type="button"
                      onClick={() => {
                        setReporting(item);
                        setScope("item");
                        setError("");
                      }}
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-black text-slate-800 dark:border-white/20 dark:text-white"
                    >
                      Report a Problem
                    </button>
                  ) : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {escrow.can_customer_approve ? (
        <button
          type="button"
          onClick={onAcceptAll}
          disabled={acceptingAll}
          className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-60 dark:bg-[#f47524]"
        >
          {acceptingAll ? "Releasing seller funds..." : "Everything is OK — Accept Entire Order"}
        </button>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</p>
      ) : null}

      {reporting ? (
        <div className="fixed inset-0 z-[170] flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#f47524]">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h3 className="font-black text-slate-950">Report a delivery problem</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Tell Xerin exactly what happened. A complaint does not automatically blame the Seller.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-bold text-slate-800">
                Problem applies to
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as "item" | "order")}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
                >
                  <option value="item">This product / item</option>
                  <option value="order">Entire delivery / order</option>
                </select>
              </label>

              <label className="block text-sm font-bold text-slate-800">
                Reason
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as SettlementProtectionClaimReason)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
                >
                  {REASONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-bold text-slate-800">
                When did you notice it?
                <select
                  value={whenNoticed}
                  onChange={(e) =>
                    setWhenNoticed(
                      e.target.value as
                        | "before_acceptance"
                        | "on_opening"
                        | "after_initial_use"
                        | "later_after_delivery",
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3"
                >
                  <option value="before_acceptance">Before accepting delivery</option>
                  <option value="on_opening">Immediately after opening</option>
                  <option value="after_initial_use">After initial use</option>
                  <option value="later_after_delivery">Later after delivery</option>
                </select>
              </label>

              <label className="block text-sm font-bold text-slate-800">
                What happened?
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Describe the package condition, product condition and what happened."
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={packageDamaged}
                    onChange={(e) => setPackageDamaged(e.target.checked)}
                  />
                  Package was damaged
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={productUsed}
                    onChange={(e) => setProductUsed(e.target.checked)}
                  />
                  Product was used
                </label>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                Wrong/not-as-described/defective/missing/damaged-on-arrival cases can protect the affected item while reviewed. Customer-caused damage, change of mind and late delivery do not automatically freeze Seller escrow.
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setReporting(null)}
                className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyItem === reporting.order_item_id}
                onClick={() => void submitProblem()}
                className="min-h-11 rounded-xl bg-[#f47524] px-4 text-sm font-black text-white disabled:opacity-50"
              >
                Submit for Review
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
