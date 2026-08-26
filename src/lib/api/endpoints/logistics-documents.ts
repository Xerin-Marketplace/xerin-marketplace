import axiosInstance from "../client";
import type {
  LogisticsCompanyDocument,
  LogisticsDocumentRequirements,
  LogisticsDocumentType,
  PaginatedLogisticsDocuments,
} from "@/types/api/logistics-documents";

const ROOT = "/logistics/me/documents";

export const logisticsDocumentsApi = {
  requirements: async () =>
    (await axiosInstance.get<LogisticsDocumentRequirements>(`${ROOT}/requirements`)).data,

  list: async (includeHistory = false) =>
    (
      await axiosInstance.get<PaginatedLogisticsDocuments>(ROOT, {
        params: { page: 1, page_size: 100, include_history: includeHistory },
      })
    ).data,

  create: async (payload: {
    document_type: LogisticsDocumentType;
    document_name?: string;
    file: File;
  }) => {
    const form = new FormData();
    form.append("document_type", payload.document_type);
    if (payload.document_name?.trim()) {
      form.append("document_name", payload.document_name.trim());
    }
    form.append("file", payload.file);
    return (await axiosInstance.post<LogisticsCompanyDocument>(ROOT, form)).data;
  },

  update: async (
    documentId: string,
    payload: { document_name?: string; file?: File },
  ) => {
    const form = new FormData();
    if (payload.document_name?.trim()) {
      form.append("document_name", payload.document_name.trim());
    }
    if (payload.file) form.append("file", payload.file);
    return (
      await axiosInstance.put<LogisticsCompanyDocument>(
        `${ROOT}/${documentId}`,
        form,
      )
    ).data;
  },

  remove: async (documentId: string) =>
    (await axiosInstance.delete(`${ROOT}/${documentId}`)).data,

  viewBlob: async (documentId: string) =>
    (
      await axiosInstance.get<Blob>(`${ROOT}/${documentId}/view`, {
        responseType: "blob",
      })
    ).data,
};
