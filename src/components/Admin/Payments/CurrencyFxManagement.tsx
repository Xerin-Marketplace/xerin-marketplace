"use client";

import { FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { CircleDollarSign, Globe2, Pencil, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import {
  type AdminCurrency,
  type AdminFxRate,
  createAdminCurrency,
  createAdminFxRate,
  deleteAdminCurrency,
  deleteAdminFxRate,
  listAdminCurrencies,
  listAdminFxRates,
  updateAdminCurrency,
  updateAdminFxRate,
} from "@/lib/api/endpoints/admin";

const INITIAL_CURRENCIES = ["TZS", "USD", "AED", "CNY", "TRY", "GBP"];

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to complete the currency operation";

export default function CurrencyFxManagement() {
  const [currencies, setCurrencies] = useState<AdminCurrency[]>([]);
  const [rates, setRates] = useState<AdminFxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showCurrencyForm, setShowCurrencyForm] = useState(false);
  const [showRateForm, setShowRateForm] = useState(false);
  const [editingCurrencyId, setEditingCurrencyId] = useState<string | null>(null);
  const [currencyForm, setCurrencyForm] = useState({ code: "", name: "", symbol: "", decimal_places: 2 });
  const [rateForm, setRateForm] = useState({ base_currency: "USD", rate: "", source: "Admin configured" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [currencyPage, ratePage] = await Promise.all([
        listAdminCurrencies({ page: 1, page_size: 100 }),
        listAdminFxRates({ page: 1, page_size: 100 }),
      ]);
      setCurrencies(currencyPage.results);
      setRates(ratePage.results);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeListingCurrencies = useMemo(
    () => currencies.filter((currency) => currency.is_active && currency.code !== "TZS"),
    [currencies],
  );

  useEffect(() => {
    if (
      activeListingCurrencies.length > 0 &&
      !activeListingCurrencies.some((currency) => currency.code === rateForm.base_currency)
    ) {
      setRateForm((current) => ({ ...current, base_currency: activeListingCurrencies[0].code }));
    }
  }, [activeListingCurrencies, rateForm.base_currency]);

  async function submitCurrency(event: FormEvent) {
    event.preventDefault();
    if (!currencyForm.code.trim() || !currencyForm.name.trim() || !currencyForm.symbol.trim()) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (editingCurrencyId) {
        await updateAdminCurrency(editingCurrencyId, {
          name: currencyForm.name.trim(),
          symbol: currencyForm.symbol.trim(),
          decimal_places: currencyForm.decimal_places,
        });
        setMessage(`${currencyForm.code.trim().toUpperCase()} updated successfully.`);
      } else {
        await createAdminCurrency({
          code: currencyForm.code.trim().toUpperCase(),
          name: currencyForm.name.trim(),
          symbol: currencyForm.symbol.trim(),
          decimal_places: currencyForm.decimal_places,
          is_active: true,
        });
        setMessage("Currency added successfully.");
      }
      setCurrencyForm({ code: "", name: "", symbol: "", decimal_places: 2 });
      setEditingCurrencyId(null);
      setShowCurrencyForm(false);
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function startEditCurrency(currency: AdminCurrency) {
    setEditingCurrencyId(currency.id);
    setCurrencyForm({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      decimal_places: currency.decimal_places ?? 2,
    });
    setShowCurrencyForm(true);
    setError("");
    setMessage("");
  }

  function cancelCurrencyForm() {
    setEditingCurrencyId(null);
    setCurrencyForm({ code: "", name: "", symbol: "", decimal_places: 2 });
    setShowCurrencyForm(false);
  }

  async function removeCurrency(currency: AdminCurrency) {
    if (currency.code === "TZS") return;
    if (!window.confirm(`Delete ${currency.code}? This is only allowed when the currency is inactive and has never been used by products, orders, payments, countries or FX rates.`)) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await deleteAdminCurrency(currency.id);
      setMessage(result.message);
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function submitRate(event: FormEvent) {
    event.preventDefault();
    const rate = Number(rateForm.rate);
    if (!rateForm.base_currency || !Number.isFinite(rate) || rate <= 0) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await createAdminFxRate({
        base_currency: rateForm.base_currency,
        quote_currency: "TZS",
        rate,
        source: rateForm.source.trim() || "Admin configured",
        is_active: true,
      });
      setRateForm((current) => ({ ...current, rate: "" }));
      setShowRateForm(false);
      setMessage(`New ${rateForm.base_currency}/TZS rate activated successfully.`);
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function toggleCurrency(currency: AdminCurrency) {
    if (currency.code === "TZS") return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateAdminCurrency(currency.id, { is_active: !currency.is_active });
      setMessage(`${currency.code} ${currency.is_active ? "deactivated" : "activated"}.`);
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function toggleRate(rate: AdminFxRate) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateAdminFxRate(rate.id, { is_active: !rate.is_active });
      setMessage(`${rate.base_currency}/TZS rate ${rate.is_active ? "deactivated" : "activated"}.`);
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }


  async function removeRate(rate: AdminFxRate) {
    if (rate.is_active) {
      setError("Deactivate the FX rate before deleting it.");
      return;
    }
    if (!window.confirm(`Delete historical ${rate.base_currency}/${rate.quote_currency} rate?`)) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await deleteAdminFxRate(rate.id);
      setMessage(result.message);
      await load();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const currentRates = useMemo(() => rates.filter((rate) => rate.is_active), [rates]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700">
            <ShieldCheck size={18} />
          </span>
          <div>
            <h3 className="font-bold text-emerald-950">TZS settlement policy</h3>
            <p className="mt-1 text-sm leading-6 text-emerald-900/80">
              TZS is the protected marketplace base and payment-settlement currency. Sellers may list products in other
              active currencies, but checkout and payment gateway settlement will remain in TZS.
            </p>
          </div>
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Globe2 size={18} className="text-[#f47524]" />
              <h3 className="font-bold text-slate-900">Supported currencies</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Initial marketplace currencies: {INITIAL_CURRENCIES.join(", ")}.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => void load()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 disabled:opacity-50">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={() => {
                if (showCurrencyForm && !editingCurrencyId) {
                  cancelCurrencyForm();
                } else {
                  setEditingCurrencyId(null);
                  setCurrencyForm({ code: "", name: "", symbol: "", decimal_places: 2 });
                  setShowCurrencyForm(true);
                }
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#f47524] px-4 text-sm font-semibold text-white">
              <Plus size={14} /> Add currency
            </button>
          </div>
        </div>

        {showCurrencyForm && (
          <form onSubmit={submitCurrency} className="mt-5 grid gap-3 rounded-xl border border-orange-100 bg-orange-50/40 p-4 sm:grid-cols-2 xl:grid-cols-5">
            <Field label="Code"><input maxLength={10} value={currencyForm.code} onChange={(e) => setCurrencyForm((v) => ({ ...v, code: e.target.value.toUpperCase() }))} placeholder="EUR" required disabled={Boolean(editingCurrencyId)} className="field disabled:bg-slate-100" /></Field>
            <Field label="Name"><input value={currencyForm.name} onChange={(e) => setCurrencyForm((v) => ({ ...v, name: e.target.value }))} placeholder="Euro" required className="field" /></Field>
            <Field label="Symbol"><input value={currencyForm.symbol} onChange={(e) => setCurrencyForm((v) => ({ ...v, symbol: e.target.value }))} placeholder="€" required className="field" /></Field>
            <Field label="Decimal places"><input type="number" min={0} max={8} value={currencyForm.decimal_places} onChange={(e) => setCurrencyForm((v) => ({ ...v, decimal_places: Number(e.target.value) }))} className="field" /></Field>
            <div className="flex items-end gap-2">
              <button disabled={saving} className="h-11 flex-1 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving..." : editingCurrencyId ? "Update currency" : "Save currency"}</button>
              {editingCurrencyId && <button type="button" onClick={cancelCurrencyForm} className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold">Cancel</button>}
            </div>
          </form>
        )}

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Currency", "Symbol", "Role", "Decimals", "Status", "Action"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {currencies.map((currency) => (
                <tr key={currency.id}>
                  <td className="px-4 py-4"><p className="font-semibold text-slate-900">{currency.code}</p><p className="text-xs text-slate-500">{currency.name}</p></td>
                  <td className="px-4 py-4">{currency.symbol}</td>
                  <td className="px-4 py-4">{currency.code === "TZS" ? "Settlement / base" : "Listing / display"}</td>
                  <td className="px-4 py-4">{currency.decimal_places ?? 2}</td>
                  <td className="px-4 py-4"><Badge active={currency.is_active}>{currency.is_active ? "Active" : "Inactive"}</Badge></td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <button disabled={saving} onClick={() => startEditCurrency(currency)} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 disabled:opacity-50"><Pencil size={14}/> Edit</button>
                      {currency.code === "TZS" ? (
                        <span className="text-xs font-semibold text-emerald-700">Protected</span>
                      ) : (
                        <>
                          <button disabled={saving} onClick={() => void toggleCurrency(currency)} className="text-sm font-semibold text-[#f47524] disabled:opacity-50">{currency.is_active ? "Deactivate" : "Activate"}</button>
                          <button disabled={saving || currency.is_active} onClick={() => void removeCurrency(currency)} title={currency.is_active ? "Deactivate before deleting" : "Delete currency"} className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={14}/> Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && currencies.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No currency records found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><CircleDollarSign size={18} className="text-[#f47524]" /><h3 className="font-bold text-slate-900">Exchange rates to TZS</h3></div>
            <p className="mt-1 text-sm text-slate-500">Enter rates as “1 listing currency = X TZS”. Saving a new active rate automatically retires the previous active rate for that currency.</p>
          </div>
          <button disabled={!activeListingCurrencies.length} onClick={() => setShowRateForm((value) => !value)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#f47524] px-4 text-sm font-semibold text-white disabled:opacity-40"><Plus size={14}/> Set FX rate</button>
        </div>

        {showRateForm && (
          <form onSubmit={submitRate} className="mt-5 grid gap-3 rounded-xl border border-orange-100 bg-orange-50/40 p-4 sm:grid-cols-2 xl:grid-cols-5">
            <Field label="Listing currency"><select value={rateForm.base_currency} onChange={(e) => setRateForm((v) => ({ ...v, base_currency: e.target.value }))} className="field">{activeListingCurrencies.map((currency) => <option key={currency.id} value={currency.code}>{currency.code} — {currency.name}</option>)}</select></Field>
            <Field label="Settlement currency"><input value="TZS" disabled className="field bg-slate-100" /></Field>
            <Field label={`1 ${rateForm.base_currency || "currency"} equals`}><input type="number" min="0.00000001" step="0.00000001" value={rateForm.rate} onChange={(e) => setRateForm((v) => ({ ...v, rate: e.target.value }))} placeholder="2600" required className="field" /></Field>
            <Field label="Source / note"><input value={rateForm.source} onChange={(e) => setRateForm((v) => ({ ...v, source: e.target.value }))} placeholder="Admin configured" className="field" /></Field>
            <div className="flex items-end"><button disabled={saving || !activeListingCurrencies.length} className="h-11 w-full rounded-xl bg-slate-900 px-4 text-sm font-semibold text-black disabled:opacity-50">{saving ? "Saving..." : "Activate rate"}</button></div>
          </form>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {activeListingCurrencies.map((currency) => {
            const rate = currentRates.find((item) => item.base_currency === currency.code && item.quote_currency === "TZS");
            return <div key={currency.id} className="rounded-xl border border-slate-200 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{currency.code} / TZS</p><p className="mt-2 text-xl font-bold text-slate-900">{rate ? `1 ${currency.code} = ${Number(rate.rate).toLocaleString()} TZS` : "Rate required"}</p><p className="mt-1 text-xs text-slate-500">{rate?.source || "No active rate configured"}</p></div>;
          })}
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Pair", "Rate", "Source", "Effective from", "Status", "Action"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y">
              {rates.map((rate) => (
                <tr key={rate.id}>
                  <td className="px-4 py-4 font-semibold">{rate.base_currency} / {rate.quote_currency}</td>
                  <td className="px-4 py-4">1 {rate.base_currency} = {Number(rate.rate).toLocaleString(undefined, { maximumFractionDigits: 8 })} TZS</td>
                  <td className="px-4 py-4">{rate.source || "Admin configured"}</td>
                  <td className="px-4 py-4 text-slate-500">{new Date(rate.effective_at).toLocaleString()}</td>
                  <td className="px-4 py-4"><Badge active={rate.is_active}>{rate.is_active ? "Active" : "Historical"}</Badge></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <button disabled={saving} onClick={() => void toggleRate(rate)} className="text-sm font-semibold text-[#f47524] disabled:opacity-50">{rate.is_active ? "Deactivate" : "Activate"}</button>
                      <button disabled={saving || rate.is_active} onClick={() => void removeRate(rate)} title={rate.is_active ? "Deactivate before deleting" : "Delete historical rate"} className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-40"><Trash2 size={14}/> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rates.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No exchange rate has been configured yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx>{`
        .field { height: 44px; width: 100%; border-radius: 12px; border: 1px solid #e2e8f0; background: white; padding: 0 12px; font-size: 14px; outline: none; }
        .field:focus { border-color: #fdba74; box-shadow: 0 0 0 3px rgba(251, 146, 60, .12); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>;
}

function Badge({ active, children }: { active: boolean; children: ReactNode }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{children}</span>;
}
