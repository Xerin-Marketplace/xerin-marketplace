import { apiClient } from "./client";
import { API_ENDPOINTS } from "./endpoints";
import type { ApiMessageResponse, ID } from "@/types/api/common";
import type { Address, AddressRequest, UpdateUserRequest, User } from "@/types/api/user";

export const usersApi = {
  getMe: (token?: string | null) =>
    apiClient<User>(API_ENDPOINTS.users.me, {
      method: "GET",
      token,
    }),

  updateMe: (payload: UpdateUserRequest, token?: string | null) =>
    apiClient<User>(API_ENDPOINTS.users.me, {
      method: "PATCH",
      token,
      body: payload,
    }),

  getAddresses: (token?: string | null) =>
    apiClient<Address[]>(API_ENDPOINTS.users.addresses, {
      method: "GET",
      token,
    }),

  createAddress: (payload: AddressRequest, token?: string | null) =>
    apiClient<Address>(API_ENDPOINTS.users.addresses, {
      method: "POST",
      token,
      body: payload,
    }),

  updateAddress: (id: ID, payload: Partial<AddressRequest>, token?: string | null) =>
    apiClient<Address>(API_ENDPOINTS.users.addressById(id), {
      method: "PATCH",
      token,
      body: payload,
    }),

  deleteAddress: (id: ID, token?: string | null) =>
    apiClient<ApiMessageResponse>(API_ENDPOINTS.users.addressById(id), {
      method: "DELETE",
      token,
    }),
};
