import { isAdminUser, isBrokerUser, isLogisticsUser, isSellerUser, type GuardUser } from "./permissions";

type AuthRoutingUser = GuardUser | Record<string, unknown> | null | undefined;

const isSafeInternalPath = (path?: string | null) => {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
};

const toGuardUser = (user?: AuthRoutingUser): GuardUser | null => {
  if (!user || typeof user !== "object") {
    return null;
  }

  return user as GuardUser;
};

export const getPostLoginPath = (
  requestedPath?: string | null,
  user?: AuthRoutingUser
) => {
  const guardUser = toGuardUser(user);

  if (isSafeInternalPath(requestedPath)) {
    const path = requestedPath as string;
    if (isLogisticsUser(guardUser)) {
      return path.startsWith("/logistics/") ? path : "/logistics/onboarding";
    }
    if (isSellerUser(guardUser)) {
      return path.startsWith("/seller/") ? path : "/seller/dashboard";
    }
    if (isBrokerUser(guardUser)) {
      return path.startsWith("/broker/") ? path : "/broker/dashboard";
    }
    if (isAdminUser(guardUser)) {
      return path.startsWith("/admin/") ? path : "/admin/dashboard";
    }
    if (path.startsWith("/seller/") || path.startsWith("/broker/") || path.startsWith("/admin/") || path.startsWith("/logistics/")) {
      return "/account";
    }
    return path;
  }

  if (isLogisticsUser(guardUser)) return "/logistics/onboarding";
  if (isBrokerUser(guardUser)) return "/broker/dashboard";

  if (isAdminUser(guardUser)) {
    return "/admin/dashboard";
  }

  if (isSellerUser(guardUser)) {
    return "/seller/dashboard";
  }

  return "/account";
};

export const getAccountHref = (
  isAuthenticated: boolean,
  user?: AuthRoutingUser
) => {
  if (!isAuthenticated) {
    return "/signin";
  }

  return getPostLoginPath(null, user);
};

export const getAccountLabel = (
  isAuthenticated: boolean,
  user?: AuthRoutingUser
) => {
  if (!isAuthenticated) {
    return "Sign In";
  }

  const guardUser = toGuardUser(user);

  if (isAdminUser(guardUser) || isSellerUser(guardUser) || isBrokerUser(guardUser) || isLogisticsUser(guardUser)) {
    return "Dashboard";
  }

  return "My Account";
};
