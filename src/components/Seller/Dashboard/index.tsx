"use client";


import { Spinner } from "@/components/ui/Spinner";
import { ApiError } from "@/lib/api/client";
import { productsApi } from "@/lib/api/endpoints/products";
import { sellersApi } from "@/lib/api/endpoints/sellers";
import {
 sellerInventoryApi,
 type SellerInventoryItem,
 type SellerInventorySummary,
}
from "@/lib/api/endpoints/seller-inventory";
import { authStorage } from "@/lib/auth/storage";
import type { Product } from "@/types/api/product";
import type {
 PayoutAccount,
 Seller,
 SellerBusinessProfile,
 SellerKycDocument,
 SellerKycStatus,
 SellerDashboardPerformance,
} from "@/types/api/seller";
import { HugeiconsIcon, type IconSvgElement, type HugeiconsIconProps } from "@hugeicons/react";
import { AlertCircleIcon, ArrowRight01Icon, CheckmarkBadge01Icon, PackageIcon, CheckIcon, CheckmarkCircle02Icon, CircleDashedIcon, Clock01Icon, FileCorruptIcon, Image01Icon, PackageCheckIcon, PackageOpenIcon, PlusIcon, RefreshCwIcon, ShieldCheckIcon, ShoppingBag01Icon, SparklesIcon, Store01Icon, ChartIncreaseIcon, Wallet03Icon, WarehouseIcon, StarIcon, MessageQuestionIcon, TicketStarIcon, TruckIcon, DollarCircleIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import OnboardingTour, { useTour } from "@/components/Common/Info/OnboardingTour";
import InfoPopover from "@/components/Common/Info/InfoPopover";

const SELLER_TOUR_STEPS = [
 { title: "Your seller dashboard", body: "Store readiness, sales performance and items that need your attention · all in one place." },
 { title: "Add your first product", body: "Create listings from Products. They go live on the marketplace after a quick review." },
 { title: "Complete verification", body: "Finish KYC so your store stays active and payouts are never interrupted. We only ask for what regulators require." },
 { title: "Orders and payouts", body: "Fulfil orders on time and your earnings settle to your payout account automatically." },
];

type CurrentUser = {
 account_type?: string;
 roles?: string[];
 seller_status?: string | null;
 first_name?: string | null;
};

type LoadState = "loading" | "ready" | "error";

const documentNames: Record<string, string> = {
 tin: "TIN Certificate",
 business_profile: "Business Profile",
 business_registration: "Business Registration",
};

const pretty = (value: string) =>
 value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const number = new Intl.NumberFormat("en-US");

const formatMoney = (value: number, currency: string) =>
 new Intl.NumberFormat("en-TZ", {
 style: "currency",
 currency,
 maximumFractionDigits: 0,
 }).format(Number.isFinite(value) ? value : 0);

export default function SellerDashboard() {
 const router = useRouter();
 const user = authStorage.getUser<CurrentUser>();
 const token = authStorage.getAccessToken();

 const isSeller = useMemo(
 () =>
 Boolean(
 user &&
 (user.account_type === "seller" || (user.roles ?? []).includes("seller")),
 ),
 [user],
 );

 const [products, setProducts] = useState<Product[]>([]);
 const [inventory, setInventory] = useState<SellerInventoryItem[]>([]);
 const [inventorySummary, setInventorySummary] = useState<SellerInventorySummary | null>(null);
 const [kyc, setKyc] = useState<SellerKycStatus | null>(null);
 const [documents, setDocuments] = useState<SellerKycDocument[]>([]);
 const [payouts, setPayouts] = useState<PayoutAccount[]>([]);
 const [seller, setSeller] = useState<Seller | null>(null);
 const [profile, setProfile] = useState<SellerBusinessProfile | null>(null);
 const [performance, setPerformance] =
 useState<SellerDashboardPerformance | null>(null);
 const [state, setState] = useState<LoadState>("loading");
 const [refreshing, setRefreshing] = useState(false);
 const [error, setError] = useState("");
 const tour = useTour("seller_dashboard");

 useEffect(() => {
 if (!token) {
 router.replace("/signin?redirect=/seller/dashboard");
 return;
 }

 if (!isSeller) {
 router.replace("/account");
 return;
 }

 void load(false);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [isSeller, router, token]);

 async function load(background: boolean) {
 if (!token) return;

 background ? setRefreshing(true) : setState("loading");
 setError("");

 try {
 // Seller status is the first decision point. Pending/under-review sellers
 // should not call commerce APIs that may be unavailable before approval.
 const sellerData = await sellersApi.getMe(token);
 setSeller(sellerData);

 const activationData = await Promise.all([
 sellersApi.getKycStatus(token),
 sellersApi.getKycDocuments(token),
 sellersApi.getProfile(),
 ]);

 const [status, docs, profileData] = activationData;
 setKyc(status);
 setDocuments(docs);
 setProfile(profileData);

 if (sellerData.status === "approved") {
 const [
 productData,
 inventoryData,
 inventorySummaryData,
 payoutList,
 performanceData,
 ] = await Promise.all([
 productsApi.getMyProducts({ skip: 0, limit: 100 }),
 sellerInventoryApi.list({ page: 1, page_size: 100 }).catch(() => ({
 total: 0,
 page: 1,
 page_size: 0,
 results: [],
 })),
 sellerInventoryApi.summary().catch(() => null),
 sellersApi.getPayoutAccounts(token),
 sellersApi.getDashboardPerformance(),
 ]);

 setProducts(productData);
 setInventory(
 Array.isArray(inventoryData?.results) ? inventoryData.results : [],
 );
 setInventorySummary(inventorySummaryData);
 setPayouts(payoutList);
 setPerformance(performanceData);
 } else {
 setProducts([]);
 setInventory([]);
 setInventorySummary(null);
 setPayouts([]);
 setPerformance(null);
 }

 setState("ready");
 } catch (cause) {
 setError(
 cause instanceof ApiError
 ? cause.message
 : "Unable to load seller dashboard. Check your connection and retry.",
 );
 setState("error");
 } finally {
 setRefreshing(false);
 }
 }

 if (!token || !isSeller) return null;
 if (state === "loading") return <DashboardSkeleton />;
 if (state === "error")
 return <ErrorState message={error} retry={() => void load(false)} />;

 const accountStatus = seller?.status || user?.seller_status || "pending";

 if (accountStatus !== "approved") {
 return (
 <SellerActivationDashboard
 seller={seller}
 kyc={kyc}
 documents={documents}
 profile={profile}
 refreshing={refreshing}
 refresh={() => void load(true)}
 />
 );
 }

 const requiredDocuments = kyc?.required_documents ?? [];
 const missingDocuments = kyc?.missing_documents ?? [];
 const rejectedDocs = documents.filter((document) => document.status === "rejected");

 const kycLabel = rejectedDocs.length
 ? "Changes Requested"
 : missingDocuments.length
 ? documents.length
 ? "Incomplete"
 : "Not Started"
 : kyc?.can_submit_for_review
 ? "Ready to Submit"
 : documents.some(
 (document) =>
 document.status === "pending" || document.status === "under_review",
 )
 ? "Under Review"
 : "Approved";

 const approvedProducts = products.filter(
 (product) => product.status === "approved",
 ).length;
 const pendingProducts = products.filter((product) =>
 ["pending", "submitted", "under_review"].includes(product.status || ""),
 ).length;
 const rejectedProducts = products.filter(
 (product) => product.status === "rejected",
 ).length;
 const draftProducts = Math.max(
 0,
 products.length - approvedProducts - pendingProducts - rejectedProducts,
 );

 const fallbackLowStockRows = inventory.filter(
 (row) =>
 row.available_quantity > 0 &&
 row.available_quantity <= (row.low_stock_threshold ?? 0),
 );
 const fallbackOutOfStockRows = inventory.filter(
 (row) => row.available_quantity <= 0,
 );
 const inventoryHealthTotal = inventorySummary?.total_variants ?? inventory.length;
 const inventoryLow = inventorySummary?.low_stock_variants ?? fallbackLowStockRows.length;
 const inventoryOut = inventorySummary?.out_of_stock_variants ?? fallbackOutOfStockRows.length;
 const healthyInventoryRows = Math.max(
 0,
 inventoryHealthTotal - inventoryLow - inventoryOut,
 );

 const dashboardProductsTotal = performance?.products_total ?? products.length;
 const dashboardProductsApproved =
 performance?.products_approved ?? approvedProducts;
 const dashboardProductsPending =
 performance?.products_pending_review ?? pendingProducts;

 const ordersTotal = performance?.orders_total ?? 0;
 const ordersNew = performance?.orders_new ?? 0;
 const ordersProcessing = performance?.orders_processing ?? 0;
 const ordersReady = performance?.orders_ready_to_ship ?? 0;

 const walletCurrency = performance?.wallet_currency || "TZS";
 const walletPending = Number(performance?.wallet_pending ?? 0);
 const walletAvailable = Number(performance?.wallet_available ?? 0);
 const walletReserved = Number(performance?.wallet_reserved ?? 0);

 const activePromotions = performance?.active_promotions ?? 0;
 const averageRating = Number(performance?.rating_average ?? 0);
 const reviewCount = performance?.review_count ?? 0;
 const unansweredQuestions = performance?.unanswered_questions ?? 0;
 const pendingPayouts = performance?.pending_payouts ?? 0;

 const kycProgress = requiredDocuments.length
 ? Math.round(
 ((requiredDocuments.length - missingDocuments.length) /
 requiredDocuments.length) *
 100,
 )
 : 0;

 const setupChecks = [
 Boolean(profile?.business_description),
 requiredDocuments.length > 0 && missingDocuments.length === 0,
 payouts.length > 0,
 products.length > 0,
 ];
 const setupProgress = Math.round(
 (setupChecks.filter(Boolean).length / setupChecks.length) * 100,
 );

 const nextActions = [
 ...missingDocuments.map((type) => ({
 priority: "High",
 title: `Upload ${documentNames[type] ?? pretty(type)}`,
 description: "Required for seller verification.",
 href: "/seller/kyc",
 })),
 ...(payouts.length
 ? []
 : [
 {
 priority: "High",
 title: "Add a payout account",
 description: "Prepare your account for future settlements.",
 href: "/seller/kyc?tab=payouts",
 },
 ]),
 ...(profile?.business_description
 ? []
 : [
 {
 priority: "Medium",
 title: "Complete your business profile",
 description: "Add your description, address and business information.",
 href: "/seller/store",
 },
 ]),
 ...(products.length
 ? []
 : [
 {
 priority: "Medium",
 title: "Add your first product",
 description: "Start building your marketplace catalog.",
 href: "/seller/products?create=true",
 },
 ]),
 ...products
 .filter((product) => product.status === "rejected")
 .slice(0, 2)
 .map((product) => ({
 priority: "High",
 title: `Resolve ${product.name}`,
 description:
 product.rejection_reason || "This product requires changes.",
 href: `/seller/products?product=${product.id}`,
 })),
 ];

 const statusBars = [
 { label: "Approved", value: approvedProducts, className: "bg-success" },
 { label: "Pending review", value: pendingProducts, className: "bg-warning" },
 { label: "Rejected", value: rejectedProducts, className: "bg-rose-500" },
 { label: "Draft / other", value: draftProducts, className: "bg-muted-foreground/40" },
 ];

 return (
 <div
 className="w-full space-y-6"
 style={{
 fontFamily:
 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
 }}
 >
 {accountStatus !== "approved" && (
 <div
 className={`flex gap-3 rounded-xl border p-4 ${
 accountStatus === "suspended" || accountStatus === "rejected"
 ? "border-red-light-4 bg-red-light-6 text-red-800 dark:border-red-500/30 dark:bg-destructive/10 dark:text-red-200"
 : "border-yellow-light-2 bg-yellow-light-4 text-amber-900 dark:border-amber-500/30 dark:bg-warning/10 dark:text-amber-200"
 }`}
 >
 <HugeiconsIcon icon={AlertCircleIcon} className="mt-0.5 shrink-0" size={20} />
 <div>
 <p className="font-semibold">Seller account: {pretty(accountStatus)}</p>
 <p className="mt-1 text-sm opacity-80">
 {accountStatus === "suspended"
 ? "Selling operations are restricted. Contact support for account review."
 : "Complete the remaining verification steps so your store can operate without restrictions."}
 </p>
 </div>
 </div>
 )}

 <Hero
 name={user?.first_name || "Seller"}
 businessName={seller?.business_name || "Your store"}
 setupProgress={setupProgress}
 refreshing={refreshing}
 refresh={() => void load(true)}
 />
 <OnboardingTour steps={SELLER_TOUR_STEPS} active={tour.active} onFinish={tour.finish} />

 <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 2xl:grid-cols-6">
 <MetricCard
 label="Total Products"
 value={number.format(dashboardProductsTotal)}
 helper={`${number.format(dashboardProductsApproved)} approved`}
 icon={ShoppingBag01Icon}
 tone="orange"
 progress={dashboardProductsTotal ? Math.round((dashboardProductsApproved / dashboardProductsTotal) * 100) : 0}
 graphLabel="approved"
 />
 <MetricCard
 label="Pending Review"
 value={number.format(dashboardProductsPending)}
 helper="Awaiting catalog approval"
 icon={Clock01Icon}
 tone="amber"
 progress={dashboardProductsTotal ? Math.min(100, Math.round((dashboardProductsPending / dashboardProductsTotal) * 100)) : 0}
 graphLabel="pending"
 info={<InfoPopover title="Pending review" align="end"><p>New and edited listings go through a catalog review before they appear on the marketplace.</p><p>Reviewed products move here automatically · no action needed unless one is rejected.</p></InfoPopover>}
 />
 <MetricCard
 label="Total Orders"
 value={number.format(ordersTotal)}
 helper={`${number.format(ordersNew)} new`}
 icon={PackageCheckIcon}
 tone="blue"
 progress={ordersTotal ? Math.min(100, Math.round(((ordersProcessing + ordersReady) / ordersTotal) * 100)) : 0}
 graphLabel="active"
 />
 <MetricCard
 label="Available Balance"
 value={formatMoney(walletAvailable, walletCurrency)}
 helper={`${number.format(pendingPayouts)} pending payout${pendingPayouts === 1 ? "" : "s"}`}
 icon={Wallet03Icon}
 tone="green"
 progress={(walletAvailable + walletPending + walletReserved) > 0 ? Math.round((walletAvailable / (walletAvailable + walletPending + walletReserved)) * 100) : 0}
 graphLabel="available"
 info={<InfoPopover title="Available balance" align="end"><p>Money from completed orders that is ready to be paid out to your account.</p><p>Amounts from orders still being delivered stay pending until the buyer confirms receipt.</p></InfoPopover>}
 />
 <MetricCard
 label="Average Rating"
 value={`${averageRating.toFixed(2)} / 5`}
 helper={`${number.format(reviewCount)} review${reviewCount === 1 ? "" : "s"}`}
 icon={StarIcon}
 tone="amber"
 progress={Math.round((averageRating / 5) * 100)}
 graphLabel="rating"
 />
 <MetricCard
 label="Unanswered Q&A"
 value={number.format(unansweredQuestions)}
 helper="Customer questions"
 icon={MessageQuestionIcon}
 tone={unansweredQuestions ? "red" : "green"}
 progress={unansweredQuestions ? 100 : 0}
 graphLabel={unansweredQuestions ? "needs reply" : "clear"}
 />
 </section>

 <section className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-4">
 <SellerChartCard
 eyebrow="Orders"
 title="Fulfilment workload"
 description="Current seller-order workload by fulfilment stage."
 >
 <OrderPipelineChart
 newOrders={ordersNew}
 processing={ordersProcessing}
 ready={ordersReady}
 total={ordersTotal}
 />
 </SellerChartCard>

 <SellerChartCard
 eyebrow="Catalog"
 title="Product approval mix"
 description="How your current catalog is distributed across approval states."
 >
 <CatalogMixChart
 approved={approvedProducts}
 pending={pendingProducts}
 rejected={rejectedProducts}
 draft={draftProducts}
 />
 </SellerChartCard>

 <SellerChartCard
 eyebrow="Inventory"
 title="Stock health"
 description="Live inventory condition from your inventory summary endpoint."
 >
 <InventoryMixChart
 healthy={healthyInventoryRows}
 low={inventoryLow}
 out={inventoryOut}
 />
 </SellerChartCard>

 <SellerChartCard
 eyebrow="Finance"
 title="Wallet composition"
 description="Pending, available and reserved seller funds."
 >
 <WalletCompositionChart
 pending={walletPending}
 available={walletAvailable}
 reserved={walletReserved}
 currency={walletCurrency}
 />
 </SellerChartCard>
 </section>

 <section className="grid gap-5 2xl:grid-cols-[1.45fr_.85fr]">
 <Card>
 <SectionHeading
 eyebrow="Catalog performance"
 title="Product status overview"
 description="Live distribution of your seller products by approval status."
 icon={ChartIncreaseIcon}
 />

 <div className="mt-7 grid gap-7 lg:grid-cols-[1fr_220px]">
 <div className="space-y-5">
 {statusBars.map((item) => (
 <StatusBar
 key={item.label}
 label={item.label}
 value={item.value}
 total={Math.max(products.length, 1)}
 className={item.className}
 />
 ))}
 </div>

 <DonutSummary
 value={approvedProducts}
 total={products.length}
 label="Approved catalog"
 />
 </div>
 </Card>

 <InventoryHealth
 healthy={healthyInventoryRows}
 low={inventoryLow}
 out={inventoryOut}
 total={inventoryHealthTotal}
 />
 </section>

 <section className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
 <Verification
 documents={documents}
 required={requiredDocuments}
 missing={missingDocuments}
 accountStatus={accountStatus}
 kycLabel={kycLabel}
 />

 <StoreReadiness
 progress={setupProgress}
 profileReady={Boolean(profile?.business_description)}
 kycReady={
 requiredDocuments.length > 0 && missingDocuments.length === 0
 }
 payoutReady={payouts.length > 0}
 productReady={products.length > 0}
 />
 </section>

 <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
 <NextActions actions={nextActions} />

 <Card>
 <SectionHeading
 eyebrow="Quick actions"
 title="Run your store"
 description="Jump directly to the tasks sellers use most often."
 icon={SparklesIcon}
 />

 <div className="mt-5 grid gap-3 sm:grid-cols-2">
 <QuickAction
 href="/seller/products?create=true"
 icon={PlusIcon}
 title="Add product"
 description="Create a new catalog item"
 />
 <QuickAction
 href="/seller/inventory"
 icon={PackageIcon}
 title="Inventory"
 description="Review stock availability"
 />
 <QuickAction
 href="/seller/store"
 icon={Store01Icon}
 title="Store profile"
 description="Update business storefront"
 />
 <QuickAction
 href="/seller/kyc?tab=payouts"
 icon={Wallet03Icon}
 title="Payout setup"
 description="Manage payout account"
 />
 </div>
 </Card>
 </section>

 <RecentProducts products={products} inventory={inventory} />

 <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
 <Card>
 <SectionHeading
 eyebrow="Order operations"
 title="Fulfilment pipeline"
 description="Live seller-order workload from the Seller Phase 10 dashboard endpoint."
 icon={PackageCheckIcon}
 />

 <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
 <PipelineStat
 label="New"
 value={ordersNew}
 total={Math.max(ordersTotal, 1)}
 href="/seller/orders?status=new"
 />
 <PipelineStat
 label="Processing"
 value={ordersProcessing}
 total={Math.max(ordersTotal, 1)}
 href="/seller/orders?status=processing"
 />
 <PipelineStat
 label="Ready to Ship"
 value={ordersReady}
 total={Math.max(ordersTotal, 1)}
 href="/seller/orders?status=ready_to_ship"
 />
 <PipelineStat
 label="All Orders"
 value={ordersTotal}
 total={Math.max(ordersTotal, 1)}
 href="/seller/orders"
 />
 </div>

 <div className="mt-6">
 <PerformanceBar
 label="New orders"
 value={ordersNew}
 total={Math.max(ordersTotal, 1)}
 className="bg-primary-500"
 />
 <PerformanceBar
 label="Processing"
 value={ordersProcessing}
 total={Math.max(ordersTotal, 1)}
 className="bg-warning"
 />
 <PerformanceBar
 label="Ready to ship"
 value={ordersReady}
 total={Math.max(ordersTotal, 1)}
 className="bg-success"
 />
 </div>

 <Link
 href="/seller/orders"
 className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
 >
 Open order workspace <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
 </Link>
 </Card>

 <Card>
 <SectionHeading
 eyebrow="Finance"
 title="Wallet position"
 description="Current pending, available and reserved seller balances."
 icon={DollarCircleIcon}
 />

 <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
 <WalletStat
 label="Pending"
 value={formatMoney(walletPending, walletCurrency)}
 icon={Clock01Icon}
 />
 <WalletStat
 label="Available"
 value={formatMoney(walletAvailable, walletCurrency)}
 icon={Wallet03Icon}
 highlight
 />
 <WalletStat
 label="Reserved"
 value={formatMoney(walletReserved, walletCurrency)}
 icon={ShieldCheckIcon}
 />
 </div>

 <div className="mt-5 grid grid-cols-2 gap-3">
 <MiniStat
 label="Payout accounts"
 value={number.format(payouts.length)}
 />
 <MiniStat
 label="Pending payouts"
 value={number.format(pendingPayouts)}
 />
 </div>

 <div className="mt-5 flex flex-wrap gap-3">
 <Link
 href="/seller/earnings"
 className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
 >
 Wallet & earnings <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
 </Link>
 <Link
 href="/seller/payouts"
 className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"
 >
 Payout requests <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
 </Link>
 </div>
 </Card>
 </section>

 <section className="grid gap-5 xl:grid-cols-3">
 <PerformanceLinkCard
 href="/seller/promotions"
 icon={TicketStarIcon}
 eyebrow="Promotions"
 value={number.format(activePromotions)}
 title="Active promotions"
 description="Seller-funded promotions currently active."
 />
 <PerformanceLinkCard
 href="/seller/reviews"
 icon={StarIcon}
 eyebrow="Reputation"
 value={averageRating.toFixed(2)}
 title={`${number.format(reviewCount)} customer reviews`}
 description="Average product-review rating across your seller catalog."
 />
 <PerformanceLinkCard
 href="/seller/questions"
 icon={MessageQuestionIcon}
 eyebrow="Customer Q&A"
 value={number.format(unansweredQuestions)}
 title="Questions need attention"
 description="Respond quickly to product questions before customers abandon purchase decisions."
 alert={unansweredQuestions > 0}
 />
 </section>
 </div>
 );
}


function SellerChartCard({
 eyebrow,
 title,
 description,
 children,
}: {
 eyebrow: string;
 title: string;
 description: string;
 children: React.ReactNode;
}) {
 return (
 <section className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border">
 
 <div className="relative">
 <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
 {eyebrow}
 </p>
 <h3 className="mt-1 text-lg font-extrabold tracking-[-0.025em] text-foreground">
 {title}
 </h3>
 <p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">
 {description}
 </p>
 <div className="mt-5">{children}</div>
 </div>
 </section>
 );
}

function OrderPipelineChart({
 newOrders,
 processing,
 ready,
 total,
}: {
 newOrders: number;
 processing: number;
 ready: number;
 total: number;
}) {
 const rows = [
 { label: "New", value: newOrders, className: "bg-primary-500" },
 { label: "Processing", value: processing, className: "bg-primary" },
 { label: "Ready", value: ready, className: "bg-success" },
 ];
 const max = Math.max(1, ...rows.map((row) => row.value));

 return (
 <div>
 <div className="flex h-40 items-end justify-around gap-3 rounded-xl bg-muted px-3 pb-3 pt-5 dark:bg-card/[0.035]">
 {rows.map((row) => {
 const height = row.value === 0 ? 6 : Math.max(14, (row.value / max) * 112);
 return (
 <div key={row.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
 <span className="mb-2 text-xs font-extrabold text-foreground">
 {number.format(row.value)}
 </span>
 <div className="flex h-[112px] w-full max-w-12 items-end overflow-hidden rounded-t-xl bg-muted/70 dark:bg-card/10">
 <div
 className={`w-full rounded-t-xl transition-all ${row.className}`}
 style={{ height: `${height}px` }}
 />
 </div>
 <span className="mt-2 truncate text-[10px] font-semibold text-muted-foreground">
 {row.label}
 </span>
 </div>
 );
 })}
 </div>
 <div className="mt-3 flex items-center justify-between rounded-xl border border-border px-3 py-2 text-xs dark:border-border">
 <span className="text-muted-foreground">All seller orders</span>
 <span className="font-extrabold">{number.format(total)}</span>
 </div>
 </div>
 );
}

function CatalogMixChart({
 approved,
 pending,
 rejected,
 draft,
}: {
 approved: number;
 pending: number;
 rejected: number;
 draft: number;
}) {
 const total = approved + pending + rejected + draft;
 const safe = Math.max(total, 1);
 const approvedEnd = (approved / safe) * 100;
 const pendingEnd = approvedEnd + (pending / safe) * 100;
 const rejectedEnd = pendingEnd + (rejected / safe) * 100;
 const gradient = total
 ? `conic-gradient(#10b981 0 ${approvedEnd}%, #f59e0b ${approvedEnd}% ${pendingEnd}%, #ef4444 ${pendingEnd}% ${rejectedEnd}%, #94a3b8 ${rejectedEnd}% 100%)`
 : "conic-gradient(var(--muted) 0 100%)";

 const items = [
 ["Approved", approved, "bg-success"],
 ["Pending", pending, "bg-warning"],
 ["Rejected", rejected, "bg-destructive"],
 ["Draft", draft, "bg-muted-foreground/40"],
 ] as const;

 return (
 <div className="grid grid-cols-[132px_minmax(0,1fr)] items-center gap-4">
 <div className="relative mx-auto h-32 w-32 rounded-full" style={{ background: gradient }}>
 <div className="absolute inset-[15px] grid place-items-center rounded-full bg-card text-center">
 <div>
 <p className="text-2xl font-extrabold tracking-[-0.04em]">{number.format(total)}</p>
 <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Products</p>
 </div>
 </div>
 </div>
 <div className="space-y-2.5">
 {items.map(([label, value, color]) => (
 <div key={label} className="flex items-center justify-between gap-3 text-xs">
 <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
 <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
 <span>{label}</span>
 </span>
 <span className="font-extrabold text-foreground">{number.format(value)}</span>
 </div>
 ))}
 </div>
 </div>
 );
}

function InventoryMixChart({
 healthy,
 low,
 out,
}: {
 healthy: number;
 low: number;
 out: number;
}) {
 const total = healthy + low + out;
 const safe = Math.max(total, 1);
 const healthyEnd = (healthy / safe) * 100;
 const lowEnd = healthyEnd + (low / safe) * 100;
 const gradient = total
 ? `conic-gradient(#10b981 0 ${healthyEnd}%, #f59e0b ${healthyEnd}% ${lowEnd}%, #ef4444 ${lowEnd}% 100%)`
 : "conic-gradient(var(--muted) 0 100%)";

 return (
 <div>
 <div className="flex items-center justify-center gap-5">
 <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: gradient }}>
 <div className="absolute inset-[15px] grid place-items-center rounded-full bg-card text-center">
 <div>
 <p className="text-2xl font-extrabold tracking-[-0.04em]">{number.format(healthy)}</p>
 <p className="text-[10px] font-semibold uppercase text-green-dark">Healthy</p>
 </div>
 </div>
 </div>
 <div className="space-y-3 text-xs">
 <ChartLegendDot label="Healthy" value={healthy} className="bg-success" />
 <ChartLegendDot label="Low stock" value={low} className="bg-warning" />
 <ChartLegendDot label="Out" value={out} className="bg-destructive" />
 </div>
 </div>
 <p className="mt-4 text-center text-[11px] text-muted-foreground">
 {number.format(total)} tracked inventory variant{total === 1 ? "" : "s"}
 </p>
 </div>
 );
}

function ChartLegendDot({
 label,
 value,
 className,
}: {
 label: string;
 value: number;
 className: string;
}) {
 return (
 <div className="flex items-center justify-between gap-5">
 <span className="flex items-center gap-2 text-muted-foreground">
 <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
 {label}
 </span>
 <span className="font-extrabold text-foreground">{number.format(value)}</span>
 </div>
 );
}

function WalletCompositionChart({
 pending,
 available,
 reserved,
 currency,
}: {
 pending: number;
 available: number;
 reserved: number;
 currency: string;
}) {
 const total = Math.max(0, pending) + Math.max(0, available) + Math.max(0, reserved);
 const safe = Math.max(total, 1);
 const values = [
 { label: "Available", value: Math.max(0, available), className: "bg-success" },
 { label: "Pending", value: Math.max(0, pending), className: "bg-primary" },
 { label: "Reserved", value: Math.max(0, reserved), className: "bg-foreground/70" },
 ];

 return (
 <div>
 <div className="rounded-xl bg-muted p-4 dark:bg-card/[0.035]">
 <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Total wallet position</p>
 <p className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-foreground">
 {formatMoney(total, currency)}
 </p>
 <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-muted dark:bg-card/10">
 {values.map((item) => (
 <div
 key={item.label}
 className={item.className}
 style={{ width: `${total ? (item.value / safe) * 100 : item.label === "Available" ? 100 : 0}%` }}
 title={`${item.label}: ${formatMoney(item.value, currency)}`}
 />
 ))}
 </div>
 </div>
 <div className="mt-4 space-y-2.5">
 {values.map((item) => (
 <div key={item.label} className="flex items-center justify-between gap-3 text-xs">
 <span className="flex items-center gap-2 text-muted-foreground">
 <span className={`h-2.5 w-2.5 rounded-full ${item.className}`} />
 {item.label}
 </span>
 <span className="font-extrabold text-foreground">
 {formatMoney(item.value, currency)}
 </span>
 </div>
 ))}
 </div>
 </div>
 );
}

function PipelineStat({
 label,
 value,
 total,
 href,
}: {
 label: string;
 value: number;
 total: number;
 href: string;
}) {
 const percent = Math.min(100, Math.max(0, (value / total) * 100));
 return (
 <Link
 href={href}
 className="rounded-xl border border-border bg-muted p-4 transition hover:border-primary/25 hover:bg-primary/10/40 dark:border-border dark:bg-card/[0.03]"
 >
 <p className="text-2xl font-bold tracking-[-0.03em]">{number.format(value)}</p>
 <p className="mt-1 text-xs font-semibold text-muted-foreground">{label}</p>
 <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted dark:bg-card/10">
 <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
 </div>
 </Link>
 );
}

function PerformanceBar({
 label,
 value,
 total,
 className,
}: {
 label: string;
 value: number;
 total: number;
 className: string;
}) {
 const percent = Math.min(100, Math.max(0, (value / total) * 100));
 return (
 <div className="mb-4 last:mb-0">
 <div className="flex items-center justify-between gap-4 text-xs">
 <span className="font-semibold text-muted-foreground">{label}</span>
 <span className="font-bold">{number.format(value)}</span>
 </div>
 <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted dark:bg-card/10">
 <div className={`h-full rounded-full ${className}`} style={{ width: `${percent}%` }} />
 </div>
 </div>
 );
}

function WalletStat({
 label,
 value,
 icon: Icon,
 highlight = false,
}: {
 label: string;
 value: string;
 icon: IconSvgElement;
 highlight?: boolean;
}) {
 return (
 <div className={`rounded-xl border p-4 ${highlight ? "border-primary/25 bg-primary/10" : "border-border bg-muted dark:border-border dark:bg-card/[0.03]"}`}>
 <HugeiconsIcon icon={Icon} size={16} className={highlight ? "text-primary" : "text-muted-foreground"} />
 <p className="mt-3 text-xs font-semibold text-muted-foreground">{label}</p>
 <p className="mt-1 text-lg font-bold tracking-[-0.025em]">{value}</p>
 </div>
 );
}

function PerformanceLinkCard({
 href,
 icon: Icon,
 eyebrow,
 value,
 title,
 description,
 alert = false,
}: {
 href: string;
 icon: IconSvgElement;
 eyebrow: string;
 value: string;
 title: string;
 description: string;
 alert?: boolean;
}) {
 return (
 <Link
 href={href}
 className={`rounded-xl border bg-card p-5 shadow-sm transition hover:border-primary/40 dark:bg-card ${
 alert ? "border-yellow-light-2" : "border-border dark:border-border"
 }`}
 >
 <div className="flex items-start justify-between gap-4">
 <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${alert ? "bg-yellow-light-4 text-yellow-dark" : "bg-primary/10 text-primary"}`}>
 <HugeiconsIcon icon={Icon} size={18} />
 </span>
 <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-muted-foreground" />
 </div>
 <p className="mt-4 text-[10px] font-bold uppercase tracking-[.12em] text-muted-foreground">
 {eyebrow}
 </p>
 <p className="mt-1 text-3xl font-bold tracking-[-0.04em]">{value}</p>
 <p className="mt-1 text-sm font-semibold">{title}</p>
 <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
 </Link>
 );
}

function SellerActivationDashboard({
 seller,
 kyc,
 documents,
 profile,
 refreshing,
 refresh,
}: {
 seller: Seller | null;
 kyc: SellerKycStatus | null;
 documents: SellerKycDocument[];
 profile: SellerBusinessProfile | null;
 refreshing: boolean;
 refresh: () => void;
}) {
 const required = kyc?.required_documents ?? [];
 const missing = kyc?.missing_documents ?? [];
 const uploadedCount = Math.max(0, required.length - missing.length);
 const rejectedDocuments = documents.filter(
 (document) => document.status === "rejected",
 );

 const documentProgress = required.length
 ? Math.round((uploadedCount / required.length) * 100)
 : 0;

 const profileComplete = Boolean(
 profile?.business_description &&
 profile?.business_country &&
 profile?.business_city &&
 profile?.business_address,
 );

 const kycReady = required.length > 0 && missing.length === 0;
 const activationChecks = [
 profileComplete,
 required.length > 0,
 kycReady,
 rejectedDocuments.length === 0 && documents.length > 0,
 ];
 const activationProgress = Math.round(
 (activationChecks.filter(Boolean).length / activationChecks.length) * 100,
 );

 const status = seller?.status || kyc?.seller_status || "pending";
 const isUnderReview = status === "under_review";
 const hasRejectedDocs = rejectedDocuments.length > 0;

 return (
 <div
 className="w-full space-y-6"
 style={{
 fontFamily:
 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
 }}
 >
 <section className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm dark:border-border dark:bg-card/85 sm:p-8">
 

 <div className="relative grid gap-8 xl:grid-cols-[1fr_320px] xl:items-center">
 <div>
 <div className="inline-flex items-center gap-2 rounded-full border border-yellow-light-2 bg-yellow-light-4 px-3 py-1.5 text-xs font-semibold text-yellow-dark-2 dark:border-amber-500/30 dark:bg-warning/10 dark:text-amber-200">
 <HugeiconsIcon icon={ShieldCheckIcon} size={14} />
 Seller account · {pretty(status)}
 </div>

 <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
 Activate your seller account
 </h2>

 <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
 Before selling on Xerin Market, complete your business verification.
 Product, inventory, order, store and finance features will unlock
 after your seller account is approved.
 </p>

 <div className="mt-6 flex flex-wrap gap-3">
 <Link
 href="/seller/kyc"
 className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary"
 >
 <HugeiconsIcon icon={ShieldCheckIcon} size={16} />
 Continue KYC
 </Link>

 <Link
 href="/seller/documents"
 className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-[var(--primary)] dark:border-border"
 >
 <HugeiconsIcon icon={FileCorruptIcon} size={16} />
 Business Documents
 </Link>

 <button
 type="button"
 onClick={refresh}
 disabled={refreshing}
 className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-50 dark:border-border dark:hover:bg-card/5"
 >
 {refreshing ? <Spinner /> : <HugeiconsIcon icon={RefreshCwIcon} size={16} />}
 {refreshing ? "Refreshing" : "Refresh status"}
 </button>
 </div>
 </div>

 <div className="rounded-xl border border-border bg-muted/80 p-5 dark:border-border dark:bg-card/[0.04]">
 <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
 Activation progress
 </p>
 <div className="mt-2 flex items-end gap-2">
 <p className="text-4xl font-bold tracking-[-0.04em]">
 {activationProgress}%
 </p>
 <p className="pb-1 text-xs text-muted-foreground">complete</p>
 </div>
 <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted dark:bg-card/10">
 <div
 className="h-full rounded-full bg-primary"
 style={{ width: `${activationProgress}%` }}
 />
 </div>
 <p className="mt-3 text-xs leading-5 text-muted-foreground">
 {isUnderReview
 ? "Your application is being reviewed. Keep your documents up to date while you wait."
 : hasRejectedDocs
 ? "One or more documents need correction before approval."
 : "Complete the remaining steps and submit valid documents for review."}
 </p>
 </div>
 </div>
 </section>

 <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <ActivationMetric
 label="Seller Status"
 value={pretty(status)}
 helper="Marketplace approval"
 icon={ShieldCheckIcon}
 good={status === "under_review"}
 />
 <ActivationMetric
 label="KYC Documents"
 value={`${uploadedCount}/${required.length}`}
 helper={`${documentProgress}% complete`}
 icon={FileCorruptIcon}
 good={kycReady}
 />
 <ActivationMetric
 label="Business Profile"
 value={profileComplete ? "Complete" : "Incomplete"}
 helper="Legal business information"
 icon={Store01Icon}
 good={profileComplete}
 />
 <ActivationMetric
 label="Document Issues"
 value={String(rejectedDocuments.length)}
 helper={
 rejectedDocuments.length
 ? "Requires your attention"
 : "No rejected documents"
 }
 icon={AlertCircleIcon}
 good={rejectedDocuments.length === 0}
 />
 </section>

 <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
 <Card>
 <SectionHeading
 eyebrow="Activation"
 title="Complete these steps"
 description="Only activation and account-management tools are available until approval."
 icon={CheckmarkCircle02Icon}
 />

 <div className="mt-6 space-y-3">
 <ActivationStep
 number={1}
 title="Review account settings"
 description="Confirm your personal and business contact details."
 href="/seller/account"
 complete={Boolean(seller?.business_name)}
 />
 <ActivationStep
 number={2}
 title="Complete KYC verification"
 description="Review verification requirements and your current status."
 href="/seller/kyc"
 complete={kycReady && !hasRejectedDocs}
 />
 <ActivationStep
 number={3}
 title="Upload business documents"
 description="Provide all required legal and business documents."
 href="/seller/documents"
 complete={kycReady}
 />
 <ActivationStep
 number={4}
 title="Wait for approval"
 description="Once your documents are accepted, seller commerce features will unlock automatically."
 href="/seller/kyc"
 complete={status === "approved"}
 waiting={isUnderReview}
 />
 </div>
 </Card>

 <Card>
 <SectionHeading
 eyebrow="What you can access now"
 title="Activation workspace"
 description="These tools remain available while your seller account is pending."
 icon={ShieldCheckIcon}
 />

 <div className="mt-5 grid gap-3 sm:grid-cols-2">
 <QuickAction
 href="/seller/dashboard"
 icon={ChartIncreaseIcon}
 title="Dashboard"
 description="Track activation progress"
 />
 <QuickAction
 href="/seller/kyc"
 icon={ShieldCheckIcon}
 title="KYC Verification"
 description="Review verification status"
 />
 <QuickAction
 href="/seller/documents"
 icon={FileCorruptIcon}
 title="Business Documents"
 description="Upload required files"
 />
 <QuickAction
 href="/seller/account"
 icon={Store01Icon}
 title="Account Settings"
 description="Update account information"
 />
 <QuickAction
 href="/seller/account/security"
 icon={CheckmarkBadge01Icon}
 title="Security"
 description="Password and active sessions"
 />
 <QuickAction
 href="/seller/support"
 icon={AlertCircleIcon}
 title="Help & Support"
 description="Get assistance"
 />
 </div>
 </Card>
 </section>

 {hasRejectedDocs && (
 <section className="rounded-xl border border-red-light-4 bg-red-light-6 p-5 text-red-800 dark:border-red-500/30 dark:bg-destructive/10 dark:text-red-200">
 <div className="flex items-start gap-3">
 <HugeiconsIcon icon={FileCorruptIcon} className="mt-0.5 shrink-0" size={20} />
 <div>
 <p className="font-semibold">Document changes are required</p>
 <p className="mt-1 text-sm opacity-80">
 Review the rejection notes in Business Documents and upload corrected files.
 </p>
 <Link
 href="/seller/documents"
 className="mt-3 inline-flex text-sm font-semibold underline"
 >
 Review documents
 </Link>
 </div>
 </div>
 </section>
 )}
 </div>
 );
}

function ActivationMetric({
 label,
 value,
 helper,
 icon: Icon,
 good,
}: {
 label: string;
 value: string;
 helper: string;
 icon: IconSvgElement;
 good: boolean;
}) {
 return (
 <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-card">
 <div
 className={`flex h-10 w-10 items-center justify-center rounded-xl ${
 good
 ? "bg-green-light-6 text-green-dark dark:bg-success/10"
 : "bg-yellow-light-4 text-yellow-dark dark:bg-warning/10"
 }`}
 >
 <HugeiconsIcon icon={Icon} size={18} />
 </div>
 <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
 <p className="mt-1 text-xl font-bold tracking-[-0.025em]">{value}</p>
 <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
 </div>
 );
}

function ActivationStep({
 number,
 title,
 description,
 href,
 complete,
 waiting = false,
}: {
 number: number;
 title: string;
 description: string;
 href: string;
 complete: boolean;
 waiting?: boolean;
}) {
 return (
 <Link
 href={href}
 className="flex items-center gap-4 rounded-xl border border-border p-4 transition hover:border-[var(--primary)]/50 dark:border-border"
 >
 <span
 className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
 complete
 ? "bg-green-light-6 text-green-dark dark:bg-success/10"
 : waiting
 ? "bg-primary-50 text-primary-600 dark:bg-primary-500/10"
 : "bg-primary/10 text-primary dark:bg-primary/10"
 }`}
 >
 {complete ? <HugeiconsIcon icon={CheckIcon} size={18} /> : waiting ? <HugeiconsIcon icon={Clock01Icon} size={18} /> : number}
 </span>

 <span className="min-w-0 flex-1">
 <span className="block text-sm font-semibold">{title}</span>
 <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
 {description}
 </span>
 </span>

 <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="shrink-0 text-muted-foreground" />
 </Link>
 );
}

function Hero({
 name,
 businessName,
 setupProgress,
 refreshing,
 refresh,
}: {
 name: string;
 businessName: string;
 setupProgress: number;
 refreshing: boolean;
 refresh: () => void;
}) {
 return (
 <section className="relative overflow-hidden rounded-xl border border-border bg-card px-6 py-7 text-foreground shadow-sm sm:px-8 lg:px-9 dark:border-border dark:bg-card/80">
 
 

 <div className="relative flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
 <div className="max-w-2xl">
 <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground dark:border-border /70">
 <HugeiconsIcon icon={SparklesIcon} size={14} className="text-primary" />
 Seller Center
 </div>

 <h2 className="text-2xl font-bold tracking-[-0.025em] sm:text-3xl">
 Welcome back, {name}
 </h2>
 <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base /65">
 {businessName} · Keep your catalog healthy, complete store setup and
 respond quickly to items that need attention.
 </p>

 <div className="mt-6 flex flex-wrap gap-2">
 <Link
 href="/seller/products?create=true"
 className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary"
 >
 <HugeiconsIcon icon={PlusIcon} size={16} />
 Add Product
 </Link>
 <Link
 href="/seller/store"
 className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/70 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-card dark:border-white/15 dark:hover:bg-card/10"
 >
 <HugeiconsIcon icon={Store01Icon} size={16} />
 My Stores
 </Link>
 <button
 onClick={refresh}
 disabled={refreshing}
 className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-card disabled:opacity-60 dark:border-white/15 dark:bg-transparent /80 dark:hover:bg-card/10"
 >
 {refreshing ? <Spinner /> : <HugeiconsIcon icon={RefreshCwIcon} size={16} />}
 {refreshing ? "Refreshing" : "Refresh"}
 </button>
 </div>
 </div>

 <div className="w-full overflow-hidden rounded-xl border border-border bg-card/80 p-5 shadow-sm xl:max-w-[360px] dark:border-border dark:bg-card/[0.06]">
 <div className="flex items-center justify-between gap-4">
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground /45">
 Store readiness
 </p>
 <p className="mt-1 text-sm font-semibold text-accent-foreground /80">
 Seller setup health
 </p>
 </div>
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
 <HugeiconsIcon icon={Store01Icon} size={18} />
 </div>
 </div>

 <div className="mt-5 flex items-center gap-5">
 <div
 className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
 style={{
 background: `conic-gradient(var(--primary) ${setupProgress * 3.6}deg, var(--muted) 0deg)`,
 }}
 >
 <div className="grid h-[82px] w-[82px] place-items-center rounded-full bg-card text-center dark:bg-card">
 <div>
 <p className="text-2xl font-extrabold tracking-[-0.04em]">
 {setupProgress}%
 </p>
 <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
 ready
 </p>
 </div>
 </div>
 </div>

 <div className="min-w-0 flex-1">
 <p className="text-sm font-bold text-foreground">
 {setupProgress === 100 ? "Store fully ready" : "Keep completing setup"}
 </p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground /55">
 Profile, verification, payout setup and your first catalog item.
 </p>
 <div className="mt-3 grid grid-cols-4 gap-1.5">
 {[25, 50, 75, 100].map((step) => (
 <span
 key={step}
 className={`h-2 rounded-full ${
 setupProgress >= step ? "bg-primary" : "bg-muted dark:bg-card/10"
 }`}
 />
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>
 );
}

function MetricCard({
 label,
 value,
 helper,
 icon: Icon,
 tone,
 progress = 0,
 graphLabel,
 info,
}: {
 label: string;
 value: string;
 helper: string;
 icon: IconSvgElement;
 tone: "orange" | "green" | "amber" | "blue" | "red";
 progress?: number;
 graphLabel?: string;
 info?: React.ReactNode;
}) {
 const safeProgress = Math.min(100, Math.max(0, progress));

 const tones = {
 orange: {
 icon: "bg-primary/10 text-primary dark:bg-primary/10",
 bar: "bg-primary",
 soft: "bg-primary/10/70 dark:bg-primary/5",
 text: "text-primary",
 },
 green: {
 icon: "bg-green-light-6 text-green-dark dark:bg-success/10",
 bar: "bg-success",
 soft: "bg-green-light-6/70 dark:bg-success/5",
 text: "text-green-dark",
 },
 amber: {
 icon: "bg-yellow-light-4 text-yellow-dark dark:bg-warning/10",
 bar: "bg-warning",
 soft: "bg-yellow-light-4/70 dark:bg-warning/5",
 text: "text-yellow-dark",
 },
 blue: {
 icon: "bg-primary-50 text-primary-600 dark:bg-primary-500/10",
 bar: "bg-primary-500",
 soft: "bg-primary-50/70 dark:bg-primary-500/5",
 text: "text-primary-600",
 },
 red: {
 icon: "bg-rose-50 text-rose-600 dark:bg-rose-500/10",
 bar: "bg-rose-500",
 soft: "bg-rose-50/70 dark:bg-rose-500/5",
 text: "text-rose-600",
 },
 };

 const visual = tones[tone];

 return (
 <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition duration-200 hover:border-primary/40 dark:border-border dark:bg-card">
 

 <div className="relative">
 <div className="flex items-start justify-between gap-3">
 <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${visual.icon}`}>
 <HugeiconsIcon icon={Icon} size={18} />
 </div>

 <div className="relative grid h-12 w-12 place-items-center rounded-full bg-muted dark:bg-card/10">
 <div
 className="absolute inset-0 rounded-full"
 style={{
 background: `conic-gradient(currentColor ${safeProgress * 3.6}deg, transparent 0deg)`,
 }}
 />
 <div className={`z-[1] grid h-9 w-9 place-items-center rounded-full bg-card text-[9px] font-extrabold dark:bg-card ${visual.text}`}>
 {safeProgress}%
 </div>
 </div>
 </div>

 <p className="mt-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
 {label}
 {info}
 </p>
 <p className="mt-1 text-[27px] font-extrabold tracking-[-0.04em] text-foreground">
 {value}
 </p>

 <div className="mt-4">
 <div className="flex items-center justify-between gap-3 text-[10px]">
 <span className="truncate font-semibold text-muted-foreground">{helper}</span>
 {graphLabel && (
 <span className={`shrink-0 font-bold uppercase tracking-wide ${visual.text}`}>
 {graphLabel}
 </span>
 )}
 </div>
 <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted dark:bg-card/10">
 <div
 className={`h-full rounded-full transition-all duration-500 ${visual.bar}`}
 style={{ width: `${safeProgress}%` }}
 />
 </div>
 </div>
 </div>
 </div>
 );
}
function SectionHeading({
 eyebrow,
 title,
 description,
 icon: Icon,
}: {
 eyebrow: string;
 title: string;
 description: string;
 icon: IconSvgElement;
}) {
 return (
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
 {eyebrow}
 </p>
 <h3 className="mt-1 text-lg font-bold tracking-[-0.02em] text-foreground">
 {title}
 </h3>
 <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
 {description}
 </p>
 </div>
 <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground sm:flex">
 <HugeiconsIcon icon={Icon} size={18} />
 </div>
 </div>
 );
}

function StatusBar({
 label,
 value,
 total,
 className,
}: {
 label: string;
 value: number;
 total: number;
 className: string;
}) {
 const percent = Math.round((value / total) * 100);

 return (
 <div>
 <div className="mb-2 flex items-center justify-between text-sm">
 <span className="font-medium text-foreground dark:text-foreground">
 {label}
 </span>
 <span className="font-semibold text-foreground">
 {value} <span className="font-normal text-muted-foreground">({percent}%)</span>
 </span>
 </div>
 <div className="h-2.5 overflow-hidden rounded-full bg-muted dark:bg-card/10">
 <div
 className={`h-full rounded-full transition-all ${className}`}
 style={{ width: `${percent}%` }}
 />
 </div>
 </div>
 );
}

function DonutSummary({
 value,
 total,
 label,
}: {
 value: number;
 total: number;
 label: string;
}) {
 const percent = total ? Math.round((value / total) * 100) : 0;

 return (
 <div className="flex flex-col items-center justify-center rounded-xl bg-muted p-5 text-center dark:bg-card/[0.04]">
 <div
 className="grid h-32 w-32 place-items-center rounded-full"
 style={{
 background: `conic-gradient(var(--primary) ${percent * 3.6}deg, var(--muted) 0deg)`,
 }}
 >
 <div className="grid h-24 w-24 place-items-center rounded-full bg-card dark:bg-card">
 <div>
 <p className="text-2xl font-bold tracking-[-0.03em]">{percent}%</p>
 <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
 approved
 </p>
 </div>
 </div>
 </div>
 <p className="mt-4 text-sm font-semibold">{label}</p>
 <p className="mt-1 text-xs text-muted-foreground">
 {value} of {total} products
 </p>
 </div>
 );
}

function InventoryHealth({
 healthy,
 low,
 out,
 total,
}: {
 healthy: number;
 low: number;
 out: number;
 total: number;
}) {
 const rows = [
 { label: "Healthy stock", value: healthy, color: "bg-success" },
 { label: "Low stock", value: low, color: "bg-warning" },
 { label: "Out of stock", value: out, color: "bg-rose-500" },
 ];

 return (
 <Card>
 <SectionHeading
 eyebrow="Inventory"
 title="Stock health"
 description="Inventory status from your connected seller stock records."
 icon={WarehouseIcon}
 />

 {total ? (
 <div className="mt-6 space-y-4">
 {rows.map((row) => {
 const percent = Math.round((row.value / total) * 100);
 return (
 <div
 key={row.label}
 className="rounded-xl border border-border p-4 dark:border-border"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <span className={`h-2.5 w-2.5 rounded-full ${row.color}`} />
 <span className="text-sm font-medium">{row.label}</span>
 </div>
 <span className="text-sm font-bold">{row.value}</span>
 </div>
 <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted dark:bg-card/10">
 <div
 className={`h-full rounded-full ${row.color}`}
 style={{ width: `${percent}%` }}
 />
 </div>
 </div>
 );
 })}

 <Link
 href="/seller/inventory"
 className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
 >
 Manage inventory <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
 </Link>
 </div>
 ) : (
 <EmptyFutureState
 icon={WarehouseIcon}
 title="No inventory records yet"
 text="Add products and stock records to see live inventory health."
 />
 )}
 </Card>
 );
}

function Verification({
 documents,
 required,
 missing,
 accountStatus,
 kycLabel,
}: {
 documents: SellerKycDocument[];
 required: string[];
 missing: string[];
 accountStatus: string;
 kycLabel: string;
}) {
 const progress = required.length
 ? Math.round(((required.length - missing.length) / required.length) * 100)
 : null;

 return (
 <Card>
 <SectionHeading
 eyebrow="Compliance"
 title="KYC verification"
 description="Complete your business verification to unlock full seller operations."
 icon={ShieldCheckIcon}
 />

 <div className="mt-5 flex items-center justify-between rounded-xl bg-muted p-4 dark:bg-card/[0.04]">
 <div>
 <p className="text-xs text-muted-foreground">Verification status</p>
 <p className="mt-1 font-semibold">{kycLabel}</p>
 </div>
 <Status label={pretty(accountStatus)} />
 </div>

 {progress !== null && (
 <>
 <div className="mt-5 flex justify-between text-sm">
 <span className="text-muted-foreground">
 {required.length - missing.length} of {required.length} documents
 </span>
 <b>{progress}%</b>
 </div>
 <div className="mt-2 h-2 rounded-full bg-muted dark:bg-card/10">
 <div
 className="h-2 rounded-full bg-primary"
 style={{ width: `${progress}%` }}
 />
 </div>
 </>
 )}

 <div className="mt-5 grid gap-2">
 {required.map((type) => {
 const document = documents.find((item) => item.document_type === type);

 return (
 <div
 key={type}
 className="flex items-center gap-3 rounded-xl border border-border p-3 dark:border-border"
 >
 <span
 className={`flex h-8 w-8 items-center justify-center rounded-lg ${
 document
 ? "bg-green-light-6 text-green-dark dark:bg-success/10"
 : "bg-muted text-muted-foreground "
 }`}
 >
 {document ? <HugeiconsIcon icon={CheckIcon} size={16} /> : <HugeiconsIcon icon={CircleDashedIcon} size={16} />}
 </span>

 <div className="min-w-0 flex-1">
 <p className="text-sm font-semibold">
 {documentNames[type] ?? pretty(type)}
 </p>
 <p className="text-xs text-muted-foreground">
 {document ? pretty(document.status || "uploaded") : "Missing"}
 </p>
 </div>

 {(document?.document_url || document?.file_url) && (
 <a
 href={document.document_url || document.file_url}
 target="_blank"
 rel="noreferrer"
 className="text-xs font-semibold text-primary"
 >
 View
 </a>
 )}
 </div>
 );
 })}
 </div>

 <Link
 href="/seller/kyc"
 className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
 >
 {missing.length ? "Complete verification" : "Review documents"}
 <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
 </Link>
 </Card>
 );
}

function StoreReadiness({
 progress,
 profileReady,
 kycReady,
 payoutReady,
 productReady,
}: {
 progress: number;
 profileReady: boolean;
 kycReady: boolean;
 payoutReady: boolean;
 productReady: boolean;
}) {
 const items = [
 {
 label: "Business profile",
 description: "Store description and location",
 complete: profileReady,
 href: "/seller/store",
 },
 {
 label: "KYC documents",
 description: "Required business verification",
 complete: kycReady,
 href: "/seller/kyc",
 },
 {
 label: "Payout account",
 description: "Settlement destination",
 complete: payoutReady,
 href: "/seller/kyc?tab=payouts",
 },
 {
 label: "Catalog started",
 description: "At least one seller product",
 complete: productReady,
 href: "/seller/products?create=true",
 },
 ];

 return (
 <Card>
 <SectionHeading
 eyebrow="Onboarding"
 title="Store readiness"
 description="A practical setup checklist calculated from data already available in your seller account."
 icon={Store01Icon}
 />

 <div className="mt-5 overflow-hidden rounded-xl bg-carbon p-5 text-white">
 <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
 <div
 className="relative grid h-32 w-32 shrink-0 place-items-center rounded-full"
 style={{
 background: `conic-gradient(var(--primary) ${progress * 3.6}deg, rgba(255,255,255,.10) 0deg)`,
 }}
 >
 <div className="grid h-[94px] w-[94px] place-items-center rounded-full bg-card text-center">
 <div>
 <p className="text-3xl font-extrabold tracking-[-0.05em]">{progress}%</p>
 <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/45">
 complete
 </p>
 </div>
 </div>
 </div>

 <div className="min-w-0 flex-1">
 <p className="text-lg font-bold">
 {progress === 100 ? "Your selling setup is complete" : "Finish your seller setup"}
 </p>
 <p className="mt-1 text-xs leading-5 text-white/55">
 Complete all four checkpoints to keep your store ready for selling and settlement.
 </p>

 <div className="mt-4 grid grid-cols-2 gap-2">
 {items.map((item) => (
 <div
 key={`readiness-${item.label}`}
 className={`rounded-xl border px-3 py-2 ${
 item.complete
 ? "border-emerald-400/20 bg-emerald-400/10"
 : "border-white/10 bg-card/5"
 }`}
 >
 <div className="flex items-center gap-2">
 <span
 className={`grid h-5 w-5 place-items-center rounded-full ${
 item.complete
 ? "bg-emerald-400 text-[var(--success)]"
 : "bg-card/10 text-white/50"
 }`}
 >
 {item.complete ? <HugeiconsIcon icon={CheckIcon} size={12} /> : <HugeiconsIcon icon={CircleDashedIcon} size={12} />}
 </span>
 <span className="truncate text-[10px] font-semibold text-white/75">
 {item.label}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 <div className="mt-4 space-y-2">
 {items.map((item) => (
 <Link
 key={item.label}
 href={item.href}
 className="flex items-center gap-3 rounded-xl border border-border p-3 transition hover:border-[var(--primary)]/50 dark:border-border"
 >
 <span
 className={`flex h-8 w-8 items-center justify-center rounded-lg ${
 item.complete
 ? "bg-green-light-6 text-green-dark dark:bg-success/10"
 : "bg-muted text-muted-foreground "
 }`}
 >
 {item.complete ? <HugeiconsIcon icon={CheckIcon} size={16} /> : <HugeiconsIcon icon={CircleDashedIcon} size={16} />}
 </span>
 <div className="min-w-0 flex-1">
 <p className="text-sm font-semibold">{item.label}</p>
 <p className="text-xs text-muted-foreground">{item.description}</p>
 </div>
 <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="text-muted-foreground" />
 </Link>
 ))}
 </div>
 </Card>
 );
}

function NextActions({
 actions,
}: {
 actions: Array<{
 priority: string;
 title: string;
 description: string;
 href: string;
 }>;
}) {
 return (
 <Card>
 <SectionHeading
 eyebrow="Priorities"
 title="Next actions"
 description="The most important items that currently need your attention."
 icon={AlertCircleIcon}
 />

 <div className="mt-5 space-y-2">
 {actions.length ? (
 actions.slice(0, 5).map((action) => (
 <Link
 key={`${action.title}-${action.href}`}
 href={action.href}
 className="flex items-center gap-3 rounded-xl border border-border p-3.5 transition hover:border-[var(--primary)]/60 hover:bg-primary/10/30 dark:border-border dark:hover:bg-card/[0.03]"
 >
 <span
 className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
 action.priority === "High"
 ? "bg-red-light-6 text-red-dark"
 : "bg-yellow-light-4 text-yellow-dark-2"
 }`}
 >
 {action.priority}
 </span>
 <span className="min-w-0 flex-1">
 <b className="block truncate text-sm">{action.title}</b>
 <small className="block truncate text-muted-foreground">
 {action.description}
 </small>
 </span>
 <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
 </Link>
 ))
 ) : (
 <div className="rounded-xl bg-green-light-6 p-6 text-center text-green-dark dark:bg-success/10 dark:text-emerald-300">
 <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mx-auto" />
 <p className="mt-2 font-semibold">You are all caught up.</p>
 <p className="mt-1 text-xs opacity-75">
 There are no urgent setup actions right now.
 </p>
 </div>
 )}
 </div>
 </Card>
 );
}

function QuickAction({
 href,
 icon: Icon,
 title,
 description,
}: {
 href: string;
 icon: IconSvgElement;
 title: string;
 description: string;
}) {
 return (
 <Link
 href={href}
 className="group rounded-xl border border-border p-4 transition hover:border-[var(--primary)]/50 hover:bg-primary/10/30 dark:border-border dark:hover:bg-card/[0.03]"
 >
 <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
 <HugeiconsIcon icon={Icon} size={16} />
 </div>
 <p className="mt-3 text-sm font-semibold">{title}</p>
 <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
 </Link>
 );
}

function RecentProducts({
 products,
 inventory,
}: {
 products: Product[];
 inventory: SellerInventoryItem[];
}) {
 const stockByProduct = useMemo(() => {
 const result = new Map<string, number>();
 for (const row of inventory) {
 result.set(
 row.product_id,
 (result.get(row.product_id) || 0) + (row.available_quantity || 0),
 );
 }
 return result;
 }, [inventory]);

 return (
 <Card flush>
 <div className="flex items-center justify-between border-b border-border p-5 sm:p-6 dark:border-border">
 <div>
 <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
 Catalog
 </p>
 <h3 className="mt-1 text-lg font-bold tracking-[-0.02em]">
 Recent products
 </h3>
 <p className="mt-1 text-sm text-muted-foreground">
 Latest seller products, stock and moderation status.
 </p>
 </div>
 <Link
 href="/seller/products"
 className="text-sm font-semibold text-primary"
 >
 View all
 </Link>
 </div>

 {products.length ? (
 <div className="overflow-x-auto">
 <table className="w-full min-w-[850px] text-left text-sm">
 <thead className="bg-muted/80 text-[11px] uppercase tracking-wider text-muted-foreground dark:bg-card/[0.03]">
 <tr>
 {["Product", "SKU", "Price", "Stock", "Approval", "Created", "Action"].map(
 (heading) => (
 <th key={heading} className="px-5 py-3.5 font-semibold">
 {heading}
 </th>
 ),
 )}
 </tr>
 </thead>
 <tbody className="divide-y divide-[var(--border)] dark:divide-white/10">
 {products.slice(0, 6).map((product) => {
 const stock = stockByProduct.get(String(product.id));

 return (
 <tr
 key={product.id}
 className="transition hover:bg-muted/60 dark:hover:bg-card/[0.02]"
 >
 <td className="px-5 py-4">
 <div className="flex items-center gap-3">
 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground dark:bg-card/10">
 <HugeiconsIcon icon={Image01Icon} size={18} />
 </span>
 <b className="max-w-[260px] truncate">{product.name}</b>
 </div>
 </td>
 <td className="px-5 py-4 text-muted-foreground">{product.sku}</td>
 <td className="px-5 py-4 font-medium">
 {product.currency} {product.price}
 </td>
 <td className="px-5 py-4">
 {stock === undefined ? (
 <span className="text-muted-foreground">—</span>
 ) : (
 <span
 className={
 stock <= 0
 ? "font-semibold text-rose-600"
 : stock <= 5
 ? "font-semibold text-yellow-dark"
 : "font-semibold text-green-dark"
 }
 >
 {stock}
 </span>
 )}
 </td>
 <td className="px-5 py-4">
 <Status label={pretty(product.status || "draft")} />
 </td>
 <td className="px-5 py-4 text-muted-foreground">
 {new Date(product.created_at).toLocaleDateString()}
 </td>
 <td className="px-5 py-4">
 <Link
 href={`/seller/products?product=${product.id}`}
 className="font-semibold text-primary"
 >
 View / Edit
 </Link>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 ) : (
 <div className="p-12 text-center">
 <HugeiconsIcon icon={ShoppingBag01Icon} className="mx-auto text-muted-foreground" size={32} />
 <h4 className="mt-3 font-semibold">No products yet</h4>
 <p className="mt-1 text-sm text-muted-foreground">
 Add your first product to start building your storefront.
 </p>
 <Link
 href="/seller/products?create=true"
 className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
 >
 <HugeiconsIcon icon={PlusIcon} size={16} />
 Add Product
 </Link>
 </div>
 )}
 </Card>
 );
}

function EmptyFutureState({
 icon: Icon,
 title,
 text,
}: {
 icon: IconSvgElement;
 title: string;
 text: string;
}) {
 return (
 <div className="mt-5 rounded-xl border border-dashed border-border bg-muted/60 p-7 text-center dark:border-border dark:bg-card/[0.02]">
 <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-sm">
 <HugeiconsIcon icon={Icon} size={20} />
 </div>
 <p className="mt-3 text-sm font-semibold">{title}</p>
 <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-muted-foreground">
 {text}
 </p>
 </div>
 );
}

function MiniStat({ label, value }: { label: string; value: string }) {
 return (
 <div className="rounded-xl bg-muted p-4 dark:bg-card/[0.04]">
 <p className="text-xs text-muted-foreground">{label}</p>
 <p className="mt-1 text-lg font-bold">{value}</p>
 </div>
 );
}

function Card({
 children,
 flush = false,
}: {
 children: React.ReactNode;
 flush?: boolean;
}) {
 return (
 <section
 className={`overflow-hidden rounded-xl border border-border bg-card shadow-sm dark:border-border dark:bg-card ${
 flush ? "" : "p-5 sm:p-6"
 }`}
 >
 {children}
 </section>
 );
}

function Status({ label }: { label: string }) {
 const value = label.toLowerCase();
 const tone =
 value.includes("approved") || value.includes("complete")
 ? "bg-green-light-6 text-green-dark dark:bg-success/10 dark:text-emerald-300"
 : value.includes("reject") || value.includes("changes")
 ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
 : "bg-yellow-light-4 text-yellow-dark-2 dark:bg-warning/10 dark:text-amber-300";

 return (
 <span
 className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}
 >
 {label}
 </span>
 );
}

function DashboardSkeleton() {
 return (
 <div className="w-full animate-pulse space-y-5">
 <div className="h-52 rounded-xl bg-muted dark:bg-card/10" />
 <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
 {Array.from({ length: 5 }).map((_, index) => (
 <div
 key={index}
 className="h-36 rounded-xl bg-muted dark:bg-card/10"
 />
 ))}
 </div>
 <div className="grid gap-5 xl:grid-cols-2">
 <div className="h-96 rounded-xl bg-muted dark:bg-card/10" />
 <div className="h-96 rounded-xl bg-muted dark:bg-card/10" />
 </div>
 </div>
 );
}

function ErrorState({
 message,
 retry,
}: {
 message: string;
 retry: () => void;
}) {
 return (
 <div className="mx-auto max-w-xl rounded-xl border border-red-light-4 bg-card p-8 text-center shadow-sm dark:border-red-500/30 dark:bg-card">
 <HugeiconsIcon icon={AlertCircleIcon} className="mx-auto text-destructive" size={32} />
 <h2 className="mt-3 text-xl font-semibold">Unable to load seller dashboard</h2>
 <p className="mt-2 text-sm text-muted-foreground">{message}</p>
 <button
 onClick={retry}
 className="mt-5 inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background"
 >
 <HugeiconsIcon icon={RefreshCwIcon} size={16} />
 Try again
 </button>
 </div>
 );
}
