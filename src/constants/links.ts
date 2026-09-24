export const ROUTES = {
  home: "/",
  shop: "/shop-with-sidebar",
  productDetails: (id: string | number) => `/products/${id}`,
  cart: "/cart",
  wishlist: "/wishlist",
  checkout: "/checkout",
  signin: "/signin",
  adminLogin: "/admin/login",
  signup: "/signup",
  account: "/account",
  contact: "/contact",


  trackOrder: "/track",
  returnsRefunds: "/contact",
  helpCenter: "/contact",
  sellerRegister: "/seller/register",

  // Future routes
  sellerDashboard: "/seller/dashboard",
  sellerKyc: "/seller/kyc",
  sellerProducts: "/seller/products",

  adminDashboard: "/admin/dashboard",
  adminSellerApprovals: "/admin/sellers/approvals",
  adminProductModeration: "/admin/products/moderation",
  adminDisputes: "/admin/disputes",
  adminFinance: "/admin/finance",
} as const;

export const APP_LINKS = {
  // Empty until the iOS app listing is live; the footer hides this button.
  appStore: "",
  googlePlay: "https://play.google.com/store/apps/details?id=com.xerinmarket.com&pcampaignid=web_share",
} as const;

export const SOCIAL_LINKS = {
  // Empty until the official social pages are confirmed; hidden in the footer.
  facebook: "",
  twitter: "",
  instagram: "",
  linkedin: "",
} as const;

export const PAYMENT_LINKS = {
  visa: "#",
  paypal: "#",
  mastercard: "#",
  applePay: "#",
  googlePay: "#",
} as const;

export const CONTACT_LINKS = {
  supportEmail: "mailto:support@xerinmarketplace.com",
  supportPage: "/contact",
} as const;
