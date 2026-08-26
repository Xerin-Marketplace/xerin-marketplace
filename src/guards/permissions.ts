export type GuardUser = {
  account_type?: string;
  roles?: string[];
  permissions?: string[];
  is_seller?: boolean;
  seller_status?: string | null;
  is_broker?: boolean;
  broker_status?: string | null;
  role?: string;
};

const LOGISTICS_ACCOUNT_TYPES = ["logistics", "logistics_company"];
const LOGISTICS_ROLES = [
  "company_admin",
  "operations_manager",
  "dispatcher",
  "driver",
];
const LOGISTICS_PERMISSIONS = [
  "profile:manage",
  "users:manage",
  "zones:manage",
  "rates:manage",
  "pickups:manage",
  "shipments:manage",
  "integrations:manage",
  "dashboard:read",
];

export const getUserPermissions = (user?: GuardUser | null): string[] => {
  return user?.permissions ?? [];
};

export const getUserRoles = (user?: GuardUser | null): string[] => {
  return user?.roles ?? [];
};

export const hasPermission = (
  userOrPermissions: GuardUser | string[] | null | undefined,
  required?: string | null
): boolean => {
  if (!required) return true;

  const permissions = Array.isArray(userOrPermissions)
    ? userOrPermissions
    : getUserPermissions(userOrPermissions);

  return permissions.includes(required);
};

export const hasAllPermissions = (
  user: GuardUser | null | undefined,
  required: string[] = []
): boolean => {
  return required.every((permission) => hasPermission(user, permission));
};

export const hasAnyPermission = (
  user: GuardUser | null | undefined,
  required: string[] = []
): boolean => {
  if (required.length === 0) return true;
  return required.some((permission) => hasPermission(user, permission));
};

export const hasAnyRole = (
  user: GuardUser | null | undefined,
  requiredRoles: string[] = []
): boolean => {
  if (requiredRoles.length === 0) return true;

  const roles = getUserRoles(user);
  return requiredRoles.some((role) => roles.includes(role));
};

export const hasAnyAccountType = (
  user: GuardUser | null | undefined,
  accountTypes: string[] = []
): boolean => {
  if (accountTypes.length === 0) return true;
  if (!user?.account_type) return false;

  return accountTypes.includes(user.account_type);
};

export const hasSellerStatus = (
  user: GuardUser | null | undefined,
  sellerStatuses: string[] = []
): boolean => {
  if (sellerStatuses.length === 0) return true;
  if (!user?.seller_status) return false;

  return sellerStatuses.includes(user.seller_status);
};

export const isAdminUser = (user?: GuardUser | null): boolean => {
  if (!user) return false;

  if (
    hasAnyAccountType(user, ["admin", "super_admin"]) ||
    hasAnyRole(user, ["admin", "super_admin"])
  ) {
    return true;
  }

  // Logistics members have custom role names, but are not marketplace admins.
  if (isLogisticsUser(user)) return false;

  const basicRoles = new Set(["buyer", "customer", "seller", "broker"]);
  const roles = getUserRoles(user).map((role) => role.toLowerCase());

  // A custom non-marketplace role is a staff role. The backend still decides
  // what that staff user may actually view/do through permissions.
  return roles.some((role) => !basicRoles.has(role));
};

export const isSellerUser = (user?: GuardUser | null): boolean => {
  return Boolean(user?.is_seller) || hasAnyAccountType(user, ["seller"]) || hasAnyRole(user, ["seller"]);
};

export function isLogisticsUser(user?: GuardUser | null): boolean {
  if (!user) return false;
  if (hasAnyAccountType(user, LOGISTICS_ACCOUNT_TYPES)) return true;

  const roles = getUserRoles(user).map((role) => role.toLowerCase());
  if (roles.some((role) => LOGISTICS_ROLES.includes(role))) return true;

  // "viewer" is intentionally not enough by itself because other systems may
  // use that role. A logistics permission makes the membership unambiguous.
  return getUserPermissions(user).some((permission) =>
    LOGISTICS_PERMISSIONS.includes(permission.toLowerCase()),
  );
}


export const isBrokerUser = (user?: GuardUser | null) => {
  if (!user) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return Boolean(user.is_broker) || user.account_type === "broker" || roles.includes("broker") || user.role === "broker";
};
