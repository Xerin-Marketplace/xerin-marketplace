export type AppRouteMeta = {
  path: string;
  auth?: boolean;
  roles?: string[];
};

export const routeConfig: Record<string, AppRouteMeta> = {
  home: { path: "/" },
  signin: { path: "/signin" },
  signup: { path: "/signup" },
  forgotPassword: { path: "/forgot-password" },
  resetPassword: { path: "/reset-password" },
  verifyOtp: { path: "/verify-otp" },
  sellerRegister: { path: "/seller/register" },
  brokerRegister: { path: "/broker/register" },
  brokerDashboard: { path: "/broker/dashboard", auth: true, roles: ["broker"] },
  sellerDashboard: { path: "/seller/dashboard", auth: true, roles: ["seller"] },
  adminDashboard: { path: "/admin/dashboard", auth: true, roles: ["admin", "super_admin"] },
};
