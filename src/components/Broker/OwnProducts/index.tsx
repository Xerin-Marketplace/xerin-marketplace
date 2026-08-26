"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { brokersApi } from "@/lib/api/endpoints/brokers";
import { productsApi } from "@/lib/api/endpoints/products";
import type { BrokerProduct } from "@/types/api/broker";
import type { Category, Brand, ListingCurrency } from "@/types/api/product";

const emptyForm={name:"",description:"",category_id:"",brand_id:"",price:"",sale_price:"",currency:"TZS",weight:"",quantity:"1",fulfillment_location:""};

function countdown(seconds?:number|null){if(seconds==null)return "—";const h=Math.floor(seconds/3600);const m=Math.floor((seconds%3600)/60);return `${h}h ${m}m`;}

export default function BrokerOwnProducts(){
  const [items,setItems]=useState<BrokerProduct[]>([]); const [categories,setCategories]=useState<Category[]>([]); const [brands,setBrands]=useState<Brand[]>([]); const [currencies,setCurrencies]=useState<ListingCurrency[]>([]);
  const [form,setForm]=useState(emptyForm); const [files,setFiles]=useState<File[]>([]); const [busy,setBusy]=useState(false); const [error,setError]=useState(""); const [message,setMessage]=useState("");
  const load=async()=>{setError("");try{const [p,c,b,cu]=await Promise.all([brokersApi.products(),productsApi.getCategories(),productsApi.getBrands(),productsApi.getListingCurrencies()]);setItems(p);setCategories(c);setBrands(b);setCurrencies(cu);}catch(e){setError(e instanceof Error?e.message:"Unable to load Broker products");}};
  useEffect(()=>{void load();},[]);
  const active=useMemo(()=>items.filter(x=>x.status==="approved"&&x.is_active).length,[items]);
  const expired=useMemo(()=>items.filter(x=>x.listing_expired_at||(!x.is_active&&x.status==="inactive")).length,[items]);
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");setMessage("");try{
    if(!files.length)throw new Error("Choose at least one product image.");
    const created=await brokersApi.createProduct({name:form.name,description:form.description||null,category_id:form.category_id,brand_id:form.brand_id||null,price:form.price,sale_price:form.sale_price||null,currency:form.currency,weight:form.weight||null,quantity:Number(form.quantity),fulfillment_location:form.fulfillment_location});
    await brokersApi.uploadProductImages(created.id,files); const published=await brokersApi.publishProduct(created.id); setForm(emptyForm);setFiles([]);setMessage(published.status==="approved"?"Product is live. Its 24-hour clock has started.":"Product submitted for marketplace review. The 24-hour clock starts only after approval.");await load();
  }catch(e){setError(e instanceof Error?e.message:"Unable to create product");}finally{setBusy(false);}}
  async function archive(id:string){if(!confirm("Archive this Broker listing?"))return;setBusy(true);try{await brokersApi.archiveProduct(id);await load();}catch(e){setError(e instanceof Error?e.message:"Unable to archive product");}finally{setBusy(false);}}
  return <div className="space-y-6 pb-20">
    <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-widest text-orange-300">B2 · Sell Your Own Product</p><h1 className="mt-2 text-3xl font-black">24-hour Broker listings</h1><p className="mt-2 max-w-2xl text-sm text-white/65">Create products you own. Once approved and public, each listing stays live for exactly 24 hours, then Xerin archives it automatically without deleting its history.</p><div className="mt-5 grid grid-cols-3 gap-3 text-center"><Stat n={items.length} l="All"/><Stat n={active} l="Live"/><Stat n={expired} l="Expired"/></div></section>
    {error&&<div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}{message&&<div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{message}</div>}
    <section className="rounded-2xl border bg-white p-5 sm:p-6"><h2 className="text-xl font-black">Create Broker product</h2><form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
      <Field label="Product name"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input"/></Field>
      <Field label="Category"><select required value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})} className="input"><option value="">Select category</option>{categories.map(x=><option key={x.id} value={String(x.id)}>{x.name}</option>)}</select></Field>
      <Field label="Brand (optional)"><select value={form.brand_id} onChange={e=>setForm({...form,brand_id:e.target.value})} className="input"><option value="">No brand</option>{brands.map(x=><option key={x.id} value={String(x.id)}>{x.name}</option>)}</select></Field>
      <Field label="Currency"><select value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})} className="input">{currencies.map(x=><option key={x.code} value={x.code}>{x.code} · {x.name}</option>)}</select></Field>
      <Field label="Price"><input required min="1" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} className="input"/></Field>
      <Field label="Sale price (optional)"><input min="0" type="number" value={form.sale_price} onChange={e=>setForm({...form,sale_price:e.target.value})} className="input"/></Field>
      <Field label="Stock quantity"><input required min="1" type="number" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} className="input"/></Field>
      <Field label="Weight kg (optional)"><input min="0" step="0.01" type="number" value={form.weight} onChange={e=>setForm({...form,weight:e.target.value})} className="input"/></Field>
      <Field label="Pickup / fulfillment location"><input required value={form.fulfillment_location} onChange={e=>setForm({...form,fulfillment_location:e.target.value})} placeholder="e.g. Mikocheni, Dar es Salaam" className="input"/></Field>
      <Field label="Product images"><input required multiple accept="image/jpeg,image/png,image/webp" type="file" onChange={e=>setFiles(Array.from(e.target.files||[]))} className="input"/></Field>
      <div className="md:col-span-2"><Field label="Description"><textarea rows={4} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="input"/></Field></div>
      <div className="md:col-span-2"><button disabled={busy} className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white disabled:opacity-50">{busy?"Publishing…":"Create & Publish"}</button></div>
    </form></section>
    <section className="space-y-3"><h2 className="text-xl font-black">Your Broker products</h2>{!items.length?<div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">No Broker-owned products yet.</div>:items.map(p=><article key={p.id} className="rounded-2xl border bg-white p-4 sm:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">{p.images?.[0]&&<img src={p.images[0].thumbnail_url||p.images[0].image_url} alt={p.name} className="h-full w-full object-cover"/>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{p.name}</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase">{p.status}</span>{p.status==="approved"&&p.is_active&&<span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">{countdown(p.seconds_remaining)} left</span>}</div><p className="mt-1 text-sm text-slate-500">{p.currency} {Number(p.sale_price||p.price).toLocaleString()} · Stock {p.available_quantity}/{p.quantity}</p>{p.rejection_reason&&<p className="mt-2 text-sm font-semibold text-red-600">Reason: {p.rejection_reason}</p>}</div>{p.is_active&&p.status!=="pending_review"&&<button disabled={busy} onClick={()=>void archive(p.id)} className="rounded-xl border px-4 py-2 text-sm font-bold">Archive</button>}</div></article>)}</section>
    <style jsx global>{`.input{width:100%;border:1px solid #e2e8f0;border-radius:.75rem;padding:.75rem .9rem;background:white;outline:none}.input:focus{border-color:#f97316;box-shadow:0 0 0 3px rgba(249,115,22,.12)}`}</style>
  </div>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block text-sm font-semibold text-slate-700"><span className="mb-1.5 block">{label}</span>{children}</label>}
function Stat({n,l}:{n:number;l:string}){return <div className="rounded-2xl bg-white/10 p-3"><div className="text-2xl font-black">{n}</div><div className="text-xs text-white/60">{l}</div></div>}
