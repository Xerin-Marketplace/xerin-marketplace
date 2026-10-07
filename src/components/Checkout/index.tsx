"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
import axiosInstance from "@/lib/api/client";
import type { DeliveryMode } from "@/types/api/commerce";
import { formatCurrency } from "@/lib/formatCurrency";
import PriceDisplay from "@/components/shared/PriceDisplay";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { requestAuthPrompt } from "@/components/Auth/AuthPrompt";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckIcon, ArrowLeft01Icon, ArrowRight01Icon, Globe02Icon, Location01Icon, DeliveryTruck01Icon, ClipboardCheckIcon, CreditCardIcon, ClipboardListIcon, LockPasswordIcon } from "@hugeicons/core-free-icons";
import InfoPopover from "@/components/Common/Info/InfoPopover";
import AddressModal from "@/components/MyAccount/AddressModal";

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

const CHECKOUT_STEPS: Array<{ id: CheckoutStep; label: string; shortLabel: string; icon: typeof Location01Icon }> = [
 { id: 1, label: "Delivery", shortLabel: "Delivery", icon: Location01Icon },
 { id: 2, label: "Logistics", shortLabel: "Logistics", icon: DeliveryTruck01Icon },
 { id: 3, label: "Review", shortLabel: "Review", icon: ClipboardCheckIcon },
 { id: 4, label: "Payment", shortLabel: "Payment", icon: CreditCardIcon },
];

const Checkout = () => {
 const router = useRouter();
 const queryClient = useQueryClient();
 const [form, setForm] = useState<CheckoutForm>(initialForm);
 const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("local");
 const [destinationCountry, setDestinationCountry] = useState("");
 const [selectedAddressId, setSelectedAddressId] = useState("");
 const [addressDrawerOpen, setAddressDrawerOpen] = useState(false);
 const [selectedCompanyId, setSelectedCompanyId] = useState("");
 const [paymentProvider, setPaymentProvider] = useState("");
 const [paymentPhone, setPaymentPhone] = useState("");
 const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
 const [maxReachedStep, setMaxReachedStep] = useState<CheckoutStep>(1);

 const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
 const hasHydrated = useAuthStore((state) => state.hasHydrated);

 // Offer contextual sign-in (Google / email) without losing checkout state.
 // The drawer mounts once per guest visit; "Continue with email" returns to
 // /checkout through the validated redirect param.
 useEffect(() => {
 if (hasHydrated && !isAuthenticated) {
 requestAuthPrompt({ action: "checkout" });
 }
 }, [hasHydrated, isAuthenticated]);

 const {
 data: cart,
 isLoading: isLoadingCart,
 error: cartError,
 } = useBackendCart(isAuthenticated);

 const {
 addresses,
 createAddress,
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

 const deliveryErrorText = errorText(detectedDelivery.error);
 const storeConfigMissing = Boolean(
 detectedDelivery.isError && /country|store|origin/i.test(deliveryErrorText),
 );
 const cartStoreIds = useMemo<string[]>(
 () =>
 Array.from(
 new Set(
 (cart?.items ?? [])
 .map((item) => item.product?.store_id)
 .filter((id): id is string | number => Boolean(id))
 .map(String),
 ),
 ),
 [cart],
 );
 // When the backend reports a missing store country, resolve which stores
 // in the cart are actually unconfigured so the buyer sees the exact item.
 const missingCountryStores = useQuery({
 queryKey: ["checkout", "missing-store-country", cartStoreIds],
 enabled: Boolean(storeConfigMissing && cartStoreIds.length),
 queryFn: async () => {
 const stores = await Promise.all(
 cartStoreIds.map((id) =>
 axiosInstance
 .get<{ store_name?: string; country?: string | null }>(
 `/stores/${encodeURIComponent(id)}`,
 )
 .then((res) => res.data)
 .catch(() => null),
 ),
 );
 return stores.filter((s): s is { store_name?: string } => Boolean(s && !s.country));
 },
 retry: false,
 staleTime: 60_000,
 });

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

 const retryLogistics = () => {
 if (xerinExpress.error) void xerinExpress.refetch();
 if (eligibleLogistics.error) void eligibleLogistics.refetch();
 if (deliveryPricing.error) void deliveryPricing.refetch();
 if (frozenQuote.error) void frozenQuote.refetch();
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
 return (
 <section className="grid place-items-center px-4 py-20 sm:py-28">
 <div className="w-full max-w-md rounded-3xl/60 bg-card p-8 text-center  sm:p-10">
 <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
 <HugeiconsIcon icon={LockPasswordIcon} size={26} />
 </span>
 <h2 className="mt-5 text-xl font-bold text-foreground">Sign in to check out</h2>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">Your cart is saved — sign in to finish your order securely.</p>
 <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
 <Link href="/signin?redirect=/checkout" className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:opacity-90 sm:w-auto">
 Sign in
 </Link>
 <Link href="/signup?redirect=/checkout" className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-muted px-6 text-sm font-bold transition hover:bg-muted/70 hover:text-primary sm:w-auto">
 Create account
 </Link>
 </div>
 </div>
 </section>
 );
 }

 if (isLoadingCart || isLoadingAddresses || deliveryConfig.isLoading) {
 return (
 <section className="grid place-items-center px-4 py-24 sm:py-32">
 <div className="flex flex-col items-center gap-4 text-center">
 <span className="h-10 w-10 animate-spin rounded-full border-[3px] border-border border-t-primary" />
 <p className="text-sm font-semibold text-muted-foreground">Preparing secure checkout…</p>
 </div>
 </section>
 );
 }

 if (cartError) {
 return (
 <section className="grid place-items-center px-4 py-20 sm:py-28">
 <div className="w-full max-w-md rounded-3xl bg-red-light-6 p-8 text-center sm:p-10">
 <h2 className="text-lg font-bold text-red-dark">Checkout could not load</h2>
 <p className="mt-2 text-sm leading-6 text-red-dark/80">Something went wrong while loading your cart. Please retry.</p>
 <button type="button" onClick={() => window.location.reload()} className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-destructive px-6 text-sm font-bold text-white">
 Retry
 </button>
 </div>
 </section>
 );
 }

 if (cartItems.length === 0) {
 return (
 <>
 <Breadcrumb title="Checkout" pages={["checkout"]} />
 <section className="grid place-items-center px-4 py-20 sm:py-28">
 <div className="w-full max-w-md rounded-3xl/60 bg-card p-8 text-center  sm:p-10">
 <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
 <HugeiconsIcon icon={ClipboardListIcon} size={26} />
 </span>
 <h2 className="mt-5 text-xl font-bold text-foreground">Your cart is empty</h2>
 <p className="mt-2 text-sm leading-6 text-muted-foreground">Add products to your cart, then come back to check out.</p>
 <a href="/search" className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-white transition hover:opacity-90">
 Continue shopping
 </a>
 </div>
 </section>
 </>
 );
 }

 return (
 <>
 <Breadcrumb title="Checkout" pages={["checkout"]} />

 <section className="overflow-hidden bg-muted pb-10 pt-6 sm:py-12 lg:py-16">
 <div className="mx-auto w-full max-w-[1220px] px-3 sm:px-6 lg:px-8">
 <form onSubmit={handleSubmit}>
 <CheckoutStepper
 currentStep={currentStep}
 onStepClick={goToStep}
 step1Ready={step1Ready}
 step2Ready={step2Ready}
 maxReachedStep={maxReachedStep}
 />

 <div className="mt-5 grid items-start gap-6 sm:mt-7 lg:grid-cols-[minmax(0,1fr)_370px]">
 <div className="min-w-0">
 {currentStep === 1 && (
 <div className="space-y-4 sm:space-y-6">
 <StepHeading
 step="1"
 icon={Location01Icon}
 title="Delivery"
 description="Confirm where the order should go. Xerin automatically detects whether the route is domestic or cross-border."
 />

 <div className="space-y-5">
 <div className="space-y-5">
 <DeliveryModeSelector
 value={deliveryMode}
 config={deliveryConfig.data}
 detected={detectedDelivery.data}
 loading={detectedDelivery.isLoading || detectedDelivery.isFetching}
 awaitingAddress={!selectedAddressId || !selectedAddress?.delivery_ready}
 />

 {detectedDelivery.error && (
 <div className="rounded-xl bg-red-light-6 p-4">
 <div className="flex flex-wrap items-center justify-between gap-3 text-xs leading-5 text-red-dark">
 <span className="min-w-0 flex-1">{errorText(detectedDelivery.error)}</span>
 <button
 type="button"
 onClick={() => void detectedDelivery.refetch()}
 className="rounded-lg bg-destructive px-3 py-1.5 font-semibold text-white hover:bg-red-dark"
 >
 Retry
 </button>
 </div>
 {storeConfigMissing && (
 <div className="mt-3 pt-3 text-xs leading-5 text-red-dark">
 <p>
 One or more stores in your cart have not configured their store
 country, so a delivery route cannot be calculated for them.
 </p>
 {missingCountryStores.data?.length ? (
 <p className="mt-2 font-semibold">
 Affected store{missingCountryStores.data.length === 1 ? "" : "s"}:{" "}
 {missingCountryStores.data
 .map((s, i) => s.store_name || `Store ${i + 1}`)
 .join(", ")}
 </p>
 ) : null}
 <Link
 href="/cart"
 className="mt-2 inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:text-foreground"
 >
 Review cart and remove the affected item
 </Link>
 </div>
 )}
 </div>
 )}

 <section className="rounded-2xl/60 bg-card p-4 sm:p-6">
 <div className="flex items-start gap-3">
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
 <HugeiconsIcon icon={Location01Icon} size={18} />
 </span>
 <div>
 <h2 className="font-bold text-foreground">Delivery Address</h2>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">
 {destinationCountry
 ? `Delivery destination: ${destinationCountry}.`
 : "Choose the delivery destination country first."}
 </p>
 </div>
 </div>

 <div className="mt-4 sm:mt-5">
 <label htmlFor="delivery-destination-country" className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
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
 className="h-12 w-full rounded-xl bg-muted px-3 text-base outline-none focus:ring-2 focus:ring-primary/25 sm:px-4 sm:text-sm"
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
 className="mt-4 h-12 w-full rounded-xl bg-muted px-3 text-base outline-none focus:ring-2 focus:ring-primary/25 sm:mt-5 sm:px-4 sm:text-sm"
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
 <div className="mt-3 break-words rounded-lg bg-muted/70 p-3 text-xs leading-5 text-muted-foreground">
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
 <div className="mt-5 rounded-xl bg-yellow-light-4 p-4 text-sm leading-6 text-yellow-dark-2">
 You do not have a {destinationCountry || "selected country"} delivery address yet.
 </div>
 )}

 <div className="mt-4 flex flex-wrap items-center gap-3">
 <button
 type="button"
 onClick={() => setAddressDrawerOpen(true)}
 className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:opacity-90"
 >
 <HugeiconsIcon icon={Location01Icon} size={17} />
 Add new address
 </button>
 <a href="/account/addresses?returnTo=%2Fcheckout" className="text-sm font-semibold text-primary hover:underline">
 Manage addresses
 </a>
 </div>
 </section>
 </div>

 <div className="space-y-5">
 <Billing
 profile={profile}
 selectedAddress={selectedAddress}
 isLoading={isLoadingProfile}
 />

 <section className="rounded-xl bg-primary/5 p-4 text-xs leading-5 text-muted-foreground sm:p-5">
 <b className="text-foreground">Ready for logistics?</b>
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
 icon={DeliveryTruck01Icon}
 title={deliveryMode === "local" ? "Choose Xerin Express" : "Choose Logistics"}
 description={deliveryMode === "local" ? "Choose Standard or Express. Xerin automatically assigns the best qualified domestic delivery partner." : "Choose a company and service that covers every store-to-customer route in this order."}
 />

 {(xerinExpress.error || eligibleLogistics.error || deliveryPricing.error || frozenQuote.error) && (
 <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-red-light-6 p-3 text-xs leading-5 text-red-dark">
 <span>{errorText(xerinExpress.error || eligibleLogistics.error || deliveryPricing.error || frozenQuote.error)}</span>
 <button
 type="button"
 onClick={retryLogistics}
 className="rounded-lg bg-destructive px-3 py-1.5 font-semibold text-white hover:bg-red-dark"
 >
 Retry
 </button>
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

 <section className="rounded-2xl/60 bg-card p-4 sm:p-5">
 <h3 className="font-bold text-foreground">Delivery quote</h3>
 {!frozenQuote.data || !selectedShipping ? (
 <p className="mt-3 text-sm leading-6 text-muted-foreground">
 Select a delivery option to generate the protected quote.
 </p>
 ) : (
 <>
 <div className="mt-4 space-y-2">
 {frozenQuote.data.seller_routes_snapshot.map((route, index) => (
 <div key={`${route.store_id || route.pickup_location_id || index}`} className="rounded-lg bg-muted/70 p-3 text-xs">
 <div className="flex flex-wrap items-center justify-between gap-2">
 <b className="text-foreground">{route.store_name || route.pickup_label || `Store ${index + 1}`}</b>
 <span className="font-bold uppercase text-green-dark dark:text-emerald-300">
 {route.route_type === "cross_border" ? "Cross-border" : "Domestic"}
 </span>
 </div>
 <p className="mt-1 text-muted-foreground">
 {route.origin_country || "Store origin"} → {frozenQuote.data.address_snapshot?.country || destinationCountry || "Destination"} · {Number(route.distance_km || 0).toFixed(1)} km
 </p>
 </div>
 ))}
 </div>
 <div className="mt-4  pt-3">
 <SummaryRow label="Billable distance" value={`${Number(frozenQuote.data.billable_distance_km).toFixed(1)} km`} />
 <SummaryRow label="Delivery" value={<PriceDisplay amount={Number(frozenQuote.data.delivery_amount)} sourceCurrency="TZS" />} strong />
 <p className="mt-1 text-right text-[10px] text-green-dark">
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
 icon={ClipboardCheckIcon}
 title="Review Order"
 description="Review products, delivery charge and any coupon before choosing payment."
 />

 <div className="space-y-5">
 <section className="rounded-2xl bg-card">
 <div className=" px-4 py-4 sm:px-6">
 <div className="flex items-center justify-between gap-3">
 <h3 className="font-bold text-foreground">Order review</h3>
 <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
 {cartItems.length} item{cartItems.length === 1 ? "" : "s"}
 </span>
 </div>
 </div>
 <div className="p-4 sm:p-6">
 {cartItems.map((item) => {
 const thumb = item.imgs?.thumbnails?.[0];
 return (
 <div key={item.cartItemId} className="flex items-center gap-3  py-3 ">
 <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl/60 bg-muted">
 {thumb ? (
 <img src={thumb} alt="" className="h-full w-full object-cover" />
 ) : (
 <HugeiconsIcon icon={ClipboardListIcon} size={18} className="text-muted-foreground" />
 )}
 </span>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
 <p className="mt-0.5 text-xs text-muted-foreground">Qty {item.quantity}</p>
 </div>
 <p className="shrink-0 text-sm font-bold text-foreground">
 {formatCurrency(item.discountedPrice * item.quantity, cart?.currency)}
 </p>
 </div>
 );
 })}
 <SummaryRow label="Product subtotal" value={<PriceDisplay amount={Number(cart?.subtotal || 0)} sourceCurrency="TZS" showSettlementTzs />} />
 {Number(cart?.promotion_discount_amount || 0) > 0 && (
 <SummaryRow label="Seller promotion" value={<><span>-</span><PriceDisplay amount={Number(cart?.promotion_discount_amount || 0)} sourceCurrency="TZS" /></>} saving />
 )}
 {Number(cart?.coupon_discount_amount || 0) > 0 && (
 <SummaryRow label="Platform coupon" value={<><span>-</span><PriceDisplay amount={Number(cart?.coupon_discount_amount || 0)} sourceCurrency="TZS" /></>} saving />
 )}
 <SummaryRow label="Delivery" info={<InfoPopover title="How delivery is priced" align="end"><p>The delivery fee is calculated from the real distance between the seller&apos;s location and your delivery address, using the selected logistics option.</p><p>The quote is locked for a short window so the price cannot change while you pay.</p></InfoPopover>} value={shippingAmount === null ? "Pending quote" : <PriceDisplay amount={shippingAmount} sourceCurrency="TZS" />} />
 <div className="mt-2  pt-2">
 <SummaryRow label="Grand Total" info={<InfoPopover title="How the total is calculated" align="end"><p>Grand Total = product subtotal − discounts + delivery fee.</p><p>Payment is settled in TZS. If you view prices in another currency, the final charge uses the backend-confirmed TZS amount.</p></InfoPopover>} value={checkoutTotal === null ? "Pending delivery quote" : <PriceDisplay amount={checkoutTotal} sourceCurrency="TZS" showSettlementTzs />} strong />
 </div>
 </div>
 </section>

 <Coupon />

 {selectedAddress && (
 <section className="rounded-2xl/60 bg-card p-4 text-sm sm:p-6">
 <h3 className="font-bold text-foreground">Delivery summary</h3>
 <p className="mt-3 text-muted-foreground">
 <b className="text-foreground">{selectedAddress.recipient_name || profile?.full_name || "Customer"}</b><br />
 {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.region}, {selectedAddress.country}
 </p>
 {selectedShipping && (
 <p className="mt-3 text-muted-foreground">
 {deliveryMode === "local" ? <>Delivery: <b className="text-foreground">Xerin Express · {("tier" in selectedShipping ? selectedShipping.label : "Domestic")}</b><br />Partner assigned automatically</> : <>Logistics: <b className="text-foreground">{eligibleLogistics.data?.results.find((company) => company.logistics_company_id === selectedCompanyId)?.name || "Selected provider"}</b><br />Service: {"method_name" in selectedShipping ? selectedShipping.method_name : "International"} · Cross-border</>}
 </p>
 )}
 </section>
 )}
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
 icon={CreditCardIcon}
 title="Payment"
 description="Choose Mobile Payment or Card Payment for the backend-confirmed TZS total."
 />

 <div className="space-y-5">
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

 <section className="rounded-2xl/60 bg-card p-4 sm:p-6">
 <h3 className="font-bold text-foreground">Final checks</h3>
 {selectedAddress && (
 <div className="mt-4 flex items-start gap-3 rounded-xl bg-muted/70 p-3.5 text-xs leading-5 text-muted-foreground">
 <HugeiconsIcon icon={Location01Icon} size={16} className="mt-0.5 shrink-0 text-primary" />
 <span>
 <b className="text-foreground">Deliver to</b><br />
 {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.country}
 </span>
 </div>
 )}
 <div className="mt-4 rounded-xl bg-primary/5 p-3 text-[11px] leading-5 text-foreground sm:text-xs">
 <b>Final checkout protection:</b> Xerin rechecks prices, stock, address, logistics and the protected shipping rate before creating the order.
 </div>
 </section>
 </div>

 <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
 <button
 type="button"
 onClick={() => goToStep(3)}
 className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-muted px-5 font-semibold text-foreground hover:bg-muted/70"
 >
 <HugeiconsIcon icon={ArrowLeft01Icon} size={17} /> Back to Review
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
 className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-7 text-base font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
 >
 {createOrder.isPending || isCreatingAddress ? "Processing..." : "Pay Securely"}
 </button>
 </div>

 <p className="text-center text-[11px] leading-5 text-muted-foreground">
 Display currency is for convenience only. Payment is settled in TZS using the backend-confirmed Grand Total.
 </p>
 </div>
 )}

 </div>

 <OrderTotalsCard
 cart={cart}
 cartItems={cartItems}
 shippingAmount={shippingAmount}
 checkoutTotal={checkoutTotal}
 />
 </div>
 </form>
 </div>
 </section>

 <AddressModal
 isOpen={addressDrawerOpen}
 closeModal={() => setAddressDrawerOpen(false)}
 presentation="drawer"
 isSubmitting={isCreatingAddress}
 onSubmit={async (payload) => {
 try {
 const created = await createAddress(payload);
 const createdCountry = normalizeCountry(created.country);
 if (createdCountry && createdCountry !== destinationCountry) {
 setDestinationCountry(createdCountry);
 }
 await refetchAddresses();
 setSelectedAddressId(String(created.id));
 setAddressDrawerOpen(false);
 toast.success("Delivery address added — it is selected for this order.");
 } catch (error) {
 toast.error(error instanceof Error ? error.message : "Could not save the address. Try again.");
 }
 }}
 />
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
 <nav aria-label="Checkout progress" className="rounded-2xl/60 bg-card px-4 py-5 sm:px-8">
 <ol className="flex items-start">
 {CHECKOUT_STEPS.map((step, index) => {
 const active = currentStep === step.id;
 const done = completed(step.id);
 const enabled = unlocked(step.id);
 const reached = done || active;
 return (
 <li key={step.id} className="relative flex min-w-0 flex-1 flex-col items-center">
 {index > 0 && (
 <span
 aria-hidden="true"
 className={`absolute left-0 right-1/2 top-5 h-0.5 sm:top-6 ${reached ? "bg-primary" : "bg-border"}`}
 />
 )}
 {index < CHECKOUT_STEPS.length - 1 && (
 <span
 aria-hidden="true"
 className={`absolute left-1/2 right-0 top-5 h-0.5 sm:top-6 ${done ? "bg-primary" : "bg-border"}`}
 />
 )}
 <button
 type="button"
 disabled={!enabled}
 onClick={() => onStepClick(step.id)}
 className={`relative z-10 flex flex-col items-center gap-1.5 rounded-xl px-1 py-1 transition ${
 enabled ? "" : "cursor-not-allowed opacity-60"
 }`}
 >
 <span
 className={`flex h-10 w-10 items-center justify-center rounded-full transition sm:h-12 sm:w-12 ${
 active
 ? "bg-primary text-white ring-4 ring-primary/15"
 : done
 ? "bg-primary text-white"
 : "bg-muted text-muted-foreground"
 }`}
 >
 {done ? <HugeiconsIcon icon={CheckIcon} size={18} /> : <HugeiconsIcon icon={step.icon} size={19} />}
 </span>
 <span
 className={`block max-w-full truncate text-[11px] font-bold sm:text-xs ${
 active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"
 }`}
 >
 {step.shortLabel}
 </span>
 </button>
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
 icon,
}: {
 step: string;
 title: string;
 description: string;
 icon: typeof Location01Icon;
}) {
 return (
 <div className="mb-5 flex items-start gap-3.5 sm:mb-7 sm:gap-4">
 <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary text-white sm:h-13 sm:w-13">
 <HugeiconsIcon icon={icon} size={22} />
 </span>
 <div className="min-w-0">
 <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
 Step {step} of 4
 </p>
 <h1 className="mt-0.5 text-xl font-bold text-foreground sm:text-2xl">
 {title}
 </h1>
 <p className="mt-0.5 max-w-2xl text-[13px] leading-5 text-muted-foreground sm:text-sm">
 {description}
 </p>
 </div>
 </div>
 );
}

function OrderTotalsCard({
 cart,
 cartItems,
 shippingAmount,
 checkoutTotal,
}: {
 cart: ReturnType<typeof useBackendCart>["data"];
 cartItems: ReturnType<typeof mapBackendCartToUi>;
 shippingAmount: number | null;
 checkoutTotal: number | null;
}) {
 const promoDiscount = Number(cart?.promotion_discount_amount || 0);
 const couponDiscount = Number(cart?.coupon_discount_amount || 0);
 return (
 <aside className="order-first lg:order-none lg:sticky lg:top-24">
 <section className="overflow-hidden rounded-2xl bg-card">
 <header className="flex items-center justify-between gap-3  px-5 py-4">
 <h3 className="font-bold text-foreground">Order summary</h3>
 <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
 {cartItems.length} item{cartItems.length === 1 ? "" : "s"}
 </span>
 </header>

 <div className="hidden max-h-60 space-y-3 overflow-y-auto  px-5 py-4 lg:block">
 {cartItems.slice(0, 4).map((item) => {
 const thumb = item.imgs?.thumbnails?.[0];
 return (
 <div key={item.cartItemId} className="flex items-center gap-3">
 <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-lg/60 bg-muted">
 {thumb ? (
 <img src={thumb} alt="" className="h-full w-full object-cover" />
 ) : (
 <HugeiconsIcon icon={ClipboardListIcon} size={15} className="text-muted-foreground" />
 )}
 </span>
 <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">
 {item.title}
 </span>
 <span className="shrink-0 text-xs text-muted-foreground">×{item.quantity}</span>
 </div>
 );
 })}
 {cartItems.length > 4 && (
 <p className="text-[11px] font-semibold text-muted-foreground">
 +{cartItems.length - 4} more item{cartItems.length - 4 === 1 ? "" : "s"}
 </p>
 )}
 </div>

 <div className="p-5">
 <SummaryRow
 label="Subtotal"
 value={<PriceDisplay amount={Number(cart?.subtotal || 0)} sourceCurrency="TZS" />}
 />
 {promoDiscount > 0 && (
 <SummaryRow
 label="Promotion"
 value={<><span>-</span><PriceDisplay amount={promoDiscount} sourceCurrency="TZS" /></>}
 saving
 />
 )}
 {couponDiscount > 0 && (
 <SummaryRow
 label="Coupon"
 value={<><span>-</span><PriceDisplay amount={couponDiscount} sourceCurrency="TZS" /></>}
 saving
 />
 )}
 <SummaryRow
 label="Delivery"
 value={shippingAmount === null ? "Pending quote" : <PriceDisplay amount={shippingAmount} sourceCurrency="TZS" />}
 />
 <div className="mt-2  pt-2">
 <SummaryRow
 label="Total"
 value={checkoutTotal === null ? "Pending" : <PriceDisplay amount={checkoutTotal} sourceCurrency="TZS" showSettlementTzs />}
 strong
 />
 </div>
 <p className="mt-3 flex items-center gap-1.5 text-[11px] leading-5 text-muted-foreground">
 <HugeiconsIcon icon={LockPasswordIcon} size={13} className="shrink-0 text-primary" />
 Secure checkout — total confirmed by the server before you pay.
 </p>
 </div>
 </section>
 </aside>
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
 className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-muted px-5 font-semibold text-foreground hover:bg-muted/70"
 >
 <HugeiconsIcon icon={ArrowLeft01Icon} size={17} /> Back
 </button>
 ) : (
 <span />
 )}
 <button
 type="button"
 onClick={onNext}
 disabled={nextDisabled}
 className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
 >
 {nextLabel} <HugeiconsIcon icon={ArrowRight01Icon} size={17} />
 </button>
 </div>
 );
}

function SummaryRow({
 label,
 value,
 saving = false,
 strong = false,
 info,
}: {
 label: string;
 value: React.ReactNode;
 saving?: boolean;
 strong?: boolean;
 info?: React.ReactNode;
}) {
 return (
 <div className="flex items-center justify-between gap-3 py-2.5 sm:gap-4 sm:py-3">
 <span
 className={
 strong
 ? "inline-flex items-center gap-1.5 font-bold text-foreground"
 : "inline-flex items-center gap-1.5 text-sm text-muted-foreground"
 }
 >
 {label}
 {info}
 </span>
 <span
 className={`text-right ${
 strong
 ? "text-base font-bold text-foreground sm:text-lg"
 : saving
 ? "text-sm font-bold text-green-dark"
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
