import { authStorage } from "@/lib/auth/storage";

export const tokenStorage = {
  getAccessToken: () => authStorage.getAccessToken(),
  getRefreshToken: () => authStorage.getRefreshToken(),
  clear: () => authStorage.clearSession(),
};
