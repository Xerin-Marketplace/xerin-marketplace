import axios from "axios";
import { ApiError } from "./client";
import { useAuthStore } from "@/store/useAuthStore";
import { API_BASE_URL } from "./endpoints";

let isRefreshing = false;
let failedQueue: any[] = [];
let axiosInstance: any;

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupInterceptors = (instance: any) => {
  axiosInstance = instance;

  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config: any) => {
      const token = useAuthStore.getState().accessToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error)
  );

  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config;

      // Extract error details
      const status = error.response?.status || 500;
      const data = error.response?.data;
      let message = error.message;

      if (data && typeof data === "object" && "detail" in data) {
        if (typeof data.detail === "string") {
          message = data.detail;
        } else if (Array.isArray(data.detail)) {
          message = data.detail
            .map((item: any) => item?.msg)
            .filter(Boolean)
            .join(", ") || message;
        }
      }

      const apiError = new ApiError(message, status, data);

      if (status === 401 && !originalRequest._retry) {
        if (originalRequest.url === "/auth/refresh-token" || originalRequest.url?.includes("/auth/login")) {
          useAuthStore.getState().clearSession();
          return Promise.reject(apiError);
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          useAuthStore.getState().clearSession();
          isRefreshing = false;
          return Promise.reject(apiError);
        }

        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = res.data;
          useAuthStore.getState().setTokens({
            access_token,
            refresh_token,
          });

          processQueue(null, access_token);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          useAuthStore.getState().clearSession();
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
