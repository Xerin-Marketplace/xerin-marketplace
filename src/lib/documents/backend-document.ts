import axiosInstance from "@/lib/api/client";
import { API_BASE_URL } from "@/lib/api/endpoints";

export const resolveBackendDocumentUrl = (value?: string | null) => {
  if (!value) return "";

  if (/^https?:\/\//i.test(value) || value.startsWith("blob:")) {
    return value;
  }

  try {
    const api = new URL(API_BASE_URL);

    if (value.startsWith("/")) {
      return `${api.origin}${value}`;
    }

    return `${api.origin}/${value.replace(/^\/+/, "")}`;
  } catch {
    return value;
  }
};

export const fetchBackendDocumentBlob = async (value: string) => {
  const url = resolveBackendDocumentUrl(value);

  const response = await axiosInstance.get<Blob>(url, {
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  });

  const contentType =
    response.headers["content-type"] ||
    response.data.type ||
    "application/pdf";

  const blob =
    response.data.type
      ? response.data
      : new Blob([response.data], { type: contentType });

  return {
    blobUrl: URL.createObjectURL(blob),
    contentType,
  };
};
