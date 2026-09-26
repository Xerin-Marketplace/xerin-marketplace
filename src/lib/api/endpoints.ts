export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.xerinmarketplace.com/api/v1";

// Server-side rendering can't fetch same-origin paths like "/backend-api" —
// resolve those to the private backend origin instead.
export const API_SERVER_BASE_URL =
  API_BASE_URL.startsWith("/") && typeof window === "undefined"
    ? `${process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000"}/api/v1`
    : API_BASE_URL;

export const API_DOCS_URL =
  process.env.NEXT_PUBLIC_API_DOCS_URL || `${API_BASE_URL}/docs`;

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    google: "/auth/google",
    register: "/auth/register",
    registerSeller: "/auth/register-seller",
    registerBroker: "/auth/register-broker",
    onboardSeller: "/auth/onboard-seller",
    onboardBroker: "/auth/onboard-broker",
    selectInitialRole: "/auth/select-initial-role",
    logout: "/auth/logout",
    refreshToken: "/auth/refresh-token",
    sendOtp: "/auth/send-otp",
    verifyOtp: "/auth/verify-otp",
    resendVerification: "/auth/resend-verification",
    verifyAccountOtp: "/auth/verify-account-otp",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/change-password",
    sessions: "/auth/sessions",
    recognizeCurrentSession: "/auth/sessions/current/recognize",
    revokeOtherSessions: "/auth/sessions/revoke-others",
    unrecognizedLogin: "/auth/security/unrecognized-login",
  },

  users: {
    me: "/users/me",
    addresses: "/addresses",
    addressById: (id: string | number) => `/addresses/${id}`,
    setDefaultAddress: (id: string | number) => `/addresses/${id}/default`,
    confirmMapPin: (id: string | number) => `/addresses/${id}/confirm-map-pin`,
  },

  sellers: {
    register: "/sellers/register",
    businessCategories: "/admin/business-categories",
    me: "/sellers/me",
    profile: "/sellers/profile",
    kycDocuments: "/sellers/kyc-documents",
    kycStatus: "/sellers/kyc-status",
    payoutAccounts: "/sellers/payout-accounts",
    payoutAccountById: (id: string | number) => `/sellers/payout-accounts/${id}`,
  },

  brokers: {
    me: "/brokers/me",
    kycStatus: "/brokers/kyc-status",
    kycDocuments: "/brokers/kyc-documents",
    submitKyc: "/brokers/submit-kyc",
    admin: "/brokers/admin",
  },

  products: {
    list: "/products",
    byId: (id: string | number) => `/products/${id}`,
    myProducts: "/products/my-products",
    categories: "/products/categories",
    brands: "/products/brands",
    images: (productId: string | number) => `/products/${productId}/images`,
    variants: (productId: string | number) => `/products/${productId}/variants`,
    tags: (productId: string | number) => `/products/${productId}/tags`,
  },
} as const;
