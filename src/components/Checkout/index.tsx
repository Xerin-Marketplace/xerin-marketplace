"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "../Common/Breadcrumb";
import Billing from "./Billing";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import { useBackendCart, mapBackendCartToUi } from "@/hooks/useCartActions";
import { useCreateOrder } from "@/hooks/useCommerce";
import { useAddresses } from "@/hooks/useAddresses";
import { checkoutApi, paymentsApi } from "@/lib/api/endpoints/commerce";
import { formatCurrency } from "@/lib/formatCurrency";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";

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
  shippingMethod: "",
  paymentMethod: "",
  useDifferentShipping: false,
};

const Checkout = () => {
  const router = useRouter();
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const { data: cart, isLoading: isLoadingCart, error: cartError } = useBackendCart(isAuthenticated);
  const { addresses, createAddress, isCreatingAddress, isLoadingAddresses } = useAddresses(isAuthenticated);
  const createOrder = useCreateOrder();

  useEffect(() => {
    if (!selectedAddressId && addresses.length) {
      const preferred = addresses.find((address) => address.is_default) ?? addresses[0];
      setSelectedAddressId(String(preferred.id));
    }
  }, [addresses, selectedAddressId]);

  const shippingOptions = useQuery({
    queryKey: ["checkout", "shipping-options", selectedAddressId],
    queryFn: ({ signal }) => checkoutApi.shippingOptions(selectedAddressId, signal),
    enabled: Boolean(selectedAddressId && isAuthenticated),
  });
  const paymentOptions = useQuery({
    queryKey: ["checkout", "payment-options"],
    queryFn: ({ signal }) => checkoutApi.paymentOptions(signal),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    const options = shippingOptions.data ?? [];
    if (options.length && !options.some((option) => option.id === form.shippingMethod)) {
      setForm((current) => ({ ...current, shippingMethod: options[0].id }));
    }
  }, [shippingOptions.data, form.shippingMethod]);

  useEffect(() => {
    const options = paymentOptions.data ?? [];
    if (options.length && !options.some((option) => option.id === form.paymentMethod)) {
      setForm((current) => ({ ...current, paymentMethod: options[0].id }));
    }
  }, [paymentOptions.data, form.paymentMethod]);

  const cartItems = cart ? mapBackendCartToUi(cart) : [];
  const quote = useQuery({
    queryKey: ["checkout", "quote", selectedAddressId, form.shippingMethod, cart?.coupon_code],
    queryFn: () => checkoutApi.quote({
      shipping_address_id: selectedAddressId,
      shipping_method_id: form.shippingMethod,
      coupon_code: cart?.coupon_code ?? undefined,
    }),
    enabled: Boolean(selectedAddressId && form.shippingMethod && cartItems.length),
  });
  const shippingAmount = quote.data ? Number(quote.data.shipping_amount) : null;
  const total = quote.data ? Number(quote.data.total) : null;

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
      let shippingAddressId = selectedAddressId;
      let shippingMethodId = form.shippingMethod;
      if (!shippingAddressId) {
        const billingAddress = await createAddress({
          country: form.country,
          region: form.region,
          city: form.city,
          street: [form.street, form.street2].filter(Boolean).join(", "),
          postal_code: form.postalCode || null,
          is_default: addresses.length === 0,
        });
        shippingAddressId = String(billingAddress.id);
        const available = await checkoutApi.shippingOptions(shippingAddressId);
        if (!available.length) throw new Error("Delivery is unavailable for this address");
        shippingMethodId = available[0].id;
      }

      if (!shippingMethodId || !form.paymentMethod) {
        throw new Error("Select an available shipping and payment method");
      }

      await checkoutApi.quote({
        shipping_address_id: shippingAddressId,
        shipping_method_id: shippingMethodId,
        coupon_code: cart?.coupon_code ?? undefined,
      });

      const order = await createOrder.mutateAsync({
        shipping_address_id: shippingAddressId,
        shipping_method_id: shippingMethodId,
        payment_method: form.paymentMethod,
        idempotency_key: idempotencyKey,
        coupon_code: cart?.coupon_code || undefined,
        notes: form.notes || undefined,
      });

      const payment = await paymentsApi.initiate({
        order_id: String(order.id),
        method: form.paymentMethod,
      });

      toast.success(payment.status === "pending" ? "Order placed. Payment is pending." : "Order placed successfully");
      router.push(`/order-success/${order.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    }
  };

  if (hasHydrated && !isAuthenticated) {
    router.replace("/signin?redirect=/checkout");
    return null;
  }

  if (isLoadingCart || isLoadingAddresses) {
    return <section className="py-20 text-center">Loading secure checkout…</section>;
  }

  if (cartError) {
    return <section className="py-20 text-center text-red">Checkout could not load your cart. Please retry.</section>;
  }

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
                {addresses.length > 0 && (
                  <div className="mb-7.5 rounded-[10px] bg-white p-4 shadow-1 dark:bg-darkTheme-card sm:p-8.5">
                    <label htmlFor="saved-address" className="mb-2 block font-medium">Delivery address</label>
                    <select
                      id="saved-address"
                      value={selectedAddressId}
                      onChange={(event) => setSelectedAddressId(event.target.value)}
                      className="w-full rounded-md border border-gray-3 bg-transparent p-3"
                    >
                      {addresses.map((address) => (
                        <option key={String(address.id)} value={String(address.id)}>
                          {address.street}, {address.city}, {address.region}, {address.country}
                        </option>
                      ))}
                    </select>
                    <a href="/account/addresses" className="mt-3 inline-block text-sm text-blue">Manage saved addresses</a>
                  </div>
                )}
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
                        {shippingAmount === null ? "Select delivery address" : formatCurrency(shippingAmount, quote.data?.currency)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-5">
                      <p className="font-medium text-lg text-dark dark:text-white">Total</p>
                      <p className="font-medium text-lg text-dark dark:text-white text-right">
                        {total === null ? "Pending quote" : formatCurrency(total, quote.data?.currency)}
                      </p>
                    </div>
                  </div>
                </div>

                <Coupon />
                <ShippingMethod
                  options={shippingOptions.data ?? []}
                  selected={form.shippingMethod}
                  onChange={(value) => updateField("shippingMethod", value)}
                  isLoading={shippingOptions.isLoading}
                />
                <PaymentMethod
                  options={paymentOptions.data ?? []}
                  selected={form.paymentMethod}
                  onChange={(value) => updateField("paymentMethod", value)}
                  isLoading={paymentOptions.isLoading}
                />

                <button
                  type="submit"
                  disabled={createOrder.isPending || isCreatingAddress || quote.isFetching || !form.paymentMethod}
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
