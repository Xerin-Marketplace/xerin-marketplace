import { authStorage } from "@/lib/auth/storage";
import type { AuthTokenResponse } from "@/types/api/auth";
import { API_BASE_URL } from "./endpoints";

export type ApiClientOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const buildUrl = (
  path: string,
  query?: ApiClientOptions["query"]
): string => {
  const base = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { access_token?: string; refresh_token?: string; user?: unknown };
    if (!data.access_token) return null;

    authStorage.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      user: data.user,
    } as AuthTokenResponse);

    return data.access_token;
  } catch {
    return null;
  }
};

const ensureValidToken = async (token: string | null | undefined): Promise<string | null> => {
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
    if (!payload.exp || payload.exp * 1000 > Date.now() + 60_000) {
      return token;
    }
  } catch {
    return token;
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = refreshAccessToken().finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

const parseResponse = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type");

  if (response.status === 204) {
    return null;
  }

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

export const apiClient = async <T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> => {
  const { token, body, query, headers, ...requestOptions } = options;

  const makeRequest = async (accessToken: string | null | undefined): Promise<Response> => {
    return fetch(buildUrl(path, query), {
      ...requestOptions,
      headers: {
        Accept: "application/json",
        ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body:
        body === undefined
          ? undefined
          : body instanceof FormData
            ? body
            : JSON.stringify(body),
    });
  };

  const validToken = await ensureValidToken(token);
  let response = await makeRequest(validToken);

  if (response.status === 401 && validToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await makeRequest(newToken);
    }
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      authStorage.clearSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    const message =
      typeof data === "object" &&
      data !== null &&
      "detail" in data
        ? typeof (data as { detail?: unknown }).detail === "string"
          ? (data as { detail: string }).detail
          : Array.isArray((data as { detail?: unknown }).detail)
            ? (data as { detail: Array<{ msg?: string }> }).detail
                .map((item) => item?.msg)
                .filter(Boolean)
                .join(", ") || `API request failed with status ${response.status}`
            : `API request failed with status ${response.status}`
        : `API request failed with status ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
};
