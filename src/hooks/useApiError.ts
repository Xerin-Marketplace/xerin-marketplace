import { ApiError } from "@/lib/api/client";

export const useApiError = () => {
  return (error: unknown) => {
    if (error instanceof ApiError) return error.message;
    if (error instanceof Error) return error.message;
    return "Unexpected error";
  };
};
