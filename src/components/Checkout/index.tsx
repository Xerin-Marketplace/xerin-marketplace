"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Billing from "./Billing";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import { useBackendCart, mapBackendCartToUi } from "@/hooks/useCartActions";
import { useCreateOrder } from "@/hooks/useCommerce";
import { useAddresses } from "@/hooks/useAddresses";
import { paymentsApi } from "@/lib/api/endpoints/commerce";
import { formatCurrency } from "@/lib/formatCurrency";
import toast from "react-hot-toast";

export type CheckoutForm = {
  firstName: string;
  lastName: string;
  companyName: string;
  country: string;
  street: string;
  street2: string;
  city: string;
  region: string;
  postalCode: string;
  phone: string;
  email: string;
  notes: string;
  shippingCountry: string;
  shippingStreet: string;
  shippingStreet2: string;
  shippingCity: string;
  shippingRegion: string;
  shippingPostalCode: string;
  shippingPhone: string;
  shippingEmail: string;
  shippingMethod: string;
  paymentMethod: string;
  useDifferentShipping: boolean;
};

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  companyName: "",
  country: "",
  street: "",
  street2: "",
  city: "",
  region: "",
  postalCode: "",
  phone: "",
  email: "",
  notes: "",
  shippingCountry: "",
  shippingStreet: "",
  shippingStreet2: "",
  shippingCity: "",
  shippingRegion: "",
  shippingPostalCode: "",
  shippingPhone: "",
  shippingEmail: "",
  shippingMethod: "free",
  paymentMethod: "cash",
  useDifferentShipping: false,
};

const Checkout = () => {
  const router = useRouter();
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const { data: cart } = useBackendCart();
  const { addresses, createAddress, isCreatingAddress } = useAddresses();
  const createOrder = useCreateOrder();

  const cartItems = cart ? mapBackendCartToUi(cart) : [];
  const subtotal = cartItems.reduce((sum, item) => sum + item.discountedPrice * item.quantity, 0);
  const shippingAmount = form.shippingMethod === "free" ? 0 : form.shippingMethod === "fedex" ? 10.99 : 12.5;
  const total = subtotal + shippingAmount;

  const updateField = (field: keyof CheckoutForm, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const required = ["firstName", "lastName", "country", "street", "city", "region", "phone", "email"] as const;
    for (const key of required) {
      if (!form[key]) {
        toast.error(`Please fill in ${key.replace(/([A-Z])/g, " $1").trim()}`);
        return;
      }
    }

    try {
      const billingAddress = await createAddress({
        country: form.country,
        region: form.region,
        city: form.city,
        street: [form.street, form.street2].filter(Boolean).join(", "),
        postal_code: form.postalCode || null,
        is_default: addresses.length === 0,
      });

      const shippingAddressId = billingAddress.id;

      const order = await createOrder.mutateAsync({
        shipping_address_id: String(shippingAddressId),
        coupon_code: cart?.coupon_code || undefined,
        notes: form.notes || undefined,
      });

      if (form.paymentMethod === "cash") {
        toast.success("Order placed successfully");
        router.push(`/account/orders/${order.id}`);
        return;
      }

      const payment = await paymentsApi.initiate({
        order_id: String(order.id),
        method: form.paymentMethod === "bank" ? "bank_transfer" : form.paymentMethod,
        provider: form.paymentMethod === "paypal" ? "paypal" : undefined,
      });

      toast.success("Redirecting to payment...");
      router.push(`/payments/${payment.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Checkout failed");
    }
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Breadcrumb title="Checkout" pages={["checkout"]} />
        <section className="py-20 text-center bg-gray-2 dark:bg-darkTheme-bg">
          <p className="text-dark dark:text-white mb-4">Your cart is empty.</p>
          <a href="/shop-with-sidebar" className="text-blue font-medium">Continue Shopping</a>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Checkout" pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2 dark:bg-darkTheme-bg">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                <Billing form={form} updateField={updateField} />
                <Shipping form={form} updateField={updateField} />

                <div className="bg-white dark:bg-darkTheme-card shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <label htmlFor="notes" className="block mb-2.5 dark:text-darkTheme-body-color">
                    Other Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={5}
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Notes about your order, e.g. special notes for delivery."
                    className="rounded-md border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>
              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                <div className="bg-white dark:bg-darkTheme-card shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 dark:border-darkTheme-border-color py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark dark:text-white">Your Order</h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-5 border-b border-gray-3 dark:border-darkTheme-border-color">
                      <h4 className="font-medium text-dark dark:text-darkTheme-body-color">Product</h4>
                      <h4 className="font-medium text-dark dark:text-darkTheme-body-color text-right">Subtotal</h4>
                    </div>

                    {cartItems.map((item, key) => (
                      <div key={key} className="flex items-center justify-between py-5 border-b border-gray-3 dark:border-darkTheme-border-color">
                        <p className="text-dark dark:text-darkTheme-body-color">{item.title}</p>
                        <p className="text-dark dark:text-darkTheme-body-color text-right">
                          {formatCurrency(item.discountedPrice * item.quantity)}
                        </p>
                      </div>
                    ))}

                    <div className="flex items-center justify-between py-5 border-b border-gray-3 dark:border-darkTheme-border-color">
                      <p className="text-dark dark:text-darkTheme-body-color">Shipping</p>
                      <p className="text-dark dark:text-darkTheme-body-color text-right">
                        {shippingAmount === 0 ? "Free" : formatCurrency(shippingAmount)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-5">
                      <p className="font-medium text-lg text-dark dark:text-white">Total</p>
                      <p className="font-medium text-lg text-dark dark:text-white text-right">{formatCurrency(total)}</p>
                    </div>
                  </div>
                </div>

                <Coupon />
                <ShippingMethod selected={form.shippingMethod} onChange={(value) => updateField("shippingMethod", value)} />
                <PaymentMethod selected={form.paymentMethod} onChange={(value) => updateField("paymentMethod", value)} />

                <button
                  type="submit"
                  disabled={createOrder.isPending || isCreatingAddress}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50"
                >
                  {createOrder.isPending || isCreatingAddress ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
