export type ApiQueryValue = string | number | boolean | null | undefined;

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, ApiQueryValue>;
  auth?: boolean;
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

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
const AUTH_STORAGE_KEY = "xerin_auth_session";

const buildUrl = (path: string, query?: Record<string, ApiQueryValue>) => {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${safePath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

export const getStoredAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) return null;

    const session = JSON.parse(rawSession);
    return session?.access_token ?? null;
  } catch {
    return null;
  }
};

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  const hasJson = contentType?.includes("application/json");

  if (hasJson) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
};

const request = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const { body, query, auth = true, headers, ...fetchOptions } = options;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const token = auth ? getStoredAccessToken() : null;

  const requestHeaders: HeadersInit = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(buildUrl(path, query), {
    ...fetchOptions,
    headers: requestHeaders,
    body: isFormData ? (body as BodyInit) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message?: unknown }).message)
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
};

export const apiClient = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

export { AUTH_STORAGE_KEY };
