"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { authStorage } from "@/lib/auth/storage";
import {
  clearSession as clearReduxSession,
  setSession as setReduxSession,
  setTokens as setReduxTokens,
} from "@/redux/features/auth-slice";
import type { AuthTokenResponse } from "@/types/api/auth";

type AuthUser = {
  id?: string | number;
  email?: string;
  account_type?: string;
  roles?: string[];
  [key: string]: unknown;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (session: AuthTokenResponse) => void;
  refreshSession: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const applySession = useCallback(
    (session: AuthTokenResponse) => {
      const sessionUser = session.user as AuthUser | undefined;

      setAccessToken(session.access_token);
      setUser(sessionUser ?? null);

      if (sessionUser?.id) {
        dispatch(
          setReduxSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            token_type: session.token_type,
            user: {
              ...sessionUser,
              id: String(sessionUser.id),
            },
          })
        );

        return;
      }

      dispatch(
        setReduxTokens({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          token_type: session.token_type,
        })
      );
    },
    [dispatch]
  );

  const refreshSession = useCallback(() => {
    const session = authStorage.getSession();

    if (!session?.access_token) {
      setAccessToken(null);
      setUser(null);
      dispatch(clearReduxSession());
      return;
    }

    applySession(session);
  }, [applySession, dispatch]);

  const setSession = useCallback(
    (session: AuthTokenResponse) => {
      authStorage.setSession(session);
      applySession(session);
    },
    [applySession]
  );

  const logout = useCallback(() => {
    authStorage.clearSession();
    setAccessToken(null);
    setUser(null);
    dispatch(clearReduxSession());
  }, [dispatch]);

  useEffect(() => {
    refreshSession();

    const handleStorageChange = () => {
      refreshSession();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      setSession,
      refreshSession,
      logout,
    }),
    [user, accessToken, setSession, refreshSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};
