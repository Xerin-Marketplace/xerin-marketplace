"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/links";
import CustomSelect from "./CustomSelect";
import Dropdown from "./Dropdown";
import CategoryMegaMenu from "./CategoryMegaMenu";
import { menuData } from "./menuData";
import { useCartView } from "@/hooks/useCartActions";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { getAccountHref, getAccountLabel } from "@/guards/auth-routing";
import Image from "next/image";
import CurrencySelector from "./CurrencySelector";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useCategories, useProducts } from "@/hooks/useProducts";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/endpoints/users";
import { useLanguage } from "@/app/context/LanguageContext";
import LanguageSwitcher from "@/components/Common/LanguageSwitcher";
import MobileStorefrontHeader from "./MobileStorefrontHeader";
import SearchSuggestions, { saveRecentSearch } from "./SearchSuggestions";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Sun03Icon, Moon02Icon, UserIcon, ShoppingCart01Icon, Menu01Icon, HistoryIcon, FavouriteIcon } from "@hugeicons/core-free-icons";

const Header = () => {
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedCategoryId, setSelectedCategoryId] = useState("0");
 const [suggestionsOpen, setSuggestionsOpen] = useState(false);
 const searchAnchorRef = React.useRef<HTMLDivElement>(null);
 const [navigationOpen, setNavigationOpen] = useState(false);
 const [categoryMegaMenuOpen, setCategoryMegaMenuOpen] = useState(false);
 const [stickyMenu, setStickyMenu] = useState(false);
 const router = useRouter();
 const { openCartModal } = useCartModalContext();
 const { theme, toggleTheme } = useTheme();
 const { user: sessionUser, isAuthenticated, logout } = useAuth();
 const hasHydrated = useAuthStore((state) => state.hasHydrated);

 // Fresh profile (avatar_url etc.) — the stored session only updates on login.
 const { data: freshUser } = useQuery({
 queryKey: ["me"],
 queryFn: usersApi.getMe,
 enabled: hasHydrated && isAuthenticated,
 staleTime: 60_000,
 retry: false,
 });
 const user = { ...sessionUser, ...freshUser } as typeof sessionUser;
 const { t } = useLanguage();
 const navTitle = (title: string) => {
 if (title === "Home") return t("nav_home");
 if (title === "Shop") return t("nav_shop");
 if (title === "Categories") return t("nav_categories");
 return title;
 };

 const { items: cartItems } = useCartView();

 // Product categories are loaded from the public backend endpoint:
 // GET /api/v1/products/categories
 // Admin-created product categories use the same `categories` table, so the
 // header automatically reflects categories created or removed by an admin.
 const { data: categories = [] } = useCategories();

 // Keep only the permanent navigation entries (Home + Shop + Logistics).
 // The old static "Categories" item is replaced by the live categories returned by the API.
 const primaryMenuItems = menuData.filter(
 (menuItem) => menuItem.title !== "Categories",
 );

 const accountHref = getAccountHref(isAuthenticated, user);
 const accountLabel = getAccountLabel(isAuthenticated, user);
 const buyerName = [user?.first_name, user?.last_name].filter(Boolean).join(" ");
 const avatarSrc = (url?: string | null) => {
 if (!url) return null;
 if (url.startsWith("/uploads/")) return url.replace(/^\/uploads\//, "/backend-uploads/");
 return url;
 };

 const handleOpenCartModal = () => {
 openCartModal();
 };

 // Sticky menu
 const handleStickyMenu = () => {
 if (window.scrollY >= 80) {
 setStickyMenu(true);
 } else {
 setStickyMenu(false);
 }
 };

 useEffect(() => {
 window.addEventListener("scroll", handleStickyMenu);
 return () => window.removeEventListener("scroll", handleStickyMenu);
 }, []);

 // Search dropdown: always show every product category registered by admin.
 const options = [
 { label: "All Categories", value: "0" },
 ...categories.map((category) => ({
 label: category.name,
 value: String(category.id),
 })),
 ];

 return (
 <header
 className={`fixed left-0 top-0 w-full z-9999 bg-card transition-all ease-in-out duration-300 ${
 stickyMenu && "shadow"
 }`}
 >
 <MobileStorefrontHeader
 onToggleCategories={() => setCategoryMegaMenuOpen(!categoryMegaMenuOpen)}
 onToggleMenu={() => setNavigationOpen(!navigationOpen)}
 isMenuOpen={navigationOpen}
 isCategoriesOpen={categoryMegaMenuOpen}
 isAuthenticated={isAuthenticated}
 accountHref={accountHref}
 accountLabel={accountLabel}
 cartCount={cartItems.length}
 onOpenCart={handleOpenCartModal}
 user={user}
 />
 <div className="hidden lg:block max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-6">
 {/* <!-- header top start --> */}
 <div
 className={`flex flex-col lg:flex-row gap-3 lg:gap-5 items-stretch lg:items-center xl:justify-between ease-out duration-200 ${
 stickyMenu ? "py-2" : "py-2.5"
 }`}
 >
 {/* <!-- header top left --> */}
 <div className="xl:w-auto flex w-full justify-between items-center gap-4 lg:gap-10">
 <Link className="flex-shrink-0 flex items-center" href="/">
 <Image
 src="/images/logo/logooriginal.png"
 alt="Xerin Mart logo"
 width={340}
 height={108}
 className="object-contain"
 style={{ width: "170px", height: "auto" }}
 priority
 />
 </Link>

 {/* <!-- Desktop Search --> */}
 <div className="hidden lg:block max-w-[475px] xl:max-w-[475px] w-full">
 <form
 onSubmit={(event) => {
 event.preventDefault();
 const query = searchQuery.trim();
 const searchParams = new URLSearchParams();
 if (query) searchParams.set("q", query);
 if (selectedCategoryId !== "0") {
 searchParams.set("category_id", selectedCategoryId);
 }
 if (query) saveRecentSearch(query);
 if (searchParams.size) {
 router.push(`/search?${searchParams.toString()}`);
 }
 setSuggestionsOpen(false);
 }}
 >
 <div className="flex items-center rounded-lg border border-border bg-muted/60 transition-colors focus-within:border-primary dark:focus-within:border-primary">
 <CustomSelect
 options={options}
 onChange={(option) => setSelectedCategoryId(option.value)}
 />

 <div ref={searchAnchorRef} className="relative flex-1 min-w-[220px] xl:min-w-[280px]">
 {/* <!-- divider --> */}
 <span className="absolute left-0 top-1/2 -translate-y-1/2 inline-block w-px h-5 bg-gray-3"></span>
 <input
 onChange={(e) => {
 setSearchQuery(e.target.value);
 setSuggestionsOpen(true);
 }}
 onFocus={() => setSuggestionsOpen(true)}
 value={searchQuery}
 type="search"
 name="search"
 id="search"
 aria-label="Search products"
 role="combobox"
 placeholder={t("search_placeholder")}
 autoComplete="off"
 aria-expanded={suggestionsOpen}
 aria-haspopup="listbox"
 className="w-full rounded-r-[10px] bg-transparent !border-l-0 border-0 py-2.5 pl-4 pr-10 text-custom-sm text-foreground outline-none ease-in duration-200 placeholder:text-muted-foreground/60 dark:placeholder:text-white/40"
 />
 {suggestionsOpen && (
 <SearchSuggestions
 query={searchQuery}
 anchorRef={searchAnchorRef}
 onClose={() => setSuggestionsOpen(false)}
 onPick={(term) => {
 setSearchQuery(term);
 saveRecentSearch(term);
 setSuggestionsOpen(false);
 const params = new URLSearchParams({ q: term });
 if (selectedCategoryId !== "0") params.set("category_id", selectedCategoryId);
 router.push(`/search?${params.toString()}`);
 }}
 />
 )}

 <button
 id="search-btn"
 aria-label="Search"
 className="flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 ease-in duration-200 hover:text-primary"
 >
 <HugeiconsIcon icon={Search01Icon} size={18} />
 </button>
 </div>
 </div>
 </form>
 </div>
 </div>

 {/* <!-- header top right --> */}
 <div className="flex w-full lg:w-auto items-center gap-7.5">
 {/* <!-- divider --> */}
 <span className="hidden xl:block w-px h-7.5 bg-gray-4"></span>

 <div className="flex w-full lg:w-auto justify-end items-center gap-4 sm:gap-5">
 <div className="flex items-center gap-4 sm:gap-5">
 <div className="hidden lg:block">
 <CurrencySelector />
 </div>

 <button
 onClick={toggleTheme}
 aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
 className="flex items-center justify-center p-2 rounded-full hover:bg-muted transition-colors"
 >
 {theme === "dark" ? (
 <HugeiconsIcon icon={Sun03Icon} size={20} />
 ) : (
 <HugeiconsIcon icon={Moon02Icon} size={20} />
 )}
 </button>
 <div className="group relative">
 <Link href={accountHref} className="flex items-center gap-2.5">
 {hasHydrated && isAuthenticated && avatarSrc(user?.avatar_url) ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={avatarSrc(user?.avatar_url)!}
 alt=""
 className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/30"
 />
 ) : hasHydrated && isAuthenticated && buyerName ? (
 <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-black text-primary-foreground">
 {buyerName[0].toUpperCase()}
 </span>
 ) : (
 <HugeiconsIcon icon={UserIcon} size={24} className="text-primary" />
 )}

 <div>
 <span className="block text-2xs text-muted-foreground uppercase">
 {hasHydrated && isAuthenticated ? t("header_my_xerin") : t("header_account")}
 </span>
 <p className="font-medium text-custom-sm text-foreground">
 {!hasHydrated ? "Loading..." : buyerName || accountLabel}
 </p>
 </div>
 </Link>
 {hasHydrated && isAuthenticated && user?.account_type === "customer" && <div className="invisible absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-border bg-card p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">{[[t("header_orders"),"/account/orders"],[t("header_addresses"),"/account/addresses"],[t("header_payments"),"/account/payments"],[t("header_wishlist"),"/wishlist"],[t("header_security"),"/account/security"]].map(([label,href])=><Link key={href} href={href} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted dark:hover:bg-card/5">{label}</Link>)}<button onClick={()=>void logout()} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-red-light-6">{t("header_signout")}</button></div>}
 </div>

 <button
 onClick={handleOpenCartModal}
 aria-label={`Cart, ${cartItems.length} items`}
 className="flex items-center gap-1.5"
 >
 <span className="inline-block relative">
 <HugeiconsIcon icon={ShoppingCart01Icon} size={20} className="text-[var(--primary)]" />

 <span className="flex items-center justify-center font-medium text-2xs absolute -right-2 -top-2.5 bg-blue w-4.5 h-4.5 rounded-full text-white">
 {cartItems.length}
 </span>
 </span>
 </button>
 </div>

 {/* <!-- Hamburger Toggle BTN --> */}
 <button
 id="Toggle"
 aria-label="Toggle navigation menu"
 aria-expanded={navigationOpen}
 className="xl:hidden flex items-center justify-center p-1.5 rounded-lg hover:bg-muted dark:hover:bg-card/5 transition-colors"
 onClick={() => setNavigationOpen(!navigationOpen)}
 >
 <span className="block relative cursor-pointer w-5.5 h-5.5">
 <span className="du-block absolute right-0 w-full h-full">
 <span
 className={`block relative top-0 left-0 bg-carbon rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-[0] ${
 !navigationOpen && "!w-full delay-300"
 }`}
 ></span>
 <span
 className={`block relative top-0 left-0 bg-carbon rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-150 ${
 !navigationOpen && "!w-full delay-400"
 }`}
 ></span>
 <span
 className={`block relative top-0 left-0 bg-carbon rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-200 ${
 !navigationOpen && "!w-full delay-500"
 }`}
 ></span>
 </span>

 <span className="block absolute right-0 w-full h-full rotate-45">
 <span
 className={`block bg-carbon rounded-sm ease-in-out duration-200 delay-300 absolute left-2.5 top-0 w-0.5 h-full ${
 !navigationOpen && "!h-0 delay-[0] "
 }`}
 ></span>
 <span
 className={`block bg-carbon rounded-sm ease-in-out duration-200 delay-400 absolute left-0 top-2.5 w-full h-0.5 ${
 !navigationOpen && "!h-0 dealy-200"
 }`}
 ></span>
 </span>
 </span>
 </button>
 {/* // <!-- Hamburger Toggle BTN --> */}
 </div>
 </div>
 </div>
 {/* <!-- header top end --> */}
 </div>

 <div className="relative border-t border-border hidden xl:block">
 <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-6">
 <div className="flex items-center justify-between">
 {/* <!--=== Main Nav Start ===--> */}
 <div
 className={`xl:static xl:w-auto xl:h-auto xl:flex items-center justify-between`}
 >
 {/* <!-- Main Nav Start --> */}
 <nav>
 <ul className="flex xl:items-center flex-col xl:flex-row gap-5 xl:gap-6">
 <>
 {/* All Categories Toggle (Alibaba Mega Menu trigger) */}
 <li className="hidden xl:flex items-center">
 <button
 onClick={() => setCategoryMegaMenuOpen(!categoryMegaMenuOpen)}
 className={`flex items-center gap-2 px-3 py-3 text-custom-sm font-semibold transition-colors border-b-2 ${
 categoryMegaMenuOpen
 ? "border-dark text-foreground dark:border-white "
 : "border-transparent text-foreground hover:text-primary dark:hover:text-white"
 }`}
 >
 <HugeiconsIcon icon={Menu01Icon} size={18} />
 <span>{t("nav_all_categories")}</span>
 </button>
 </li>

 {/* Permanent navigation: Home + Shop + Logistics */}
 {primaryMenuItems.map((menuItem) =>
 menuItem.submenu && menuItem.submenu.length > 0 ? (
 <Dropdown key={menuItem.id} menuItem={menuItem} stickyMenu={stickyMenu} />
 ) : (
 <li
 key={menuItem.id}
 className="group relative before:w-0 before:h-[3px] before:bg-blue before:absolute before:left-0 before:top-0 before:rounded-b-[3px] before:ease-out before:duration-200 hover:before:w-full"
 >
 <Link
 href={menuItem.path}
 className={`hover:text-primary text-custom-sm font-medium text-foreground flex ${
 stickyMenu ? "xl:py-3" : "xl:py-3.5"
 }`}
 >
 {navTitle(menuItem.title)}
 </Link>
 </li>
 )
 )}
 </>
 </ul>
 </nav>
 {/* // <!-- Main Nav End --> */}
 </div>
 {/* // <!--=== Main Nav End ===--> */}

 {/* // <!--=== Nav Right Start ===--> */}
 <div className="hidden xl:block">
 <ul className="flex items-center gap-5.5">
 <li className="py-3">
 <a
 href={ROUTES.shop}
 className="flex items-center gap-1.5 font-medium text-custom-sm text-foreground hover:text-primary"
 >
 <HugeiconsIcon icon={HistoryIcon} size={16} />
 {t("nav_shop")}
 </a>
 </li>

 <li className="py-3">
 <Link
 href="/wishlist"
 className="flex items-center gap-1.5 font-medium text-custom-sm text-foreground hover:text-primary"
 >
 <HugeiconsIcon icon={FavouriteIcon} size={16} />
 {t("header_wishlist")}
 </Link>
 </li>

 <li className="py-3">
 <LanguageSwitcher compact />
 </li>
 </ul>
 </div>
 {/* <!--=== Nav Right End ===--> */}
 </div>
 </div>
 </div>

 {/* <!-- Mobile Navigation Drawer --> */}
 {navigationOpen && (
 <div className="block xl:hidden border-t border-border bg-card shadow-lg max-h-[80vh] overflow-y-auto">
 <div className="max-w-[1440px] mx-auto px-4 sm:px-7.5 py-4">
 {/* Account / Sign In section */}
 <div className="mb-3 pb-3 border-b border-border">
 {hasHydrated && isAuthenticated ? (
 <div className="flex flex-col gap-2">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange font-bold text-sm text-white">
 {buyerName ? buyerName.charAt(0).toUpperCase() : "U"}
 </div>
 <div className="min-w-0 flex-1">
 <p className="truncate font-semibold text-sm text-foreground">
 {buyerName || user?.email || t("header_account")}
 </p>
 <p className="truncate text-xs text-muted-foreground">
 {user?.email || accountLabel}
 </p>
 </div>
 </div>
 <div className="mt-1 grid grid-cols-2 gap-2">
 <Link
 href={accountHref}
 onClick={() => setNavigationOpen(false)}
 className="rounded-md bg-muted px-3 py-2 text-center text-xs font-semibold text-foreground transition hover:bg-muted dark:bg-muted"
 >
 {t("common_dashboard")}
 </Link>
 <button
 type="button"
 onClick={() => {
 setNavigationOpen(false);
 void logout();
 }}
 className="rounded-md bg-red-light-6 px-3 py-2 text-center text-xs font-semibold text-destructive transition hover:bg-red-light-5 dark:bg-red-950/30 dark:text-red-400"
 >
 {t("header_signout")}
 </button>
 </div>
 </div>
 ) : (
 <Link
 href={accountHref}
 onClick={() => setNavigationOpen(false)}
 className="flex items-center justify-center gap-2 rounded-lg bg-orange py-2.5 text-center text-xs font-bold text-white shadow-sm transition hover:bg-primary/90"
 >
 <HugeiconsIcon icon={UserIcon} size={16} />
 <span>{t("header_signin")} / {t("auth_register")}</span>
 </Link>
 )}
 </div>

 <nav>
 <ul className="flex flex-col gap-1">
 {primaryMenuItems.map((menuItem) => (
 <li key={menuItem.id}>
 {menuItem.submenu && menuItem.submenu.length > 0 ? (
 <div className="flex flex-col">
 <span className="px-3 py-2 text-custom-sm font-semibold text-foreground">
 {menuItem.title}
 </span>
 {menuItem.submenu.map((sub) => (
 <Link
 key={sub.id}
 href={sub.path}
 onClick={() => setNavigationOpen(false)}
 className="block py-2 pl-6 pr-3 text-custom-sm text-muted-foreground hover:text-primary hover:bg-muted dark:hover:bg-card/5 rounded-lg"
 >
 {sub.title}
 </Link>
 ))}
 </div>
 ) : (
 <Link
 href={menuItem.path}
 onClick={() => setNavigationOpen(false)}
 className="block px-3 py-2.5 text-custom-sm font-medium text-foreground hover:text-primary hover:bg-muted dark:hover:bg-card/5 rounded-lg"
 >
 {navTitle(menuItem.title)}
 </Link>
 )}
 </li>
 ))}

 <li className="border-t border-border mt-2 pt-2">
 <Link
 href="/wishlist"
 onClick={() => setNavigationOpen(false)}
 className="flex items-center gap-2 px-3 py-2.5 text-custom-sm font-medium text-foreground hover:text-primary hover:bg-muted dark:hover:bg-card/5 rounded-lg"
 >
 <HugeiconsIcon icon={FavouriteIcon} size={16} />
 {t("header_wishlist")}
 </Link>
 </li>
 <li className="px-3 py-2">
 <LanguageSwitcher compact={false} />
 </li>
 </ul>
 </nav>
 </div>
 </div>
 )}

 {/* <!-- Alibaba-style Category Mega Menu --> */}
 <CategoryMegaMenu
 isOpen={categoryMegaMenuOpen}
 onClose={() => setCategoryMegaMenuOpen(false)}
 />
 </header>
 );
};

export default Header;