import type { AuthTokenResponse } from "@/types/api/auth";

const ACCESS_TOKEN_KEY = "xerin_access_token";
const REFRESH_TOKEN_KEY = "xerin_refresh_token";
const USER_KEY = "xerin_user";

const isBrowser = typeof window !== "undefined";

export const authStorage = {
  setSession: (session: AuthTokenResponse) => {
    if (!isBrowser) return;

    localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);

    if (session.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
    }

    if (session.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    }
  },

  getAccessToken: () => {
    if (!isBrowser) return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: () => {
    if (!isBrowser) return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  clearSession: () => {
    if (!isBrowser) return;

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
