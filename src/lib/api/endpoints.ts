export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://187.124.32.94:8080";

export const API_DOCS_URL =
  process.env.NEXT_PUBLIC_API_DOCS_URL || `${API_BASE_URL}/docs`;

export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    registerSeller: "/auth/register-seller",
    logout: "/auth/logout",
    refreshToken: "/auth/refresh-token",
    sendOtp: "/auth/send-otp",
    verifyOtp: "/auth/verify-otp",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },

  users: {
    me: "/users/me",
    addresses: "/addresses",
    addressById: (id: string | number) => `/addresses/${id}`,
  },

  sellers: {
    register: "/sellers/register",
    me: "/sellers/me",
    kycDocuments: "/sellers/kyc-documents",
    payoutAccounts: "/sellers/payout-accounts",
    payoutAccountById: (id: string | number) => `/sellers/payout-accounts/${id}`,
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
