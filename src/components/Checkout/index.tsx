"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Breadcrumb from "../Common/Breadcrumb";
import Billing from "./Billing";
import ShippingMethod from "./ShippingMethod";
import XerinExpress from "./XerinExpress";
import MapPinConfirmation from "./MapPinConfirmation";
import DeliveryModeSelector from "./DeliveryMode";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import { useBackendCart, mapBackendCartToUi } from "@/hooks/useCartActions";
import { useCreateOrder } from "@/hooks/useCommerce";
import { useAddresses } from "@/hooks/useAddresses";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  cartApi,
  checkoutApi,
  paymentsApi,
} from "@/lib/api/endpoints/commerce";
import type { DeliveryMode } from "@/types/api/commerce";
import { formatCurrency } from "@/lib/formatCurrency";
import PriceDisplay from "@/components/shared/PriceDisplay";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { Check, ChevronLeft, ChevronRight, Globe2, MapPin } from "lucide-react";

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

const isTanzania = (country?: string | null) =>
  ["tanzania", "united republic of tanzania", "tz"].includes(
    (country || "").trim().toLowerCase(),
  );

const normalizeCountry = (country?: string | null) =>
  String(country || "").trim();

const INTERNATIONAL_COUNTRY_OPTIONS = [
  "Tanzania",
  "United Arab Emirates",
  "China",
  "Turkey",
  "United States",
  "United Kingdom",
];

const countryFlag = (country?: string | null) => {
  const value = normalizeCountry(country).toLowerCase();
  if (isTanzania(value)) return "🇹🇿";
  if (["united arab emirates", "uae"].includes(value)) return "🇦🇪";
  if (["china", "people's republic of china", "prc"].includes(value)) return "🇨🇳";
  if (["turkey", "türkiye", "turkiye"].includes(value)) return "🇹🇷";
  if (["united states", "united states of america", "usa", "us"].includes(value)) return "🇺🇸";
  if (["united kingdom", "uk", "great britain"].includes(value)) return "🇬🇧";
  return "🌍";
};


type CheckoutStep = 1 | 2 | 3 | 4;

const CHECKOUT_STEPS: Array<{ id: CheckoutStep; label: string; shortLabel: string }> = [
  { id: 1, label: "Delivery", shortLabel: "Delivery" },
  { id: 2, label: "Logistics", shortLabel: "Logistics" },
  { id: 3, label: "Review", shortLabel: "Review" },
  { id: 4, label: "Payment", shortLabel: "Payment" },
];

const Checkout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("local");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [paymentProvider, setPaymentProvider] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<CheckoutStep>(1);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  const {
    data: cart,
    isLoading: isLoadingCart,
    error: cartError,
  } = useBackendCart(isAuthenticated);

  const {
    addresses,
    isCreatingAddress,
    isLoadingAddresses,
    refetchAddresses,
  } = useAddresses(isAuthenticated);

  const { profile, isLoadingProfile } = useUserProfile();

  const createOrder = useCreateOrder();
  const cartItems = cart ? mapBackendCartToUi(cart) : [];
  const cartProductTotal = Number(cart?.total ?? 0);

  const deliveryConfig = useQuery({
    queryKey: ["checkout", "delivery-config"],
    queryFn: checkoutApi.deliveryConfig,
    enabled: isAuthenticated,
  });

  const internationalCountryOptions = useMemo(() => {
    const values = new Set<string>(INTERNATIONAL_COUNTRY_OPTIONS);

    addresses.forEach((address) => {
      const country = normalizeCountry(address.country);
      if (country) {
        values.add(country);
      }
    });

    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [addresses]);

  const matchingAddresses = useMemo(
    () =>
      destinationCountry
        ? addresses.filter(
            (address) =>
              normalizeCountry(address.country).toLowerCase() ===
              normalizeCountry(destinationCountry).toLowerCase(),
          )
        : [],
    [addresses, destinationCountry],
  );

  useEffect(() => {
    if (destinationCountry || !addresses.length) return;
    const preferredAddress =
      addresses.find((address) => address.is_default) || addresses[0];
    setDestinationCountry(normalizeCountry(preferredAddress.country));
  }, [addresses, destinationCountry]);

  useEffect(() => {
    const currentStillMatches = matchingAddresses.some(
      (address) => String(address.id) === selectedAddressId,
    );
    if (currentStillMatches) return;

    const preferred =
      matchingAddresses.find((address) => address.is_default) ||
      matchingAddresses[0];
    const nextAddressId = preferred ? String(preferred.id) : "";

    // Do nothing when the derived selection is already the current state.
    // This prevents a render loop while addresses are still loading/empty.
    if (nextAddressId === selectedAddressId) return;

    setSelectedAddressId(nextAddressId);
    setSelectedCompanyId("");
    setForm((current) =>
      current.shippingMethod
        ? { ...current, shippingMethod: "" }
        : current,
    );
  }, [matchingAddresses, selectedAddressId]);

  const selectedAddress = matchingAddresses.find(
    (address) => String(address.id) === selectedAddressId,
  );

  useEffect(() => {
    if (!profile && !selectedAddress) return;

    setForm((current) => ({
      ...current,
      firstName: profile?.first_name || current.firstName,
      lastName: profile?.last_name || current.lastName,
      phone: profile?.phone || selectedAddress?.recipient_phone || current.phone,
      email: profile?.email || current.email,
      country: selectedAddress?.country || current.country,
      street: selectedAddress?.street || current.street,
      city: selectedAddress?.city || current.city,
      region: selectedAddress?.region || current.region,
      postalCode: selectedAddress?.postal_code || current.postalCode,
    }));
  }, [profile, selectedAddress]);

  const detectedDelivery = useQuery({
    queryKey: ["checkout", "detected-delivery-mode", selectedAddressId, cart?.total],
    queryFn: ({ signal }) => checkoutApi.detectDeliveryMode(selectedAddressId, signal),
    enabled: Boolean(selectedAddressId && isAuthenticated && cartItems.length),
    retry: false,
  });

  useEffect(() => {
    const detected = detectedDelivery.data?.delivery_mode;
    if (!detected || detected === deliveryMode) return;
    setDeliveryMode(detected);
    setSelectedCompanyId("");
    setForm((current) => ({ ...current, shippingMethod: "" }));
  }, [detectedDelivery.data, deliveryMode]);

  const xerinExpress = useQuery({
    queryKey: ["checkout", "xerin-express", selectedAddressId, cart?.total],
    queryFn: ({ signal }) => checkoutApi.xerinExpressOptions(selectedAddressId, signal),
    enabled: Boolean(deliveryMode === "local" && selectedAddressId && selectedAddress?.delivery_ready && cartItems.length),
    retry: false,
  });

  const eligibleLogistics = useQuery({
    queryKey: [
      "checkout",
      "eligible-logistics",
      selectedAddressId,
      deliveryMode,
    ],
    queryFn: ({ signal }) =>
      checkoutApi.eligibleLogistics(
        {
          address_id: selectedAddressId,
          delivery_mode: deliveryMode,
        },
        signal,
      ),
    enabled: Boolean(
      selectedAddressId &&
      selectedAddress?.delivery_ready &&
      detectedDelivery.data &&
      detectedDelivery.data.delivery_mode === deliveryMode &&
      isAuthenticated &&
      cartItems.length && deliveryMode === "international"
    ),
    retry: false,
  });

  const deliveryPricing = useQuery({
    queryKey: ["checkout", "multi-seller-pricing", selectedAddressId, selectedCompanyId, deliveryMode, cart?.total, cart?.coupon_code, cart?.promotion_code],
    queryFn: ({ signal }) => checkoutApi.multiSellerPricing({
      address_id: selectedAddressId,
      logistics_company_id: selectedCompanyId,
      delivery_mode: deliveryMode,
    }, signal),
    enabled: Boolean(
      selectedAddress?.delivery_ready &&
      detectedDelivery.data?.delivery_mode === deliveryMode &&
      selectedCompanyId &&
      cartItems.length && deliveryMode === "international"
    ),
    retry: false,
  });

  const selectedShipping = deliveryMode === "local"
    ? xerinExpress.data?.find((option) => option.rate_id === form.shippingMethod)
    : deliveryPricing.data?.options.find((option) => option.rate_id === form.shippingMethod);

  const frozenQuote = useQuery({
    queryKey: ["checkout", "frozen-delivery-quote", selectedAddressId, selectedCompanyId, form.shippingMethod, deliveryMode, cart?.total, cart?.coupon_code, cart?.promotion_code],
    queryFn: () => checkoutApi.freezeDeliveryQuote({
      address_id: selectedAddressId,
      logistics_company_id: selectedCompanyId,
      rate_id: form.shippingMethod,
      delivery_mode: deliveryMode,
    }),
    enabled: Boolean(
      selectedAddress?.delivery_ready &&
      detectedDelivery.data?.delivery_mode === deliveryMode &&
      selectedCompanyId &&
      form.shippingMethod
    ),
    retry: false,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (deliveryMode !== "local") return;
    const options = xerinExpress.data ?? [];
    if (!options.length) { setSelectedCompanyId(""); setForm(c => ({...c, shippingMethod:""})); return; }
    const selected = options.find(o => o.rate_id === form.shippingMethod) || options[0];
    if (selected.rate_id !== form.shippingMethod) setForm(c => ({...c, shippingMethod:selected.rate_id}));
    if (selected.logistics_company_id !== selectedCompanyId) setSelectedCompanyId(selected.logistics_company_id);
  }, [deliveryMode, xerinExpress.data, form.shippingMethod, selectedCompanyId]);

  const paymentOptions = useQuery({
    queryKey: [
      "checkout",
      "payment-options",
      Boolean(selectedShipping?.supports_cod),
    ],
    queryFn: () =>
      checkoutApi.paymentOptions(Boolean(selectedShipping?.supports_cod)),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (deliveryMode === "local") return;
    const companies = eligibleLogistics.data?.results ?? [];
    if (!companies.length) {
      setSelectedCompanyId("");
      setForm((current) => ({ ...current, shippingMethod: "" }));
      return;
    }
    if (!companies.some((company) => company.logistics_company_id === selectedCompanyId)) {
      setSelectedCompanyId(companies[0].logistics_company_id);
      setForm((current) => ({ ...current, shippingMethod: "" }));
    }
  }, [eligibleLogistics.data, selectedCompanyId, deliveryMode]);

  useEffect(() => {
    if (deliveryMode === "local") return;
    const options = deliveryPricing.data?.options ?? [];
    if (!options.length) {
      setForm((current) => current.shippingMethod ? { ...current, shippingMethod: "" } : current);
      return;
    }
    if (!options.some((option) => option.rate_id === form.shippingMethod)) {
      setForm((current) => ({ ...current, shippingMethod: options[0].rate_id }));
    }
  }, [deliveryPricing.data, form.shippingMethod, deliveryMode]);

  useEffect(() => {
    const options = paymentOptions.data ?? [];
    if (
      options.length &&
      !options.some((option) => option.id === form.paymentMethod)
    ) {
      setForm((current) => ({
        ...current,
        paymentMethod: options[0].id,
      }));
    }
  }, [paymentOptions.data, form.paymentMethod]);

  useEffect(() => {
    const selectedOption = paymentOptions.data?.find(
      (option) => option.id === form.paymentMethod,
    );
    if (!selectedOption) return;

    if (
      selectedOption.requires_phone &&
      !selectedOption.providers.includes(paymentProvider)
    ) {
      setPaymentProvider(selectedOption.providers[0] ?? "");
    } else if (!selectedOption.requires_phone) {
      setPaymentProvider(
        selectedOption.id === "cash_on_delivery"
          ? ""
          : selectedOption.providers[0] ?? "azampay",
      );
    }
  }, [form.paymentMethod, paymentOptions.data, paymentProvider]);

  const shippingAmount = frozenQuote.data
    ? Number(frozenQuote.data.delivery_amount)
    : selectedShipping
      ? Number(selectedShipping.delivery_amount)
      : null;

  const checkoutTotal =
    shippingAmount === null ? null : cartProductTotal + shippingAmount;


  const step1Ready = Boolean(
    destinationCountry &&
      selectedAddressId &&
      selectedAddress?.delivery_ready &&
      detectedDelivery.data?.delivery_mode === deliveryMode,
  );

  const step2Ready = Boolean(
    selectedCompanyId &&
      form.shippingMethod &&
      selectedShipping &&
      frozenQuote.data &&
      new Date(frozenQuote.data.expires_at).getTime() > Date.now(),
  );

  const goToStep = (step: CheckoutStep) => {
    if (step > maxReachedStep + 1) {
      toast.error("Complete the current checkout step first.");
      return;
    }
    if (step > 1 && !step1Ready) {
      toast.error("Confirm your delivery address before continuing.");
      setCurrentStep(1);
      return;
    }
    if (step > 2 && !step2Ready) {
      toast.error("Select a logistics service and wait for the protected quote.");
      setCurrentStep(2);
      return;
    }
    setCurrentStep(step);
    setMaxReachedStep((current) =>
      Math.max(current, step) as CheckoutStep,
    );
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const continueFromDelivery = () => {
    if (!destinationCountry) {
      toast.error("Choose the delivery destination country.");
      return;
    }
    if (!selectedAddressId) {
      toast.error("Select a delivery address.");
      return;
    }
    if (!selectedAddress?.delivery_ready) {
      toast.error("Confirm the exact Google delivery point before continuing.");
      return;
    }
    if (!detectedDelivery.data || detectedDelivery.data.delivery_mode !== deliveryMode) {
      toast.error("Wait for Xerin to detect the delivery route.");
      return;
    }
    goToStep(2);
  };

  const continueFromLogistics = () => {
    if (!selectedCompanyId || !selectedShipping) {
      toast.error("Select a logistics company and delivery price option.");
      return;
    }
    if (!frozenQuote.data) {
      toast.error("Wait for the protected delivery quote.");
      return;
    }
    if (new Date(frozenQuote.data.expires_at).getTime() <= Date.now()) {
      toast.error("The delivery quote expired. Recalculate delivery.");
      void frozenQuote.refetch();
      return;
    }
    goToStep(3);
  };

  const updateField = (
    field: keyof CheckoutForm,
    value: string | boolean,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectXerinExpress = (option: import("@/types/api/commerce").XerinExpressOption) => {
    setSelectedCompanyId(option.logistics_company_id);
    setForm((current) => ({ ...current, shippingMethod: option.rate_id }));
  };

  const changeCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setForm((current) => ({
      ...current,
      shippingMethod: "",
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!destinationCountry) {
      toast.error("Choose the delivery destination country first");
      return;
    }

    if (!selectedAddressId) {
      toast.error(
        `Add or select a delivery address in ${destinationCountry}`,
      );
      return;
    }

    if (!selectedShipping) {
      toast.error("Select a logistics company and delivery service");
      return;
    }

    if (!selectedAddress?.delivery_ready) {
      toast.error("Confirm the exact delivery map pin before continuing");
      return;
    }

    if (!frozenQuote.data) {
      toast.error("Wait for the protected delivery quote to finish");
      return;
    }

    if (new Date(frozenQuote.data.expires_at).getTime() <= Date.now()) {
      toast.error("The protected delivery quote has expired. Recalculate delivery before placing the order.");
      void frozenQuote.refetch();
      return;
    }

    let createdOrderId: string | null = null;

    try {
      const selectedPayment = paymentOptions.data?.find(
        (option) => option.id === form.paymentMethod,
      );

      const phoneNumber =
        paymentPhone.trim() || profile?.phone?.trim() || form.phone.trim();

      if (
        selectedPayment?.requires_phone &&
        (!paymentProvider || !phoneNumber)
      ) {
        throw new Error(
          "Select a mobile network and enter the mobile payment number",
        );
      }

      const order = await createOrder.mutateAsync({
        shipping_address_id: selectedAddressId,
        shipping_rate_id: selectedShipping.rate_id,
        delivery_quote_id: frozenQuote.data.id,
        delivery_mode: deliveryMode,
        coupon_code: cart?.coupon_code || undefined,
        promotion_code: cart?.promotion_code || undefined,
        notes: form.notes || undefined,
      });

      const paymentRetryKey = `xerin:payment-retry:${order.id}`;
      const paymentRetryContext = {
        method: form.paymentMethod,
        provider:
          form.paymentMethod === "cash_on_delivery"
            ? undefined
            : paymentProvider || (form.paymentMethod === "card" ? "selcom" : "selcom"),
        phone_number:
          selectedPayment?.requires_phone
            ? phoneNumber
            : undefined,
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          paymentRetryKey,
          JSON.stringify(paymentRetryContext),
        );
      }

      createdOrderId = String(order.id);

      const confirmedTotal = Number(order.total || 0);
      if (
        checkoutTotal !== null &&
        Math.abs(confirmedTotal - checkoutTotal) >= 0.01
      ) {
        toast(
          `Checkout was refreshed by the backend. Confirmed order total: ${formatCurrency(
            confirmedTotal,
            order.currency,
          )}`,
        );
      }

      const successUrl = `${window.location.origin}/order-success/${order.id}?payment=success`;
      const failureUrl = `${window.location.origin}/payment-failed/${order.id}`;

      const isCod = form.paymentMethod === "cash_on_delivery";

      const payment = await paymentsApi.initiate({
        order_id: String(order.id),
        method: form.paymentMethod,
        provider: isCod ? undefined : paymentProvider || (form.paymentMethod === "card" ? "selcom" : "selcom"),
        phone_number: selectedPayment?.requires_phone
          ? phoneNumber
          : undefined,
        success_url:
          form.paymentMethod === "card" ? successUrl : undefined,
        failure_url:
          form.paymentMethod === "card" ? failureUrl : undefined,
      });

      if (isCod) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(paymentRetryKey);
        }
        toast.success(
          "Order placed with Cash on Delivery. Payment will be collected at delivery.",
        );
        router.push(`/order-success/${order.id}?payment=cod`);
        return;
      }

      const checkoutUrl = payment.provider_response?.checkout_url;
      if (form.paymentMethod === "card" && checkoutUrl) {
        window.location.assign(checkoutUrl);
        return;
      }

      toast.success(
        payment.status === "processing"
          ? "Payment request sent. Complete the payment on your phone."
          : "Order placed successfully",
      );
      router.push(
        `/order-success/${order.id}?payment_id=${payment.id}&payment=${payment.status}`,
      );
    } catch (error: unknown) {
      type CheckoutErrorDetail = {
        code?: string;
        message?: string;
        order_id?: string;
        payment_id?: string;
        retryable?: boolean;
        payment_due_at?: string;
        remaining_seconds?: number;
        redirect_to?: string;
        product_id?: string;
        variant_id?: string | null;
        requested_quantity?: number;
        available_quantity?: number;
      };

      // `axiosInstance` response interceptor converts Axios errors into
      // ApiError. ApiError exposes `status` and `data`; it no longer has
      // `response.status` / `response.data`. Keep the Axios fallback as well so
      // this checkout remains resilient if it is ever called without the
      // interceptor.
      const candidate = error as {
        status?: number;
        data?: {
          detail?: string | CheckoutErrorDetail;
          message?: string;
        };
        response?: {
          status?: number;
          data?: {
            detail?: string | CheckoutErrorDetail;
            message?: string;
          };
        };
        message?: string;
      };

      const status =
        candidate.status ??
        candidate.response?.status ??
        0;

      const errorData =
        candidate.data ??
        candidate.response?.data;

      const detail = errorData?.detail;
      const detailMessage =
        typeof detail === "string"
          ? detail
          : detail?.message;

      if (
        status === 409 &&
        typeof detail === "object" &&
        detail?.code?.toUpperCase() === "INSUFFICIENT_STOCK"
      ) {
        const availableQuantity =
          typeof detail.available_quantity === "number"
            ? Math.max(0, detail.available_quantity)
            : null;

        // Revalidate the server cart immediately so the buyer cannot continue
        // from stale availability after losing a last-unit checkout race.
        try {
          const refreshedCart = await cartApi.validate();
          queryClient.setQueryData(["cart"], refreshedCart);
        } catch {
          // If cart validation itself cannot complete, still force the normal
          // cart query to refresh on the review page.
          await queryClient.invalidateQueries({ queryKey: ["cart"] });
        }

        if (detail.product_id) {
          void queryClient.invalidateQueries({
            queryKey: ["product", detail.product_id],
          });
        }
        void queryClient.invalidateQueries({ queryKey: ["products"] });

        const stockNote =
          availableQuantity === null
            ? ""
            : availableQuantity === 0
              ? " The item is now sold out."
              : ` Only ${availableQuantity} item${availableQuantity === 1 ? " is" : "s are"} currently available.`;

        toast.error(
          `${
            detailMessage ||
            "This item just sold out or no longer has enough stock for your order."
          }${stockNote} Your cart has been refreshed.`,
          { duration: 6500 },
        );

        // Return the buyer to the refreshed cart where blocking stock
        // validation messages disable checkout until the cart is corrected.
        router.push("/cart");
        return;
      }

      if (
        status === 409 &&
        typeof detail === "object" &&
        detail?.code === "pending_order_exists" &&
        detail?.order_id
      ) {
        const destination =
          detail.redirect_to ||
          `/order-success/${detail.order_id}`;

        const seconds =
          typeof detail.remaining_seconds === "number"
            ? Math.max(0, Math.ceil(detail.remaining_seconds))
            : null;

        toast(
          seconds !== null
            ? `${
                detailMessage ||
                "You already have an active pending order for these items."
              } Opening it now…`
            : detailMessage ||
                "You already have an active pending order for these items. Opening it now…",
        );

        router.replace(destination);
        return;
      }

      if (createdOrderId) {
        const retryable =
          typeof detail === "object"
            ? detail?.retryable !== false
            : true;

        toast.error(
          detailMessage ||
            "Your order was created, but payment could not be started.",
        );

        const failedPaymentId =
          typeof detail === "object" ? detail?.payment_id : undefined;
        const paymentIdQuery = failedPaymentId
          ? `&payment_id=${encodeURIComponent(failedPaymentId)}`
          : "";

        router.push(
          `/order-success/${createdOrderId}?payment=failed&retryable=${
            retryable ? "1" : "0"
          }${paymentIdQuery}`,
        );
        return;
      }

      toast.error(
        detailMessage ||
          candidate.message ||
          "Checkout failed",
      );
    }
  };

  if (hasHydrated && !isAuthenticated) {
    router.replace("/signin?redirect=/checkout");
    return null;
  }

  if (isLoadingCart || isLoadingAddresses || deliveryConfig.isLoading) {
    return (
      <section className="py-20 text-center">
        Loading secure checkout…
      </section>
    );
  }

  if (cartError) {
    return (
      <section className="py-20 text-center text-red">
        Checkout could not load your cart. Please retry.
      </section>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Breadcrumb title="Checkout" pages={["checkout"]} />
        <section className="bg-gray-2 py-20 text-center dark:bg-darkTheme-bg">
          <p className="mb-4 text-dark dark:text-white">
            Your cart is empty.
          </p>
          <a href="/search" className="font-medium text-blue">
            Continue Shopping
          </a>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Checkout" pages={["checkout"]} />

      <section className="overflow-hidden bg-gray-2 pb-8 pt-5 dark:bg-darkTheme-bg sm:py-12 lg:py-16">
        <div className="mx-auto w-full max-w-[1220px] px-3 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            <CheckoutStepper
              currentStep={currentStep}
              onStepClick={goToStep}
              step1Ready={step1Ready}
              step2Ready={step2Ready}
              maxReachedStep={maxReachedStep}
            />

            <div className="mt-5 sm:mt-7">
              <div className="min-w-0">
                {currentStep === 1 && (
                  <div className="space-y-4 sm:space-y-6">
                    <StepHeading
                      step="1"
                      title="Delivery"
                      description="Confirm where the order should go. Xerin automatically detects whether the route is domestic or cross-border."
                    />

                    <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
                      <div className="space-y-5">
                        <DeliveryModeSelector
                          value={deliveryMode}
                          config={deliveryConfig.data}
                          detected={detectedDelivery.data}
                          loading={detectedDelivery.isLoading || detectedDelivery.isFetching}
                        />

                        <section className="rounded-2xl border border-[#e7ebf0] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-darkTheme-card sm:p-6">
                          <div className="flex items-start gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                              <MapPin size={18} />
                            </span>
                            <div>
                              <h2 className="font-bold text-dark dark:text-white">Delivery Address</h2>
                              <p className="mt-1 text-xs leading-5 text-dark-4">
                                {destinationCountry
                                  ? `Delivery destination: ${destinationCountry}.`
                                  : "Choose the delivery destination country first."}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 sm:mt-5">
                            <label htmlFor="delivery-destination-country" className="mb-2 block text-xs font-bold uppercase tracking-wide text-dark-4">
                              Delivery destination country
                            </label>
                            <select
                              id="delivery-destination-country"
                              value={destinationCountry}
                              onChange={(event) => {
                                setDestinationCountry(event.target.value);
                                setSelectedAddressId("");
                                setSelectedCompanyId("");
                                setForm((current) => ({ ...current, shippingMethod: "" }));
                              }}
                              className="h-12 w-full rounded-xl border border-gray-3 bg-white px-3 text-base outline-none focus:border-orange dark:border-white/10 dark:bg-white/5 dark:text-white sm:px-4 sm:text-sm"
                            >
                              <option value="">Choose destination country</option>
                              {internationalCountryOptions.map((country) => (
                                <option key={country} value={country}>
                                  {countryFlag(country)} {country}
                                </option>
                              ))}
                            </select>
                          </div>

                          {matchingAddresses.length ? (
                            <>
                              <select
                                value={selectedAddressId}
                                onChange={(event) => setSelectedAddressId(event.target.value)}
                                className="mt-4 h-12 w-full rounded-xl border border-gray-3 bg-white px-3 text-base outline-none focus:border-orange dark:border-white/10 dark:bg-white/5 dark:text-white sm:mt-5 sm:px-4 sm:text-sm"
                              >
                                {matchingAddresses.map((address) => (
                                  <option key={String(address.id)} value={String(address.id)}>
                                    {address.label ? `${address.label} · ` : ""}
                                    {address.street}, {address.city}, {address.region}, {address.country}
                                  </option>
                                ))}
                              </select>

                              {selectedAddress && (
                                <>
                                  <div className="mt-3 break-words rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-white/5 dark:text-white/60">
                                    {selectedAddress.recipient_name && <b>{selectedAddress.recipient_name} · </b>}
                                    {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.region}, {selectedAddress.country}
                                    {selectedAddress.recipient_phone ? ` · ${selectedAddress.recipient_phone}` : ""}
                                  </div>
                                  <MapPinConfirmation
                                    address={selectedAddress}
                                    onConfirmed={() => { void refetchAddresses(); }}
                                  />
                                </>
                              )}
                            </>
                          ) : (
                            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                              You do not have a {destinationCountry || "selected country"} delivery address yet.
                            </div>
                          )}

                          <a href="/account/addresses?returnTo=%2Fcheckout" className="mt-4 inline-block text-sm font-semibold text-orange">
                            Manage delivery addresses
                          </a>
                        </section>
                      </div>

                      <div className="space-y-5">
                        <Billing
                          profile={profile}
                          selectedAddress={selectedAddress}
                          isLoading={isLoadingProfile}
                        />

                        <section className="rounded-2xl border border-[#e7ebf0] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-darkTheme-card sm:p-6">
                          <label htmlFor="notes" className="mb-2.5 block font-semibold dark:text-darkTheme-body-color">
                            Delivery / Order Notes <span className="font-normal text-dark-4">(optional)</span>
                          </label>
                          <textarea
                            id="notes"
                            rows={5}
                            value={form.notes}
                            onChange={(event) => updateField("notes", event.target.value)}
                            placeholder="Building access, delivery instructions, package notes..."
                            className="w-full rounded-xl border border-gray-3 bg-gray-1 p-3 text-base outline-none focus:border-orange dark:border-white/10 dark:bg-white/5 dark:text-white sm:p-4 sm:text-sm"
                          />
                        </section>

                        <section className="rounded-2xl border border-orange/20 bg-orange/5 p-4 text-xs leading-5 text-dark-4 sm:p-5">
                          <b className="text-dark dark:text-white">Ready for logistics?</b>
                          <p className="mt-1">Verify the detected delivery type, address and customer details, then continue.</p>
                        </section>
                      </div>
                    </div>

                    <StepActions
                      nextLabel="Continue to Logistics"
                      onNext={continueFromDelivery}
                      nextDisabled={!step1Ready}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4 sm:space-y-6">
                    <StepHeading
                      step="2"
                      title={deliveryMode === "local" ? "Choose Xerin Express" : "Choose Logistics"}
                      description={deliveryMode === "local" ? "Choose Standard or Express. Xerin automatically assigns the best qualified domestic delivery partner." : "Choose a company and service that covers every store-to-customer route in this order."}
                    />

                    {(xerinExpress.error || eligibleLogistics.error || deliveryPricing.error || frozenQuote.error) && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
                        {errorText(xerinExpress.error || eligibleLogistics.error || deliveryPricing.error || frozenQuote.error)}
                      </div>
                    )}

                    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)] lg:gap-6">
                      {deliveryMode === "local" ? (
                        <XerinExpress options={xerinExpress.data ?? []} selected={form.shippingMethod} onSelect={selectXerinExpress} loading={xerinExpress.isLoading || xerinExpress.isFetching} />
                      ) : (
                      <ShippingMethod
                        companies={eligibleLogistics.data?.results ?? []}
                        excludedCompanies={eligibleLogistics.data?.excluded_companies ?? []}
                        options={deliveryPricing.data?.options ?? []}
                        selected={form.shippingMethod}
                        onChange={(value) => updateField("shippingMethod", value)}
                        selectedCompanyId={selectedCompanyId}
                        onCompanyChange={changeCompany}
                        deliveryMode={deliveryMode}
                        destinationCountry={destinationCountry}
                        destinationRegion={selectedAddress?.region || ""}
                        destinationCity={selectedAddress?.city || selectedAddress?.district || ""}
                        hasSelectedAddress={Boolean(selectedAddressId)}
                        addressReady={Boolean(selectedAddress?.delivery_ready)}
                        isLoadingCompanies={eligibleLogistics.isLoading || eligibleLogistics.isFetching}
                        isLoadingPricing={deliveryPricing.isLoading || deliveryPricing.isFetching}
                      />
                      )}

                      <section className="rounded-2xl border border-[#e7ebf0] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-darkTheme-card sm:p-5">
                        <h3 className="font-bold text-dark dark:text-white">Delivery quote</h3>
                        {!frozenQuote.data || !selectedShipping ? (
                          <p className="mt-3 text-sm leading-6 text-dark-4">
                            Select a delivery option to generate the protected quote.
                          </p>
                        ) : (
                          <>
                            <div className="mt-4 space-y-2">
                              {frozenQuote.data.seller_routes_snapshot.map((route, index) => (
                                <div key={`${route.store_id || route.pickup_location_id || index}`} className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-white/5">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <b className="text-dark dark:text-white">{route.store_name || route.pickup_label || `Store ${index + 1}`}</b>
                                    <span className="font-bold uppercase text-emerald-700 dark:text-emerald-300">
                                      {route.route_type === "cross_border" ? "Cross-border" : "Domestic"}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-dark-4">
                                    {route.origin_country || "Store origin"} → {frozenQuote.data.address_snapshot?.country || destinationCountry || "Destination"} · {Number(route.distance_km || 0).toFixed(1)} km
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 border-t border-gray-3 pt-3 dark:border-white/10">
                              <SummaryRow label="Billable distance" value={`${Number(frozenQuote.data.billable_distance_km).toFixed(1)} km`} />
                              <SummaryRow label="Delivery" value={<PriceDisplay amount={Number(frozenQuote.data.delivery_amount)} sourceCurrency="TZS" />} strong />
                              <p className="mt-1 text-right text-[10px] text-emerald-700">
                                Quote locked until {new Date(frozenQuote.data.expires_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </>
                        )}
                      </section>
                    </div>

                    <StepActions
                      onBack={() => goToStep(1)}
                      nextLabel="Continue to Review"
                      onNext={continueFromLogistics}
                      nextDisabled={!step2Ready}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4 sm:space-y-6">
                    <StepHeading
                      step="3"
                      title="Review Order"
                      description="Review products, delivery charge and any coupon before choosing payment."
                    />

                    <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
                      <div className="space-y-5">
                        <Coupon />

                        {selectedAddress && (
                          <section className="rounded-2xl border border-[#e7ebf0] bg-white p-4 text-sm shadow-sm dark:border-white/10 dark:bg-darkTheme-card sm:p-6">
                            <h3 className="font-bold text-dark dark:text-white">Delivery summary</h3>
                            <p className="mt-3 text-dark-4">
                              <b className="text-dark dark:text-white">{selectedAddress.recipient_name || profile?.full_name || "Customer"}</b><br />
                              {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.region}, {selectedAddress.country}
                            </p>
                            {selectedShipping && (
                              <p className="mt-3 text-dark-4">
                                {deliveryMode === "local" ? <>Delivery: <b className="text-dark dark:text-white">Xerin Express — {("tier" in selectedShipping ? selectedShipping.label : "Domestic")}</b><br />Partner assigned automatically</> : <>Logistics: <b className="text-dark dark:text-white">{eligibleLogistics.data?.results.find((company) => company.logistics_company_id === selectedCompanyId)?.name || "Selected provider"}</b><br />Service: {"method_name" in selectedShipping ? selectedShipping.method_name : "International"} · Cross-border</>}
                              </p>
                            )}
                          </section>
                        )}
                      </div>

                      <section className="rounded-2xl border border-[#e7ebf0] bg-white shadow-sm dark:border-white/10 dark:bg-darkTheme-card">
                        <div className="border-b border-gray-3 px-4 py-4 dark:border-white/10 sm:px-6">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-bold text-dark dark:text-white">Order review</h3>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                              {cartItems.length} item{cartItems.length === 1 ? "" : "s"}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 sm:p-6">
                          {cartItems.map((item) => (
                            <div key={item.cartItemId} className="flex items-start justify-between gap-3 border-b border-gray-3 py-3 dark:border-white/10">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-dark dark:text-white">{item.title}</p>
                                <p className="mt-1 text-xs text-dark-4">Qty {item.quantity}</p>
                              </div>
                              <p className="shrink-0 text-sm font-bold">
                                {formatCurrency(item.discountedPrice * item.quantity, cart?.currency)}
                              </p>
                            </div>
                          ))}
                          <SummaryRow label="Product subtotal" value={<PriceDisplay amount={Number(cart?.subtotal || 0)} sourceCurrency="TZS" showSettlementTzs />} />
                          {Number(cart?.promotion_discount_amount || 0) > 0 && (
                            <SummaryRow label="Seller promotion" value={<><span>-</span><PriceDisplay amount={Number(cart?.promotion_discount_amount || 0)} sourceCurrency="TZS" /></>} saving />
                          )}
                          {Number(cart?.coupon_discount_amount || 0) > 0 && (
                            <SummaryRow label="Platform coupon" value={<><span>-</span><PriceDisplay amount={Number(cart?.coupon_discount_amount || 0)} sourceCurrency="TZS" /></>} saving />
                          )}
                          <SummaryRow label="Delivery" value={shippingAmount === null ? "Pending quote" : <PriceDisplay amount={shippingAmount} sourceCurrency="TZS" />} />
                          <div className="mt-2 border-t border-gray-3 pt-2 dark:border-white/10">
                            <SummaryRow label="Grand Total" value={checkoutTotal === null ? "Pending delivery quote" : <PriceDisplay amount={checkoutTotal} sourceCurrency="TZS" showSettlementTzs />} strong />
                          </div>
                        </div>
                      </section>
                    </div>

                    <StepActions
                      onBack={() => goToStep(2)}
                      nextLabel="Continue to Payment"
                      onNext={() => goToStep(4)}
                      nextDisabled={!step2Ready}
                    />
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4 sm:space-y-6">
                    <StepHeading
                      step="4"
                      title="Payment"
                      description="Choose Mobile Payment or Card Payment for the backend-confirmed TZS total."
                    />

                    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)] lg:gap-6">
                      <PaymentMethod
                        options={paymentOptions.data ?? []}
                        selected={form.paymentMethod}
                        onChange={(value) => updateField("paymentMethod", value)}
                        isLoading={paymentOptions.isLoading}
                        provider={paymentProvider}
                        phoneNumber={paymentPhone}
                        onProviderChange={setPaymentProvider}
                        onPhoneNumberChange={setPaymentPhone}
                      />

                      <section className="rounded-2xl border border-[#e7ebf0] bg-white p-4 shadow-sm dark:border-white/10 dark:bg-darkTheme-card sm:p-6">
                        <h3 className="font-bold text-dark dark:text-white">Final total</h3>
                        <div className="mt-3">
                          <SummaryRow label="Product subtotal" value={<PriceDisplay amount={Number(cart?.subtotal || 0)} sourceCurrency="TZS" showSettlementTzs />} />
                          {Number(cart?.coupon_discount_amount || 0) > 0 && (
                            <SummaryRow label="Coupon" value={<><span>-</span><PriceDisplay amount={Number(cart?.coupon_discount_amount || 0)} sourceCurrency="TZS" /></>} saving />
                          )}
                          <SummaryRow label="Delivery" value={shippingAmount === null ? "Pending" : <PriceDisplay amount={shippingAmount} sourceCurrency="TZS" />} />
                          <div className="mt-2 border-t border-gray-3 pt-2 dark:border-white/10">
                            <SummaryRow label="Grand Total" value={checkoutTotal === null ? "Pending quote" : <PriceDisplay amount={checkoutTotal} sourceCurrency="TZS" showSettlementTzs />} strong />
                          </div>
                        </div>
                        {selectedAddress && (
                          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-dark-4 dark:bg-white/5">
                            <b className="text-dark dark:text-white">Deliver to</b><br />
                            {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.country}
                          </div>
                        )}
                        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-[11px] leading-5 text-blue-800 sm:text-xs">
                          <b>Final checkout protection:</b> Xerin rechecks prices, stock, address, logistics and the protected shipping rate before creating the order.
                        </div>
                      </section>
                    </div>

                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => goToStep(3)}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-3 bg-white px-5 font-semibold text-dark hover:border-orange dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <ChevronLeft size={17} /> Back to Review
                      </button>
                      <button
                        type="submit"
                        disabled={
                          createOrder.isPending ||
                          isCreatingAddress ||
                          eligibleLogistics.isFetching ||
                          deliveryPricing.isFetching ||
                          frozenQuote.isFetching ||
                          !selectedAddressId ||
                          !selectedAddress?.delivery_ready ||
                          !form.paymentMethod ||
                          !form.shippingMethod ||
                          !frozenQuote.data
                        }
                        className="inline-flex h-12 items-center justify-center rounded-xl bg-orange px-6 text-base font-semibold text-white shadow-sm transition hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                      >
                        {createOrder.isPending || isCreatingAddress ? "Processing..." : "Pay Securely"}
                      </button>
                    </div>

                    <p className="text-center text-[11px] leading-5 text-dark-4">
                      Display currency is for convenience only. Payment is settled in TZS using the backend-confirmed Grand Total.
                    </p>
                  </div>
                )}

                              </div>


            </div>
          </form>
        </div>
      </section>
    </>
  );
};

function CheckoutStepper({
  currentStep,
  onStepClick,
  step1Ready,
  step2Ready,
  maxReachedStep,
}: {
  currentStep: CheckoutStep;
  onStepClick: (step: CheckoutStep) => void;
  step1Ready: boolean;
  step2Ready: boolean;
  maxReachedStep: CheckoutStep;
}) {
  const completed = (step: CheckoutStep) =>
    step === 1 ? step1Ready && currentStep > 1 :
    step === 2 ? step2Ready && currentStep > 2 :
    currentStep > step;

  const unlocked = (step: CheckoutStep) => {
    if (step === 1) return true;
    if (step > maxReachedStep + 1) return false;
    if (step === 2) return step1Ready;
    return step1Ready && step2Ready;
  };

  return (
    <nav aria-label="Checkout progress" className="rounded-2xl border border-[#e7ebf0] bg-white p-3 shadow-sm dark:border-white/10 dark:bg-darkTheme-card sm:p-4">
      <ol className="grid grid-cols-4 gap-1 sm:gap-3">
        {CHECKOUT_STEPS.map((step, index) => {
          const active = currentStep === step.id;
          const done = completed(step.id);
          const enabled = unlocked(step.id);
          return (
            <li key={step.id} className="relative min-w-0">
              <button
                type="button"
                disabled={!enabled}
                onClick={() => onStepClick(step.id)}
                className={`group flex w-full flex-col items-center gap-2 rounded-xl px-1 py-2 text-center transition sm:flex-row sm:px-3 sm:text-left ${
                  active
                    ? "bg-orange/10 text-orange"
                    : done
                      ? "text-emerald-700"
                      : enabled
                        ? "text-slate-600 hover:bg-slate-50"
                        : "cursor-not-allowed text-slate-300"
                }`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? "bg-orange text-white"
                    : done
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500"
                }`}>
                  {done ? <Check size={15} /> : step.id}
                </span>
                <span className="min-w-0">
                  <span className="hidden text-[10px] font-bold uppercase tracking-wide text-slate-400 sm:block">
                    Step {step.id}
                  </span>
                  <span className="block truncate text-[11px] font-bold sm:text-sm">
                    {step.shortLabel}
                  </span>
                </span>
              </button>
              {index < CHECKOUT_STEPS.length - 1 && (
                <span className="absolute -right-1 top-6 hidden h-px w-2 bg-slate-200 sm:block" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StepHeading({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 sm:mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange">
        Step {step} of 4
      </p>
      <h1 className="mt-1 text-xl font-bold text-dark dark:text-white sm:text-2xl">
        {title}
      </h1>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-dark-4">
        {description}
      </p>
    </div>
  );
}

function StepActions({
  onBack,
  onNext,
  nextLabel,
  nextDisabled = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-3 bg-white px-5 font-semibold text-dark hover:border-orange dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <ChevronLeft size={17} /> Back
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-orange px-6 font-semibold text-white hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {nextLabel} <ChevronRight size={17} />
      </button>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  saving = false,
  strong = false,
}: {
  label: string;
  value: React.ReactNode;
  saving?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 sm:gap-4 sm:py-3">
      <span
        className={
          strong
            ? "font-bold text-dark dark:text-white"
            : "text-sm text-dark-4"
        }
      >
        {label}
      </span>
      <span
        className={`text-right ${
          strong
            ? "text-base font-bold text-dark dark:text-white sm:text-lg"
            : saving
              ? "text-sm font-bold text-emerald-700"
              : "text-sm font-semibold"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : "Delivery quotation could not be completed. Check the address pin and try again.";
}

export default Checkout;
