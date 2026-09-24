import { useCartView } from "@/hooks/useCartActions";
import React from "react";
import PriceDisplay from "@/components/shared/PriceDisplay";
import Link from "next/link";

const OrderSummary = () => {
 const {
 items: cartItems,
 total: totalPrice,
 isAuthenticated,
 } = useCartView();
 const isGuest = !isAuthenticated;

 return (
 <div className="lg:max-w-[455px] w-full">
 {/* <!-- order list box --> */}
 <div className="bg-card shadow-sm rounded-lg">
 <div className="border-b border-border py-5 px-4 sm:px-8.5">
 <h3 className="font-medium text-xl text-foreground">Order Summary</h3>
 </div>

 <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
 {/* <!-- title --> */}
 <div className="flex items-center justify-between py-5 border-b border-border">
 <div>
 <h4 className="font-medium text-foreground">Product</h4>
 </div>
 <div>
 <h4 className="font-medium text-foreground text-right">Subtotal</h4>
 </div>
 </div>

 {/* <!-- product item --> */}
 {cartItems.map((item, key) => (
 <div key={key} className="flex items-center justify-between py-5 border-b border-border">
 <div>
 <p className="text-foreground">{item.title}</p>
 </div>
 <div>
 <p className="text-foreground text-right">
 <PriceDisplay amount={item.discountedPrice * item.quantity} sourceCurrency="TZS" />
 </p>
 </div>
 </div>
 ))}

 {/* <!-- total --> */}
 <div className="flex items-center justify-between pt-5">
 <div>
 <p className="font-medium text-lg text-foreground">Total</p>
 </div>
 <div>
 <p className="font-medium text-lg text-foreground text-right">
 <PriceDisplay amount={totalPrice} sourceCurrency="TZS" />
 </p>
 </div>
 </div>

 {/* <!-- checkout button --> */}
 <Link
 href={isGuest ? "/signin?redirect=/checkout" : "/checkout"}
 className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-primary-dark mt-7.5"
 >
 {isGuest ? "Sign in to Checkout" : "Process to Checkout"}
 </Link>
 </div>
 </div>
 </div>
 );
};

export default OrderSummary;
