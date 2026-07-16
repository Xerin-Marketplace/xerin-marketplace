import axiosInstance from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiMessageResponse, ID } from "@/types/api/common";
import type {
  Address,
  AddressRequest,
  PaginatedAddressResponse,
  UpdateUserRequest,
  User,
} from "@/types/api/user";

export const getMe = async (): Promise<User> => {
  const res = await axiosInstance.get<User>(API_ENDPOINTS.users.me);
  return res.data;
};

export const updateMe = async (payload: UpdateUserRequest): Promise<User> => {
  const res = await axiosInstance.patch<User>(API_ENDPOINTS.users.me, payload);
  return res.data;
};

export const getAddresses = async (): Promise<Address[]> => {
  const res = await axiosInstance.get<PaginatedAddressResponse | Address[]>(
    API_ENDPOINTS.users.addresses
  );

  if (Array.isArray(res.data)) {
    return res.data;
  }

  return res.data.results;
};

export const createAddress = async (payload: AddressRequest): Promise<Address> => {
  const res = await axiosInstance.post<Address>(API_ENDPOINTS.users.addresses, payload);
  return res.data;
};

export const updateAddress = async (
  id: ID,
  payload: AddressRequest
): Promise<Address> => {
  const res = await axiosInstance.patch<Address>(
    API_ENDPOINTS.users.addressById(id),
    payload
  );

  return res.data;
};

export const deleteAddress = async (id: ID): Promise<ApiMessageResponse> => {
  const res = await axiosInstance.delete<ApiMessageResponse>(
    API_ENDPOINTS.users.addressById(id)
  );

  return res.data;
};

export const usersApi = {
  getMe,
  updateMe,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
