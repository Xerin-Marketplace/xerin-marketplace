import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { toApiError } from "./errors";
import { useAuthStore } from "@/store/useAuthStore";
import { API_BASE_URL } from "./endpoints";
import { announceSessionExpired } from "@/lib/reliability/runtime-events";
import { authStorage } from "@/lib/auth/storage";

let isRefreshing = false;
type RefreshQueueItem = { resolve: (token: string | null) => void; reject: (error: unknown) => void };
type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };
let failedQueue: RefreshQueueItem[] = [];
let axiosInstance: AxiosInstance;

const expireSession = () => {
  // Keep both auth persistence layers in sync. Some legacy dashboard code still
  // reads authStorage directly while newer code reads the Zustand auth store.
  authStorage.clearSession();
  useAuthStore.getState().clearSession();
  announceSessionExpired();
};

const persistRefreshedTokens = (accessToken: string, refreshToken?: string) => {
  const state = useAuthStore.getState();
  const nextRefreshToken = refreshToken || state.refreshToken || authStorage.getRefreshToken() || undefined;

  state.setTokens({
    access_token: accessToken,
    refresh_token: nextRefreshToken,
  });

  // Preserve the currently cached user while replacing the tokens used by
  // components that still call authStorage.getAccessToken()/getSession().
  const storedSession = authStorage.getSession();
  const user = state.user ?? storedSession?.user ?? authStorage.getUser();
  authStorage.setSession({
    access_token: accessToken,
    refresh_token: nextRefreshToken,
    token_type: "bearer",
    ...(user ? { user } : {}),
  });
};

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (instance: AxiosInstance) => {
  axiosInstance = instance;

  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().accessToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (config.headers && !config.headers["X-Request-ID"]) {
        const requestId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        config.headers["X-Request-ID"] = requestId;
      }
      return config;
    },
    (error) => Promise.reject(toApiError(error)),
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryConfig | undefined;
      const apiError = toApiError(error);
      const status = apiError.status;

      if (!originalRequest) return Promise.reject(apiError);

      if (status === 401 && !originalRequest._retry) {
        if (originalRequest.url === "/auth/refresh-token" || originalRequest.url?.includes("/auth/login")) {
          expireSession();
          return Promise.reject(apiError);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (token) {
                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          expireSession();
          isRefreshing = false;
          if (typeof window !== "undefined" && window.location.pathname !== "/signin") {
            window.location.assign("/signin");
          }
          return Promise.reject(apiError);
        }

        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refresh_token: refreshToken,
          }, {
            timeout: 10_000,
          });

          const { access_token, refresh_token } = res.data;
          if (!access_token) {
            throw new Error("Refresh response did not include an access token");
          }

          persistRefreshedTokens(access_token, refresh_token);

          processQueue(null, access_token);
          isRefreshing = false;

          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          expireSession();
          isRefreshing = false;
          if (typeof window !== "undefined") {
            window.location.href = "/signin";
          }
          return Promise.reject(apiError);
        }
      }

      return Promise.reject(apiError);
    }
  );
};
