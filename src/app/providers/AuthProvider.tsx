"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { authStorage } from "@/lib/auth/storage";

type AuthUser = {
  id?: string;
  email?: string;
  account_type?: string;
  roles?: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthContextValue>(() => {
    const accessToken = authStorage.getAccessToken();
    const user = authStorage.getUser<AuthUser>();

    return {
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      logout: () => authStorage.clearSession(),
    };
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};
