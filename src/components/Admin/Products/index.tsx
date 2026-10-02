"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, CheckmarkCircle02Icon, ViewIcon, PackageIcon, RefreshCwIcon, Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { adminService, type AdminProduct } from "@/lib/api/endpoints/admin";
import { API_BASE_URL } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/errors";
import { formatCurrency } from "@/lib/formatCurrency";
import Pagination from "@/components/ui/Pagination";

const errorMessage=(error:unknown)=>error instanceof ApiError||error instanceof Error?error.message:"Unable to load product moderation data.";
const resolveImage=(url?:string|null)=>{if(!url)return "";if(/^(data:|blob:)/.test(url))return url;try{const api=new URL(API_BASE_URL);if(/^https?:/.test(url)){const absolute=new URL(url);if(absolute.pathname.startsWith("/api/v1/uploads/"))absolute.pathname=absolute.pathname.replace(/^\/api\/v1\/uploads\//,"/uploads/");return absolute.toString();}return `${api.origin}${url.startsWith("/")?"":"/"}${url}`;}catch{return url;}};

export default function AdminProducts(){
 const [products,setProducts]=useState<AdminProduct[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 const [query,setQuery]=useState("");const [debouncedQuery,setDebouncedQuery]=useState("");const [page,setPage]=useState(1);const [pageSize,setPageSize]=useState(20);const [total,setTotal]=useState(0);const [totalPages,setTotalPages]=useState(0);
 const [selected,setSelected]=useState<AdminProduct|null>(null);const [detailLoading,setDetailLoading]=useState(false);const [busy,setBusy]=useState(false);const [rejectOpen,setRejectOpen]=useState(false);const [reason,setReason]=useState("");

 const load=async()=>{setLoading(true);setError("");try{const result=await adminService.listCatalogProducts({page,page_size:pageSize,search:debouncedQuery||undefined,status_filter:"pending_review"});setProducts(result.results);setTotal(result.total);setTotalPages(result.total_pages);}catch(e){setError(errorMessage(e));}finally{setLoading(false);}};
 useEffect(()=>{const timer=window.setTimeout(()=>{setDebouncedQuery(query.trim());setPage(1);},350);return()=>window.clearTimeout(timer);},[query]);
 useEffect(()=>{void load();/* eslint-disable-next-line react-hooks/exhaustive-deps */},[page,pageSize,debouncedQuery]);

 const review=async(row:AdminProduct)=>{setSelected(row);setDetailLoading(true);try{setSelected(await adminService.getProductReviewDetail(row.id));}catch(e){toast.error(errorMessage(e));}finally{setDetailLoading(false);}};
 const approve=async()=>{if(!selected)return;setBusy(true);try{await adminService.approveProduct(selected.id);toast.success("Product approved.");setSelected(null);await load();}catch(e){toast.error(errorMessage(e));}finally{setBusy(false);}};
 const reject=async()=>{if(!selected||reason.trim().length<5)return;setBusy(true);try{await adminService.rejectProduct(selected.id,reason.trim());toast.success("Product rejected with correction reason.");setReason("");setRejectOpen(false);setSelected(null);await load();}catch(e){toast.error(errorMessage(e));}finally{setBusy(false);}};

 return <div className="space-y-4">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <h2 className="text-lg font-bold tracking-tight text-foreground">Products awaiting review</h2>
 <div className="flex items-center gap-2">
 <label className="relative">
 <HugeiconsIcon icon={Search01Icon} size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
 <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..." className="h-10 w-[220px] rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary sm:w-[280px]"/>
 </label>
 <button onClick={()=>void load()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-xs font-semibold text-foreground transition hover:border-primary hover:text-primary">
 <HugeiconsIcon icon={RefreshCwIcon} size={14}/>Refresh</button>
 </div>
 </div>
 <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
 {loading?<p className="p-12 text-center text-muted-foreground">Loading pending products...</p>:error?<p className="p-12 text-center text-destructive">{error}</p>:!products.length?<div className="p-12 text-center">
<HugeiconsIcon icon={CheckmarkCircle02Icon} className="mx-auto text-success"/>
<p className="mt-3 font-semibold">No products awaiting review.</p>
</div>:<div className="overflow-x-auto">
<table className="w-full min-w-[900px] text-left text-sm">
<thead className="bg-muted">
<tr>{["Product","SKU","Price","Submitted","Images","Status","Action"].map(x=>
<th key={x} className="px-5 py-3">{x}</th>)}</tr>
</thead>
<tbody className="divide-y">{products.map(p=>{const image=p.images?.find(i=>i.is_primary)||p.images?.[0];return <tr key={p.id}>
<td className="px-5 py-4">
<div className="flex items-center gap-3">
<div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-muted">{image?.image_url?<Image src={resolveImage(image.thumbnail_url||image.image_url)} alt={p.name} fill unoptimized className="object-cover"/>:<HugeiconsIcon icon={PackageIcon} size={18}/>}</div>
<div>
<p className="font-semibold">{p.name}</p>
<p className="max-w-xs truncate text-xs text-muted-foreground">{p.seller_business_name||p.description||"No description"}</p>
</div>
</div>
</td>
<td className="px-5 py-4 text-muted-foreground">{p.sku}</td>
<td className="px-5 py-4 font-semibold">{formatCurrency(p.sale_price??p.price,p.currency)}</td>
<td className="px-5 py-4 text-muted-foreground">{new Date(p.submitted_at||p.created_at).toLocaleDateString()}</td>
<td className="px-5 py-4">{p.images?.length??0}</td>
<td className="px-5 py-4">
<span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold capitalize text-primary-700">{p.status.replaceAll("_"," ")}</span>
</td>
<td className="px-5 py-4">
<button onClick={()=>void review(p)} className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-xs font-semibold text-background">
<HugeiconsIcon icon={ViewIcon} size={14}/>Review</button>
</td>
</tr>})}</tbody>
</table>
</div>}
 {!loading&&!error&&<Pagination page={page} pageSize={pageSize} total={total} totalPages={totalPages} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1);}}/>}
 </section>
 {selected&&<div className="fixed inset-0 z-[100] flex justify-end bg-black/50" onMouseDown={()=>!busy&&setSelected(null)}>
<aside onMouseDown={e=>e.stopPropagation()} className="flex h-full w-full max-w-3xl flex-col bg-muted shadow-lg">
<div className="flex items-start justify-between border-b bg-card p-5">
<div>
<p className="text-xs font-bold uppercase tracking-[.14em] text-primary">Product review</p>
<h3 className="mt-1 text-xl font-bold">{selected.name}</h3>
<p className="text-xs text-muted-foreground">SKU {selected.sku}</p>
</div>
<button onClick={()=>setSelected(null)} className="rounded-lg bg-muted p-2">
<HugeiconsIcon icon={Cancel01Icon} size={16}/>
</button>
</div>
<div className="flex-1 space-y-5 overflow-y-auto p-5">{detailLoading?<p className="py-16 text-center">Loading full product details...</p>:<>
<Card title="Product images">{selected.images?.length?<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{selected.images.map(img=>
<div key={img.id} className="relative h-44 overflow-hidden rounded-xl border bg-muted">
<Image src={resolveImage(img.image_url)} alt={img.alt_text||selected.name} fill unoptimized className="object-contain"/>{img.is_primary&&<span className="absolute left-2 top-2 rounded bg-foreground px-2 py-1 text-[9px] font-bold text-background">PRIMARY</span>}</div>)}</div>:<p className="rounded-xl bg-yellow-light-4 p-4 text-sm text-yellow-dark-2">No image submitted. Do not approve until an image is provided.</p>}</Card>
<div className="grid gap-4 sm:grid-cols-2">
<Info label="Seller" value={selected.seller_business_name||selected.seller_id}/>
<Info label="Category" value={selected.category_name||selected.category_id}/>
<Info label="Brand" value={selected.brand_name||"Unbranded"}/>
<Info label="Weight" value={selected.weight?`${selected.weight} kg`:"Not provided"}/>
</div>
<Card title="Description">
<p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{selected.description||"No description provided."}</p>
</Card>
<Card title="Pricing & ownership">
<div className="grid gap-3 sm:grid-cols-2">
<Info label="Regular price" value={formatCurrency(selected.price,selected.currency)}/>
<Info label="Sale price" value={selected.sale_price!=null?formatCurrency(selected.sale_price,selected.currency):"No sale price"}/>
<Info label="Seller SKU" value={selected.sku}/>
<Info label="Currency" value={selected.currency}/>
</div>
</Card>
<Card title="Seller contact">
<div className="grid gap-3 sm:grid-cols-2">
<Info label="Email" value={selected.seller_contact_email||"—"}/>
<Info label="Phone" value={selected.seller_contact_phone||"—"}/>
</div>
</Card>
</>}</div>
<div className="border-t bg-card p-5">
<p className="mb-3 text-xs text-muted-foreground">Approve only when the listing is complete and acceptable.</p>
<div className="grid gap-3 sm:grid-cols-2">
<button disabled={busy||detailLoading} onClick={()=>void approve()} className="rounded-xl bg-success py-3 text-sm font-semibold text-white disabled:opacity-50">Approve Product</button>
<button disabled={busy||detailLoading} onClick={()=>setRejectOpen(true)} className="rounded-xl bg-destructive py-3 text-sm font-semibold text-white disabled:opacity-50">Reject Product</button>
</div>
</div>
</aside>
</div>}
 {rejectOpen&&selected&&<div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4">
<div className="w-full max-w-lg rounded-xl bg-card p-6">
<div className="flex gap-3">
<HugeiconsIcon icon={AlertCircleIcon} className="text-destructive"/>
<div>
<h3 className="font-bold">Reject product</h3>
<p className="text-sm text-muted-foreground">Give the seller a clear correction reason.</p>
</div>
</div>
<textarea autoFocus rows={5} value={reason} onChange={e=>setReason(e.target.value)} placeholder="Example: The main image is unclear..." className="mt-5 w-full rounded-xl border-2 p-4 text-sm outline-none focus:border-red-400"/>
<div className="mt-4 grid grid-cols-2 gap-3">
<button onClick={()=>{setRejectOpen(false);setReason("")}} className="rounded-xl border py-3 font-semibold">Cancel</button>
<button disabled={busy||reason.trim().length<5} onClick={()=>void reject()} className="rounded-xl bg-destructive py-3 font-semibold text-white disabled:opacity-50">Confirm Rejection</button>
</div>
</div>
</div>}
 </div>;
}
function Card({title,children}:{title:string;children:React.ReactNode}){return <section className="rounded-xl border bg-card p-5">
<h4 className="mb-4 font-semibold">{title}</h4>{children}</section>}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-muted p-4">
<p className="text-xs text-muted-foreground">{label}</p>
<p className="mt-1 break-words text-sm font-semibold">{value}</p>
</div>}
