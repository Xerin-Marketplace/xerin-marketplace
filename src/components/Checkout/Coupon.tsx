"use client";

import React, { useState } from "react";
import { useApplyCoupon } from "@/hooks/useCartActions";

const Coupon = () => {
 const [code, setCode] = useState("");
 const applyCoupon = useApplyCoupon();

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!code.trim()) return;
 applyCoupon.mutate(code.trim());
 };

 return (
 <div>
 <div>
 <h3 className="text-base font-bold text-foreground sm:text-xl sm:font-medium">Have any Coupon Code?</h3>
 </div>

 <div className="mt-3">
 <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
 <input
 type="text"
 name="coupon"
 id="coupon"
 value={code}
 onChange={(e) => setCode(e.target.value)}
 placeholder="Enter coupon code"
 className="h-12 w-full rounded-xl bg-muted px-4 text-base outline-none duration-200 placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/30 sm:text-sm"
 />

 <button
 type="submit"
 disabled={applyCoupon.isPending || !code.trim()}
 className="inline-flex h-12 items-center justify-center rounded-xl bg-foreground px-6 font-semibold text-background duration-200 hover:opacity-90 disabled:opacity-50 sm:w-auto"
 >
 {applyCoupon.isPending ? "Applying..." : "Apply"}
 </button>
 </div>
 </div>
 </div>
 );
};

export default Coupon;
