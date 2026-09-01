"use client";

import Image from "next/image";
import Link from "next/link";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import { authApi } from "@/lib/api/endpoints/auth";
import { sellersApi } from "@/lib/api/endpoints/sellers";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/hooks/useAuth";
import { getPostLoginPath } from "@/guards/auth-routing";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import type { AuthTokenResponse } from "@/types/api/auth";

const DEFAULT_DIAL_CODE = "255";

const PHONE_COUNTRIES = [
  { name: "Tanzania", code: "255", flag: "🇹🇿" },
  { name: "Kenya", code: "254", flag: "🇰🇪" },
  { name: "Uganda", code: "256", flag: "🇺🇬" },
  { name: "Rwanda", code: "250", flag: "🇷🇼" },
  { name: "Burundi", code: "257", flag: "🇧🇮" },
  { name: "DR Congo", code: "243", flag: "🇨🇩" },
  { name: "Zambia", code: "260", flag: "🇿🇲" },
  { name: "Malawi", code: "265", flag: "🇲🇼" },
  { name: "Mozambique", code: "258", flag: "🇲🇿" },
  { name: "South Africa", code: "27", flag: "🇿🇦" },
  { name: "Zimbabwe", code: "263", flag: "🇿🇼" },
  { name: "Botswana", code: "267", flag: "🇧🇼" },
  { name: "Namibia", code: "264", flag: "🇳🇦" },
  { name: "Ghana", code: "233", flag: "🇬🇭" },
  { name: "Nigeria", code: "234", flag: "🇳🇬" },
  { name: "Ethiopia", code: "251", flag: "🇪🇹" },
  { name: "Somalia", code: "252", flag: "🇸🇴" },
  { name: "Egypt", code: "20", flag: "🇪🇬" },
  { name: "Morocco", code: "212", flag: "🇲🇦" },
  { name: "Algeria", code: "213", flag: "🇩🇿" },
  { name: "Tunisia", code: "216", flag: "🇹🇳" },
  { name: "Saudi Arabia", code: "966", flag: "🇸🇦" },
  { name: "United Arab Emirates", code: "971", flag: "🇦🇪" },
  { name: "Qatar", code: "974", flag: "🇶🇦" },
  { name: "Kuwait", code: "965", flag: "🇰🇼" },
  { name: "Oman", code: "968", flag: "🇴🇲" },
  { name: "Bahrain", code: "973", flag: "🇧🇭" },
  { name: "India", code: "91", flag: "🇮🇳" },
  { name: "Pakistan", code: "92", flag: "🇵🇰" },
  { name: "Bangladesh", code: "880", flag: "🇧🇩" },
  { name: "China", code: "86", flag: "🇨🇳" },
  { name: "Japan", code: "81", flag: "🇯🇵" },
  { name: "South Korea", code: "82", flag: "🇰🇷" },
  { name: "Singapore", code: "65", flag: "🇸🇬" },
  { name: "Malaysia", code: "60", flag: "🇲🇾" },
  { name: "Indonesia", code: "62", flag: "🇮🇩" },
  { name: "Philippines", code: "63", flag: "🇵🇭" },
  { name: "Australia", code: "61", flag: "🇦🇺" },
  { name: "New Zealand", code: "64", flag: "🇳🇿" },
  { name: "United Kingdom", code: "44", flag: "🇬🇧" },
  { name: "Germany", code: "49", flag: "🇩🇪" },
  { name: "France", code: "33", flag: "🇫🇷" },
  { name: "Italy", code: "39", flag: "🇮🇹" },
  { name: "Spain", code: "34", flag: "🇪🇸" },
  { name: "Netherlands", code: "31", flag: "🇳🇱" },
  { name: "Belgium", code: "32", flag: "🇧🇪" },
  { name: "Sweden", code: "46", flag: "🇸🇪" },
  { name: "Norway", code: "47", flag: "🇳🇴" },
  { name: "Switzerland", code: "41", flag: "🇨🇭" },
  { name: "Turkey", code: "90", flag: "🇹🇷" },
  { name: "United States / Canada", code: "1", flag: "🇺🇸" },
  { name: "Mexico", code: "52", flag: "🇲🇽" },
  { name: "Brazil", code: "55", flag: "🇧🇷" },
  { name: "Argentina", code: "54", flag: "🇦🇷" },
] as const;

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";
  return { first_name: firstName, last_name: lastName || firstName };
};

const hasAuthToken = (response: unknown): response is AuthTokenResponse => {
  return (
    typeof response === "object" &&
    response !== null &&
    "access_token" in response &&
    typeof (response as { access_token?: unknown }).access_token === "string"
  );
};

const cleanDialCode = (value: string) => value.replace(/\D/g, "").slice(0, 4);
const cleanLocalPhone = (value: string) => value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 14);

const isValidInternationalPhone = (localDigits: string, dialCode: string) => {
  const code = cleanDialCode(dialCode);
  const local = cleanLocalPhone(localDigits);
  const totalDigits = `${code}${local}`;
  return code.length >= 1 && local.length >= 4 && totalDigits.length >= 7 && totalDigits.length <= 15;
};

const buildInternationalPhone = (localDigits: string, dialCode: string) =>
  `+${cleanDialCode(dialCode)}${cleanLocalPhone(localDigits)}`;

const isValidUrl = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter (A-Z)", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter (a-z)", test: (v) => /[a-z]/.test(v) },
  { label: "One number (0-9)", test: (v) => /\d/.test(v) },
  { label: "One special character (!@#$...)", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

interface BusinessCategory {
  id: string;
  name: string;
}

type AuthTab = "signin" | "signup" | "seller" | "broker";

const AUTH_TABS: { key: AuthTab; label: string }[] = [
  { key: "signin", label: "Sign In" },
  { key: "signup", label: "Sign Up" },
  { key: "seller", label: "Seller" },
  { key: "broker", label: "Broker" },
];

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a13.16 13.16 0 0 1-3.19 3.94M6.61 6.61A13.14 13.14 0 0 0 1 11s4 7 11 7a9.14 9.14 0 0 0 5.39-1.61M9.53 9.53a3 3 0 0 0 4.24 4.24" />
    <path d="M1 1l22 22" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" />
  </svg>
);

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="6" width="14" height="11" rx="1" />
    <path d="M15 10h4l3 3v4h-7z" />
    <circle cx="6" cy="19" r="1.6" />
    <circle cx="17.5" cy="19" r="1.6" />
  </svg>
);

const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3" />
    <path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-4a2 2 0 1 0 0 4" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m23 6-9.5 9.5-5-5L1 18" />
    <path d="M17 6h6v6" />
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8L12 17.7 5.9 21l1.5-6.8L2.2 9.5l6.9-.7L12 2.5Z" />
  </svg>
);

const FEATURES = [
  { icon: <ShieldIcon />, title: "Marketplace Checkout", description: "Use payment methods made available for your order" },
  { icon: <TruckIcon />, title: "Delivery Options", description: "See available shipping options during checkout" },
  { icon: <WalletIcon />, title: "Seller Wallet", description: "Track balances and payout requests from Seller Center" },
  { icon: <TrendingUpIcon />, title: "Manage Your Store", description: "List products and manage customer orders" },
];

     
// Small shared field components
     

const FieldLabel = ({
  htmlFor,
  children,
  required,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}) => (
  <label htmlFor={htmlFor} className="block mb-2 text-sm font-medium text-dark dark:text-darkTheme-body-color">
    {children}{" "}
    {required && <span className="text-red">*</span>}
    {optional && (
      <span className="text-dark-4 dark:text-darkTheme-secondary-muted font-normal">(optional)</span>
    )}
  </label>
);

const TextInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={
      "h-12 rounded-xl border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full px-4 text-base sm:text-sm outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-orange/30 disabled:cursor-not-allowed disabled:opacity-70 " +
      (props.className || "")
    }
  />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={
      "rounded-lg border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full py-3 px-4 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-orange/30 disabled:cursor-not-allowed disabled:opacity-70 resize-none " +
      (props.className || "")
    }
  />
);

const PhoneInput = ({
  id,
  value,
  onChange,
  dialCode,
  onDialCodeChange,
  disabled,
  invalid,
  placeholder = "Phone number",
}: {
  id: string;
  value: string;
  onChange: (digits: string) => void;
  dialCode: string;
  onDialCodeChange: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
}) => {
  const isKnownCode = PHONE_COUNTRIES.some((country) => country.code === dialCode);
  const selection = isKnownCode ? dialCode : "custom";

  return (
    <div>
      <div
        className={`flex flex-col sm:flex-row rounded-lg border bg-gray-1 dark:bg-darkTheme-secondary-bg overflow-hidden focus-within:ring-2 focus-within:ring-orange/30 ${
          invalid ? "border-red" : "border-gray-3 dark:border-darkTheme-border-color"
        }`}
      >
        <select
          aria-label="Country calling code"
          value={selection}
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.value;
            onDialCodeChange(next === "custom" ? "" : next);
          }}
          className="h-12 sm:w-[190px] px-3 bg-gray-2 dark:bg-darkTheme-bg text-sm text-dark dark:text-white border-b sm:border-b-0 sm:border-r border-gray-3 dark:border-darkTheme-border-color outline-none"
        >
          {PHONE_COUNTRIES.map((country) => (
            <option key={`${country.name}-${country.code}`} value={country.code}>
              {country.flag} {country.name} (+{country.code})
            </option>
          ))}
          <option value="custom">Other / Custom code</option>
        </select>

        {selection === "custom" && (
          <div className="flex h-12 items-center border-b sm:border-b-0 sm:border-r border-gray-3 dark:border-darkTheme-border-color bg-gray-2 dark:bg-darkTheme-bg">
            <span className="pl-3 text-dark-4 dark:text-darkTheme-secondary-muted">+</span>
            <input
              type="text"
              inputMode="numeric"
              aria-label="Custom country calling code"
              placeholder="Code"
              value={dialCode}
              onChange={(event) => onDialCodeChange(cleanDialCode(event.target.value))}
              disabled={disabled}
              className="h-12 w-20 bg-transparent px-2 outline-none dark:text-white"
            />
          </div>
        )}

        <input
          type="tel"
          inputMode="tel"
          id={id}
          name={id}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(cleanLocalPhone(event.target.value))}
          autoComplete="tel-national"
          disabled={disabled}
          className="h-12 flex-1 min-w-0 px-4 bg-transparent outline-none dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted disabled:cursor-not-allowed disabled:opacity-70"
        />
      </div>
      <p className="mt-1.5 text-xs text-dark-4 dark:text-darkTheme-secondary-muted">
        Select your country calling code. If it is not listed, choose Other / Custom code. Enter the local number without the leading 0.
      </p>
    </div>
  );
};

const PasswordInput = ({
  id,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder,
  autoComplete,
  disabled,
  withIcon,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder: string;
  autoComplete: string;
  disabled?: boolean;
  withIcon?: boolean;
}) => (
  <div className="relative">
    {withIcon && (
      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-dark-4 dark:text-darkTheme-secondary-muted">
        <LockIcon />
      </span>
    )}
    <input
      type={show ? "text" : "password"}
      id={id}
      name={id}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      autoComplete={autoComplete}
      disabled={disabled}
      className={`h-12 rounded-xl border border-gray-3 dark:border-darkTheme-border-color bg-gray-1 dark:bg-darkTheme-secondary-bg dark:text-darkTheme-body-color placeholder:text-dark-4 dark:placeholder:text-darkTheme-secondary-muted w-full text-base sm:text-sm ${
        withIcon ? "pl-11" : "pl-4"
      } pr-12 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-orange/30 disabled:cursor-not-allowed disabled:opacity-70`}
    />
    <button
      type="button"
      onClick={onToggleShow}
      tabIndex={-1}
      aria-label={show ? "Hide password" : "Show password"}
      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-dark-4 dark:text-darkTheme-secondary-muted hover:text-dark dark:hover:text-white"
    >
      {show ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  </div>
);

const PasswordChecklist = ({ password }: { password: string }) => {
  const checks = PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) }));
  if (!password) return null;
  return (
    <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
      {checks.map((check) => (
        <li
          key={check.label}
          className={`flex items-center gap-2 text-sm ${
            check.passed ? "text-green-600 dark:text-green-400" : "text-dark-4 dark:text-darkTheme-secondary-muted"
          }`}
        >
          <span
            className={`flex items-center justify-center w-4 h-4 rounded-full border shrink-0 ${
              check.passed ? "bg-green-600 border-green-600 text-white" : "border-gray-3 dark:border-darkTheme-border-color"
            }`}
          >
            {check.passed && <CheckIcon />}
          </span>
          {check.label}
        </li>
      ))}
    </ul>
  );
};

     
// Sign In panel
     

const SignInPanel = ({ onSwitchTab }: { onSwitchTab: (tab: AuthTab) => void }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession, mergeGuestCart } = useAuth();
  const { closeCartModal } = useCartModalContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const justVerified = searchParams.get("verified") === "1";

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter your email/phone number and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await authApi.login({ email: email.trim(), password });
      setSession(session);

      if (getPostLoginPath("/account", session.user) === "/account") {
        await mergeGuestCart().catch(() => {
          toast.error("Signed in, but your guest cart is still waiting to be synced.");
        });
      }

      closeCartModal();
      toast.success("Signed in successfully.");

      const requestedRedirect = searchParams.get("redirect");
      router.push(getPostLoginPath(requestedRedirect, session.user));
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 403 &&
        error.message.toLowerCase().includes("not verified")
      ) {
        toast("Your account is not verified yet. Enter the OTP or request a new one.");

        const params = new URLSearchParams({
          identifier: email.trim().toLowerCase(),
          recover: "1",
          next: "/signin",
        });

        router.push(`/verify-otp?${params.toString()}`);
        return;
      }

      if (error instanceof ApiError) toast.error(error.message);
      else toast.error("Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {justVerified && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Your account has been verified successfully. You can sign in now.
        </div>
      )}

      <div className="mb-4 sm:mb-5">
        <FieldLabel htmlFor="signin-email">Email / Phone Number</FieldLabel>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-dark-4 dark:text-darkTheme-secondary-muted">
            <MailIcon />
          </span>
          <TextInput
            type="text"
            id="signin-email"
            name="email"
            placeholder="Enter your email or phone number"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            disabled={isSubmitting}
            className="pl-11"
          />
        </div>
      </div>

      <div className="mb-4 sm:mb-5">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="signin-password" className="text-sm font-medium text-dark dark:text-darkTheme-body-color">
            Password
          </label>
          <Link href="/forgot-password" className="text-sm text-orange hover:underline">
            Forgot Password
          </Link>
        </div>
        <PasswordInput
          id="signin-password"
          value={password}
          onChange={setPassword}
          show={showPassword}
          onToggleShow={() => setShowPassword((prev) => !prev)}
          placeholder="Enter your password"
          autoComplete="current-password"
          disabled={isSubmitting}
          withIcon
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-orange px-6 text-base font-semibold text-white shadow-sm ease-out duration-200 hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>

      <p className="mt-5 text-center text-sm sm:mt-6">
        <span className="text-dark-4 dark:text-darkTheme-secondary-muted">Don&apos;t have an account? </span>
<Link href="/signup" className="font-medium text-orange hover:underline">Sign Up</Link>
      </p>
    </form>
  );
};

     
// Buyer Sign Up panel
     

const SignUpPanel = ({ onSwitchTab }: { onSwitchTab: (tab: AuthTab) => void }) => {
  const router = useRouter();
  const { setSession } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneDialCode, setPhoneDialCode] = useState(DEFAULT_DIAL_CODE);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPasswordMismatch = useMemo(
    () => Boolean(confirmPassword) && password !== confirmPassword,
    [password, confirmPassword]
  );
  const isPasswordStrong = useMemo(() => PASSWORD_RULES.every((rule) => rule.test(password)), [password]);
  const isPhoneValid = useMemo(() => !phone || isValidInternationalPhone(phone, phoneDialCode), [phone, phoneDialCode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !phone || !password || !confirmPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!isValidInternationalPhone(phone, phoneDialCode)) {
      toast.error("Enter a valid international phone number and country calling code.");
      return;
    }
    if (!isPasswordStrong) {
      toast.error("Please choose a stronger password that meets all requirements.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const nameParts = splitFullName(fullName);
      const submittedPhone = buildInternationalPhone(phone, phoneDialCode);
      const submittedEmail = email.trim().toLowerCase();

      const response = await authApi.registerBuyer({
        ...nameParts,
        email: submittedEmail,
        phone: submittedPhone,
        password,
      });

      toast.success(response.message || "Verification code sent.");

      const params = new URLSearchParams({
        phone: response.phone || submittedPhone,
        email: response.email || submittedEmail,
        purpose: response.verification_purpose || "register",
        next: "/choose-role",
      });

      router.push(`/verify-otp?${params.toString()}`);
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error("Unable to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5">
        <FieldLabel htmlFor="signup-name" required>Full Name</FieldLabel>
        <TextInput
          type="text"
          id="signup-name"
          name="name"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          autoComplete="name"
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-5">
        <FieldLabel htmlFor="signup-email" required>Email Address</FieldLabel>
        <TextInput
          type="email"
          id="signup-email"
          name="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-5">
        <FieldLabel htmlFor="signup-phone" required>Phone Number</FieldLabel>
        <PhoneInput id="signup-phone" value={phone} onChange={setPhone} dialCode={phoneDialCode} onDialCodeChange={setPhoneDialCode} disabled={isSubmitting} invalid={Boolean(phone) && !isPhoneValid} />
        {phone && !isPhoneValid && (
          <p className="mt-2 text-sm text-red">Enter a valid international phone number.</p>
        )}
      </div>

      <div className="mb-5">
        <FieldLabel htmlFor="signup-password" required>Password</FieldLabel>
        <PasswordInput
          id="signup-password"
          value={password}
          onChange={setPassword}
          show={showPassword}
          onToggleShow={() => setShowPassword((prev) => !prev)}
          placeholder="Enter your password"
          autoComplete="new-password"
          disabled={isSubmitting}
        />
        <PasswordChecklist password={password} />
      </div>

      <div className="mb-5.5">
        <FieldLabel htmlFor="signup-confirm-password" required>Re-type Password</FieldLabel>
        <PasswordInput
          id="signup-confirm-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirmPassword}
          onToggleShow={() => setShowConfirmPassword((prev) => !prev)}
          placeholder="Re-type your password"
          autoComplete="new-password"
          disabled={isSubmitting}
        />
        {isPasswordMismatch && <p className="mt-2 text-sm text-red">Passwords do not match.</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center font-medium text-white bg-orange py-3 px-6 rounded-lg ease-out duration-200 hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-center mt-6 text-sm">
        <span className="text-dark-4 dark:text-darkTheme-secondary-muted">Already have an account? </span>
<Link href="/signin" className="font-medium text-orange hover:underline">Sign In</Link>
      </p>

    </form>
  );
};

     
// Seller Sign Up panel
     

interface SellerFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  businessDescription: string;
  businessLocation: string;
  businessCountry: string;
  businessRegion: string;
  businessCity: string;
  businessAddress: string;
  productDescription: string;
  yearsInBusiness: string;
  websiteUrl: string;
  contactEmail: string;
  contactPhone: string;
  agreementAccepted: boolean;
}

const SELLER_INITIAL_STATE: SellerFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  businessName: "",
  businessDescription: "",
  businessLocation: "",
  businessCountry: "Tanzania",
  businessRegion: "",
  businessCity: "",
  businessAddress: "",
  productDescription: "",
  yearsInBusiness: "",
  websiteUrl: "",
  contactEmail: "",
  contactPhone: "",
  agreementAccepted: false,
};

const SellerPanel = ({ onSwitchTab }: { onSwitchTab: (tab: AuthTab) => void }) => {
  const router = useRouter();

  const [form, setForm] = useState<SellerFormState>(SELLER_INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useAccountContact, setUseAccountContact] = useState(true);
  const [phoneDialCode, setPhoneDialCode] = useState(DEFAULT_DIAL_CODE);
  const [contactPhoneDialCode, setContactPhoneDialCode] = useState(DEFAULT_DIAL_CODE);

  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(false);

  const updateField = <K extends keyof SellerFormState>(key: K, value: SellerFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(false);
    try {
      const result = await sellersApi.getBusinessCategories();
      setCategories(result.map((category) => ({
        id: String(category.id),
        name: category.name,
      })));
    } catch {
      setCategoriesError(true);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (categories.length === 0 && !categoriesLoading) {
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const isPasswordMismatch = useMemo(
    () => Boolean(form.confirmPassword) && form.password !== form.confirmPassword,
    [form.password, form.confirmPassword]
  );
  const isPasswordStrong = useMemo(() => PASSWORD_RULES.every((rule) => rule.test(form.password)), [form.password]);
  const isPhoneValid = useMemo(() => !form.phone || isValidInternationalPhone(form.phone, phoneDialCode), [form.phone, phoneDialCode]);
  const isContactPhoneValid = useMemo(
    () => !form.contactPhone || isValidInternationalPhone(form.contactPhone, contactPhoneDialCode),
    [form.contactPhone, contactPhoneDialCode]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone ||
      !form.password ||
      !form.confirmPassword ||
      !form.businessName.trim() ||
      !form.businessDescription.trim() ||
      !form.businessCountry.trim() ||
      !form.businessCity.trim() ||
      (!useAccountContact && (!form.contactEmail.trim() || !form.contactPhone))
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isValidInternationalPhone(form.phone, phoneDialCode)) {
      toast.error("Enter a valid international phone number and country calling code.");
      return;
    }

    if (!useAccountContact && !isValidInternationalPhone(form.contactPhone, contactPhoneDialCode)) {
      toast.error("Enter a valid international contact phone number and country calling code.");
      return;
    }

    if (selectedCategoryIds.length === 0) {
      toast.error("Please select at least one business category.");
      return;
    }

    if (!isPasswordStrong) {
      toast.error("Please choose a stronger password that meets all requirements.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (form.websiteUrl && !isValidUrl(form.websiteUrl)) {
      toast.error("Enter a valid website URL, e.g. https://example.com.");
      return;
    }

    if (!form.agreementAccepted) {
      toast.error("You must accept the Seller Agreement and Terms & Conditions.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone: buildInternationalPhone(form.phone, phoneDialCode),
        password: form.password,
        business_name: form.businessName.trim(),
        business_category_ids: selectedCategoryIds,
        business_description: form.businessDescription.trim(),
        business_location: form.businessLocation.trim() || undefined,
        business_country: form.businessCountry.trim(),
        business_region: form.businessRegion.trim() || undefined,
        business_city: form.businessCity.trim(),
        business_address: form.businessAddress.trim() || undefined,
        product_description: form.productDescription.trim() || undefined,
        years_in_business: form.yearsInBusiness.trim() || undefined,
        website_url: form.websiteUrl.trim() || undefined,
        contact_email: useAccountContact ? form.email.trim() : form.contactEmail.trim(),
        contact_phone: useAccountContact
          ? buildInternationalPhone(form.phone, phoneDialCode)
          : buildInternationalPhone(form.contactPhone, contactPhoneDialCode),
        agreement_accepted: form.agreementAccepted,
      };

      const response = await authApi.registerSeller(payload);

      toast.success(response.message || "Verification code sent.");

      const submittedPhone = buildInternationalPhone(form.phone, phoneDialCode);
      const submittedEmail = form.email.trim().toLowerCase();

      const params = new URLSearchParams({
        phone: response.phone || submittedPhone,
        email: response.email || submittedEmail,
        purpose: response.verification_purpose || "register_seller",
        next: "/signin",
      });

      router.push(`/verify-otp?${params.toString()}`);
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error("Unable to create seller account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-sm font-semibold text-dark dark:text-white mb-4 uppercase tracking-wide">
        Personal details
      </h3>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <FieldLabel htmlFor="seller-first-name" required>First Name</FieldLabel>
          <TextInput
            type="text"
            id="seller-first-name"
            placeholder="e.g. Amina"
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            autoComplete="given-name"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <FieldLabel htmlFor="seller-last-name" required>Last Name</FieldLabel>
          <TextInput
            type="text"
            id="seller-last-name"
            placeholder="e.g. Mrisho"
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
            autoComplete="family-name"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <FieldLabel htmlFor="seller-email" required>Email Address</FieldLabel>
          <TextInput
            type="email"
            id="seller-email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="email"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <FieldLabel htmlFor="seller-phone" required>Phone Number</FieldLabel>
          <PhoneInput
            id="seller-phone"
            value={form.phone}
            onChange={(value) => updateField("phone", value)}
            dialCode={phoneDialCode}
            onDialCodeChange={setPhoneDialCode}
            disabled={isSubmitting}
            invalid={Boolean(form.phone) && !isPhoneValid}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <div>
          <FieldLabel htmlFor="seller-password" required>Password</FieldLabel>
          <PasswordInput
            id="seller-password"
            value={form.password}
            onChange={(value) => updateField("password", value)}
            show={showPassword}
            onToggleShow={() => setShowPassword((prev) => !prev)}
            placeholder="Create a password"
            autoComplete="new-password"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <FieldLabel htmlFor="seller-confirm-password" required>Re-type Password</FieldLabel>
          <PasswordInput
            id="seller-confirm-password"
            value={form.confirmPassword}
            onChange={(value) => updateField("confirmPassword", value)}
            show={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword((prev) => !prev)}
            placeholder="Re-type your password"
            autoComplete="new-password"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="-mt-4 mb-6">
        <PasswordChecklist password={form.password} />
        {isPasswordMismatch && <p className="mt-2 text-sm text-red">Passwords do not match.</p>}
      </div>

      <hr className="border-gray-3 dark:border-darkTheme-border-color mb-6" />

      <h3 className="text-sm font-semibold text-dark dark:text-white mb-4 uppercase tracking-wide">
        Business details
      </h3>

      <div className="mb-5">
        <FieldLabel htmlFor="seller-business-name" required>Business Name</FieldLabel>
        <TextInput
          type="text"
          id="seller-business-name"
          placeholder="e.g. Amina's Fabrics"
          value={form.businessName}
          onChange={(event) => updateField("businessName", event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-5">
        <FieldLabel htmlFor="seller-categories" required>Business Categories</FieldLabel>
        <div className="rounded-lg border border-gray-3 dark:border-darkTheme-border-color max-h-44 overflow-y-auto p-3 bg-gray-1 dark:bg-darkTheme-secondary-bg">
          {categoriesLoading && (
            <p className="text-sm text-dark-4 dark:text-darkTheme-secondary-muted py-2">Loading categories...</p>
          )}

          {!categoriesLoading && categoriesError && (
            <div className="flex items-center justify-between py-2">
              <p className="text-sm text-red">Couldn&apos;t load categories.</p>
              <button type="button" onClick={loadCategories} className="text-sm font-medium text-orange hover:underline">
                Retry
              </button>
            </div>
          )}

          {!categoriesLoading && !categoriesError && categories.length === 0 && (
            <p className="text-sm text-dark-4 dark:text-darkTheme-secondary-muted py-2">No categories available.</p>
          )}

          {!categoriesLoading && !categoriesError && categories.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  htmlFor={`category-${category.id}`}
                  className="flex items-center gap-2.5 cursor-pointer select-none text-sm text-dark dark:text-darkTheme-body-color"
                >
                  <input
                    type="checkbox"
                    id={`category-${category.id}`}
                    checked={selectedCategoryIds.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                    disabled={isSubmitting}
                    className="peer sr-only"
                  />
                  <span className="flex items-center justify-center w-4.5 h-4.5 rounded border border-gray-3 dark:border-darkTheme-border-color peer-checked:bg-orange peer-checked:border-orange text-white transition-colors shrink-0">
                    {selectedCategoryIds.includes(category.id) && <CheckIcon />}
                  </span>
                  {category.name}
                </label>
              ))}
            </div>
          )}
        </div>
        {selectedCategoryIds.length > 0 && (
          <p className="mt-2 text-sm text-dark-4 dark:text-darkTheme-secondary-muted">
            {selectedCategoryIds.length} selected
          </p>
        )}
      </div>

      <div className="mb-5">
        <FieldLabel htmlFor="seller-business-description" required>Business Description</FieldLabel>
        <TextArea
          id="seller-business-description"
          rows={3}
          placeholder="Tell buyers what your business does"
          value={form.businessDescription}
          onChange={(event) => updateField("businessDescription", event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-5">
        <FieldLabel htmlFor="seller-product-description" optional>Product Description</FieldLabel>
        <TextArea
          id="seller-product-description"
          rows={3}
          placeholder="What kinds of products will you sell?"
          value={form.productDescription}
          onChange={(event) => updateField("productDescription", event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <FieldLabel htmlFor="seller-country" required>Country</FieldLabel>
          <TextInput
            type="text"
            id="seller-country"
            placeholder="e.g. Tanzania"
            value={form.businessCountry}
            onChange={(event) => updateField("businessCountry", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <FieldLabel htmlFor="seller-region" optional>Region</FieldLabel>
          <TextInput
            type="text"
            id="seller-region"
            placeholder="e.g. Dar es Salaam"
            value={form.businessRegion}
            onChange={(event) => updateField("businessRegion", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <FieldLabel htmlFor="seller-city" required>City</FieldLabel>
          <TextInput
            type="text"
            id="seller-city"
            placeholder="e.g. Kinondoni"
            value={form.businessCity}
            onChange={(event) => updateField("businessCity", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <FieldLabel htmlFor="seller-location" optional>General Location</FieldLabel>
          <TextInput
            type="text"
            id="seller-location"
            placeholder="e.g. Near Mlimani City"
            value={form.businessLocation}
            onChange={(event) => updateField("businessLocation", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="mb-5">
        <FieldLabel htmlFor="seller-address" optional>Business Address</FieldLabel>
        <TextInput
          type="text"
          id="seller-address"
          placeholder="Street, building, plot number"
          value={form.businessAddress}
          onChange={(event) => updateField("businessAddress", event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mb-5">
        <div>
          <FieldLabel htmlFor="seller-years" optional>Years in Business</FieldLabel>
          <TextInput
            type="text"
            id="seller-years"
            placeholder="e.g. 3 years"
            value={form.yearsInBusiness}
            onChange={(event) => updateField("yearsInBusiness", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <FieldLabel htmlFor="seller-website" optional>Website URL</FieldLabel>
          <TextInput
            type="url"
            id="seller-website"
            placeholder="https://example.com"
            value={form.websiteUrl}
            onChange={(event) => updateField("websiteUrl", event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <hr className="border-gray-3 dark:border-darkTheme-border-color mb-6" />

      <h3 className="text-sm font-semibold text-dark dark:text-white mb-4 uppercase tracking-wide">
        Business contact
      </h3>

      <label
        htmlFor="seller-use-account-contact"
        className="mb-5 flex cursor-pointer items-center gap-3 rounded-lg border border-gray-3 bg-gray-1 p-3 dark:border-darkTheme-border-color dark:bg-darkTheme-secondary-bg"
      >
        <input
          id="seller-use-account-contact"
          type="checkbox"
          checked={useAccountContact}
          onChange={(event) => setUseAccountContact(event.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4 accent-orange"
        />
        <span className="text-sm text-dark dark:text-darkTheme-body-color">
          Use my account email and phone as the business contact details
        </span>
      </label>

      <div className="grid sm:grid-cols-2 gap-5 mb-7">
        <div>
          <FieldLabel htmlFor="seller-contact-email" required={!useAccountContact} optional={useAccountContact}>Contact Email</FieldLabel>
          <TextInput
            type="email"
            id="seller-contact-email"
            placeholder="business@example.com"
            value={useAccountContact ? form.email : form.contactEmail}
            onChange={(event) => updateField("contactEmail", event.target.value)}
            disabled={isSubmitting || useAccountContact}
          />
        </div>
        <div>
          <FieldLabel htmlFor="seller-contact-phone" required={!useAccountContact} optional={useAccountContact}>Contact Phone</FieldLabel>
          <PhoneInput
            id="seller-contact-phone"
            value={useAccountContact ? form.phone : form.contactPhone}
            onChange={(value) => updateField("contactPhone", value)}
            dialCode={useAccountContact ? phoneDialCode : contactPhoneDialCode}
            onDialCodeChange={useAccountContact ? setPhoneDialCode : setContactPhoneDialCode}
            disabled={isSubmitting || useAccountContact}
            invalid={!useAccountContact && Boolean(form.contactPhone) && !isContactPhoneValid}
          />
        </div>
      </div>

      {/* Seller Agreement - required before registration */}
      <div className="mb-6 rounded-xl border-2 border-orange/30 bg-orange/5 p-4 dark:border-orange/40 dark:bg-orange/10">
        <label
          htmlFor="seller-agreement-accepted"
          className="flex cursor-pointer items-start gap-3"
        >
          <input
            id="seller-agreement-accepted"
            name="agreement_accepted"
            type="checkbox"
            checked={form.agreementAccepted}
            onChange={(event) => updateField("agreementAccepted", event.target.checked)}
            disabled={isSubmitting}
            className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-orange"
          />

          <span className="text-sm leading-6 text-dark dark:text-darkTheme-body-color">
            <span className="font-semibold">
              I agree to the Seller Agreement and Terms &amp; Conditions
            </span>
            <span className="text-red"> *</span>
            <br />
            <span className="text-dark-4 dark:text-darkTheme-secondary-muted">
              By creating a seller account, I confirm that the information I have
              provided is correct and I agree to comply with XerinMarket seller
              policies and terms.
            </span>
          </span>
        </label>

        {!form.agreementAccepted && (
          <p className="mt-2 pl-8 text-xs text-dark-4 dark:text-darkTheme-secondary-muted">
            Please tick the checkbox above to enable seller registration.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !form.agreementAccepted}
        className="w-full flex justify-center font-medium text-white bg-orange py-3 px-6 rounded-lg ease-out duration-200 hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Creating seller account..." : "Create Seller Account"}
      </button>

      <p className="text-center mt-6 text-sm">
        <span className="text-dark-4 dark:text-darkTheme-secondary-muted">Already have an account? </span>
        <button type="button" onClick={() => onSwitchTab("signin")} className="font-medium text-orange hover:underline">
          Sign in
        </button>
      </p>
    </form>
  );
};


// Broker Sign Up panel

interface BrokerFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  country: string;
  region: string;
  city: string;
}

const BROKER_INITIAL_STATE: BrokerFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  country: "Tanzania",
  region: "",
  city: "",
};

const BrokerPanel = ({ onSwitchTab }: { onSwitchTab: (tab: AuthTab) => void }) => {
  const router = useRouter();
  const [form, setForm] = useState<BrokerFormState>(BROKER_INITIAL_STATE);
  const [phoneDialCode, setPhoneDialCode] = useState(DEFAULT_DIAL_CODE);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof BrokerFormState>(key: K, value: BrokerFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isPasswordMismatch = useMemo(
    () => Boolean(form.confirmPassword) && form.password !== form.confirmPassword,
    [form.password, form.confirmPassword],
  );
  const isPasswordStrong = useMemo(
    () => PASSWORD_RULES.every((rule) => rule.test(form.password)),
    [form.password],
  );
  const isPhoneValid = useMemo(() => !form.phone || isValidInternationalPhone(form.phone, phoneDialCode), [form.phone, phoneDialCode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone ||
      !form.password ||
      !form.confirmPassword ||
      !form.country.trim() ||
      !form.region.trim() ||
      !form.city.trim()
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isValidInternationalPhone(form.phone, phoneDialCode)) {
      toast.error("Enter a valid international phone number and country calling code.");
      return;
    }

    if (!isPasswordStrong) {
      toast.error("Please choose a stronger password that meets all requirements.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const submittedPhone = buildInternationalPhone(form.phone, phoneDialCode);
      const submittedEmail = form.email.trim().toLowerCase();

      const response = await authApi.registerBroker({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: submittedEmail,
        phone: submittedPhone,
        password: form.password,
        country: form.country.trim(),
        region: form.region.trim(),
        city: form.city.trim(),
      });

      toast.success(response.message || "Broker account created. Verification code sent.");

      const params = new URLSearchParams({
        phone: response.phone || submittedPhone,
        email: response.email || submittedEmail,
        purpose: response.verification_purpose || "register_broker",
        next: "/signin",
      });

      router.push(`/verify-otp?${params.toString()}`);
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error("Unable to create broker account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5 rounded-xl border border-orange/20 bg-orange/5 p-4 dark:border-orange/30 dark:bg-orange/10">
        <p className="text-sm font-semibold text-dark dark:text-white">Broker registration</p>
        <p className="mt-1 text-sm text-dark-4 dark:text-darkTheme-secondary-muted">
          Create your Broker account here. After verification and sign in, complete KYC from the Broker dashboard before promotion and product features are unlocked.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 mb-5">
        <div>
          <FieldLabel htmlFor="broker-first-name" required>First Name</FieldLabel>
          <TextInput id="broker-first-name" type="text" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} placeholder="e.g. Adam" autoComplete="given-name" disabled={isSubmitting} />
        </div>
        <div>
          <FieldLabel htmlFor="broker-last-name" required>Last Name</FieldLabel>
          <TextInput id="broker-last-name" type="text" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} placeholder="e.g. Mussa" autoComplete="family-name" disabled={isSubmitting} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 mb-5">
        <div>
          <FieldLabel htmlFor="broker-email" required>Email Address</FieldLabel>
          <TextInput id="broker-email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="you@example.com" autoComplete="email" disabled={isSubmitting} />
        </div>
        <div>
          <FieldLabel htmlFor="broker-phone" required>Mobile Number</FieldLabel>
          <PhoneInput id="broker-phone" value={form.phone} onChange={(value) => updateField("phone", value)} dialCode={phoneDialCode} onDialCodeChange={setPhoneDialCode} disabled={isSubmitting} invalid={Boolean(form.phone) && !isPhoneValid} />
          {form.phone && !isPhoneValid && <p className="mt-2 text-sm text-red">Enter a valid international phone number.</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3 mb-5">
        <div>
          <FieldLabel htmlFor="broker-country" required>Country</FieldLabel>
          <TextInput id="broker-country" type="text" value={form.country} onChange={(e) => updateField("country", e.target.value)} placeholder="Tanzania" disabled={isSubmitting} />
        </div>
        <div>
          <FieldLabel htmlFor="broker-region" required>Region</FieldLabel>
          <TextInput id="broker-region" type="text" value={form.region} onChange={(e) => updateField("region", e.target.value)} placeholder="Dar es Salaam" disabled={isSubmitting} />
        </div>
        <div>
          <FieldLabel htmlFor="broker-city" required>City</FieldLabel>
          <TextInput id="broker-city" type="text" value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Kinondoni" disabled={isSubmitting} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 mb-5">
        <div>
          <FieldLabel htmlFor="broker-password" required>Password</FieldLabel>
          <PasswordInput id="broker-password" value={form.password} onChange={(value) => updateField("password", value)} show={showPassword} onToggleShow={() => setShowPassword((prev) => !prev)} placeholder="Create a password" autoComplete="new-password" disabled={isSubmitting} />
        </div>
        <div>
          <FieldLabel htmlFor="broker-confirm-password" required>Re-type Password</FieldLabel>
          <PasswordInput id="broker-confirm-password" value={form.confirmPassword} onChange={(value) => updateField("confirmPassword", value)} show={showConfirmPassword} onToggleShow={() => setShowConfirmPassword((prev) => !prev)} placeholder="Re-type your password" autoComplete="new-password" disabled={isSubmitting} />
        </div>
      </div>

      <div className="-mt-3 mb-6">
        <PasswordChecklist password={form.password} />
        {isPasswordMismatch && <p className="mt-2 text-sm text-red">Passwords do not match.</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full flex justify-center font-medium text-white bg-orange py-3 px-6 rounded-lg ease-out duration-200 hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-70">
        {isSubmitting ? "Creating broker account..." : "Create Broker Account"}
      </button>

      <p className="text-center mt-6 text-sm">
        <span className="text-dark-4 dark:text-darkTheme-secondary-muted">Already have an account? </span>
        <button type="button" onClick={() => onSwitchTab("signin")} className="font-medium text-orange hover:underline">Sign in</button>
      </p>
    </form>
  );
};

     
// Page shell
     

const AuthPage = ({ initialTab = "signup" }: { initialTab?: AuthTab }) => {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const resolvedInitialTab: AuthTab =
    requestedTab === "signup" ? "signup" : initialTab === "signup" ? "signup" : "signin";
  const [activeTab, setActiveTab] = useState<AuthTab>(resolvedInitialTab);

  useEffect(() => {
    if (requestedTab === "signup") setActiveTab("signup");
  }, [requestedTab]);

  const headings: Record<AuthTab, { title: string; subtitle: string }> = {
    signin: { title: "Welcome back", subtitle: "Sign in to continue to XerinMarket" },
    signup: { title: "Create an account", subtitle: "Create your Xerin Market account" },
    seller: { title: "Become a seller", subtitle: "Tell us about your business to get started" },
    broker: { title: "Become a broker", subtitle: "Register, verify your identity, and start earning through XerinMarket" },
  };

  return (
    <section className="min-h-[100dvh] bg-white dark:bg-darkTheme-bg lg:grid lg:grid-cols-2">
      {/* Left panel: forms */}
      <div className="flex min-h-[100dvh] flex-col px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))] sm:px-10 sm:py-8 xl:px-20">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex w-fit items-center gap-2">
            <Image src="/images/logo/logo.png" alt="XerinMarket" width={30} height={30} priority className="h-[30px] w-[30px] object-contain" />
            <span className="text-base font-bold text-dark dark:text-white sm:text-lg">XerinMarket</span>
          </Link>
          <Link href="/" className="rounded-full border border-gray-3 px-3 py-1.5 text-xs font-semibold text-dark-4 transition hover:text-orange dark:border-darkTheme-border-color dark:text-darkTheme-secondary-muted lg:hidden">
            Shop
          </Link>
        </div>

        <div className={`flex flex-1 ${activeTab === "seller" || activeTab === "broker" ? "items-start" : "items-center"} justify-center py-5 sm:py-10`}>
          <div className={`w-full ${activeTab === "seller" || activeTab === "broker" ? "max-w-[640px]" : "max-w-[420px]"}`}>
            <div className="mb-5 text-center sm:mb-7">
              <Image
                src="/images/logo/logo.png"
                alt="XerinMarket"
                width={52}
                height={52}
                className="mx-auto mb-3 h-12 w-12 object-contain sm:mb-4 sm:h-14 sm:w-14"
              />
              <h1 className="mb-1.5 text-2xl font-bold text-dark dark:text-white sm:font-semibold">{headings[activeTab].title}</h1>
              <p className="text-sm text-dark-4 dark:text-darkTheme-secondary-muted">{headings[activeTab].subtitle}</p>
            </div>

            {activeTab === "signin" && <SignInPanel onSwitchTab={setActiveTab} />}
            {activeTab === "signup" && <SignUpPanel onSwitchTab={setActiveTab} />}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pb-1 text-[11px] text-dark-4 dark:text-darkTheme-secondary-muted sm:gap-4 sm:text-xs">
          <Link href="/help" className="hover:text-dark dark:hover:text-white">Help Center</Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-dark dark:hover:text-white">Terms</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-dark dark:hover:text-white">Privacy</Link>
          <span>•</span>
          <span>© {new Date().getFullYear()} XerinMarket</span>
        </div>
      </div>

      {/* Right panel: marketing / imagery */}
      <div className="hidden lg:block relative overflow-hidden bg-dark">
        <Image src="/images/bg6-dark.jpg" alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        <div className="relative h-full flex flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="inline-flex items-center gap-2.5 w-fit">
            <Image src="/images/logo/logo.png" alt="XerinMarket" width={32} height={32} className="object-contain" />
            <span className="font-semibold text-lg text-white">XerinMarket</span>
          </Link>

          <div className="max-w-md">
            <h2 className="font-bold text-3xl xl:text-4xl text-white leading-tight mb-4">
              The marketplace built for Africa
            </h2>
            <p className="text-white/80 leading-relaxed mb-9">
              Browse seller listings, review checkout options, and manage marketplace orders in one platform.
            </p>
            <ul className="space-y-5">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="flex items-start gap-3.5">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-white shrink-0">
                    {feature.icon}
                  </span>
                  <div>
                    <p className="font-semibold text-white text-sm">{feature.title}</p>
                    <p className="text-white/70 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-6 text-white/80 text-sm">
            <span className="flex items-center gap-1.5">
              <UsersIcon />
              Seller marketplace
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-yellow-400">
                <StarIcon />
              </span>
              Backend-sourced reviews
            </span>
            <span>Live order records</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export const SignupAuth = () => <AuthPage initialTab="signup" />;
const Signin = () => <AuthPage initialTab="signin" />;

export default Signin;
