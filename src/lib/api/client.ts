import axios from "axios";
import { API_BASE_URL } from "./endpoints";
import { setupInterceptors } from "./interceptors";

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

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Initialize interceptors
setupInterceptors(axiosInstance);

export default axiosInstance;
