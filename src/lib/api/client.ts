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

  const response = await fetch(buildUrl(path, query), {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
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
