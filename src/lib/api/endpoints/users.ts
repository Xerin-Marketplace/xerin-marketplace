import axiosInstance from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { ApiMessageResponse, ID } from "@/types/api/common";
import type { Address, AddressRequest, UpdateUserRequest, User } from "@/types/api/user";

export const getMe = async (token?: string | null): Promise<User> => {
  const res = await axiosInstance.get<User>(API_ENDPOINTS.users.me);
  return res.data;
};

export const updateMe = async (payload: UpdateUserRequest, token?: string | null): Promise<User> => {
  const res = await axiosInstance.patch<User>(API_ENDPOINTS.users.me, payload);
  return res.data;
};

export const getAddresses = async (token?: string | null): Promise<Address[]> => {
  const res = await axiosInstance.get<Address[]>(API_ENDPOINTS.users.addresses);
  return res.data;
};

export const createAddress = async (payload: AddressRequest, token?: string | null): Promise<Address> => {
  const res = await axiosInstance.post<Address>(API_ENDPOINTS.users.addresses, payload);
  return res.data;
};

export const updateAddress = async (
  id: ID,
  payload: Partial<AddressRequest>,
  token?: string | null
): Promise<Address> => {
  const res = await axiosInstance.patch<Address>(API_ENDPOINTS.users.addressById(id), payload);
  return res.data;
};

export const deleteAddress = async (id: ID, token?: string | null): Promise<ApiMessageResponse> => {
  const res = await axiosInstance.delete<ApiMessageResponse>(API_ENDPOINTS.users.addressById(id));
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
