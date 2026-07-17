import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  login as apiLogin,
  registerBuyer as apiRegisterBuyer,
  registerSeller as apiRegisterSeller,
  logout as apiLogout,
  sendOtp as apiSendOtp,
  verifyOtp as apiVerifyOtp,
  forgotPassword as apiForgotPassword,
  resetPassword as apiResetPassword,
} from "@/lib/api/endpoints/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { authStorage } from "@/lib/auth/storage";
import { authCookies } from "@/lib/auth/cookies";
import { isAdminUser, isSellerUser } from "@/guards/permissions";
import type { AuthTokenResponse } from "@/types/api/auth";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const storeSetSession = useAuthStore((state) => state.setSession);
  const storeClearSession = useAuthStore((state) => state.clearSession);

  const syncRoleCookies = (session: AuthTokenResponse) => {
    const sessionUser = session.user ?? null;

    authCookies.setAuth();

    if (isAdminUser(sessionUser)) {
      authCookies.setAdmin();
    } else {
      authCookies.clearAdmin();
    }

    if (isSellerUser(sessionUser)) {
      authCookies.setSeller();
    } else {
      authCookies.clearSeller();
    }
  };

  const setSession = (session: AuthTokenResponse) => {
    authStorage.setSession(session);
    syncRoleCookies(session);
    storeSetSession(session);
  };

  const clearSession = () => {
    authStorage.clearSession();
    authCookies.clearAll();
    storeClearSession();
  };

  const loginMutation = useMutation({
    mutationFn: apiLogin,
    onSuccess: (data) => {
      setSession(data);
      const user = data.user;
      if (isAdminUser(user)) {
        router.push("/admin/dashboard");
      } else if (isSellerUser(user)) {
        router.push("/seller/dashboard");
      } else {
        router.push("/account");
      }
    },
  });

  const registerBuyerMutation = useMutation({
    mutationFn: apiRegisterBuyer,
    onSuccess: (data) => {
      setSession(data);
      router.push("/account");
    },
  });

  const registerSellerMutation = useMutation({
    mutationFn: apiRegisterSeller,
    onSuccess: (data) => {
      setSession(data);
      router.push("/seller/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        if (refreshToken) {
          await apiLogout({ refresh_token: refreshToken });
        }
      } finally {
        clearSession();
        queryClient.clear();
        router.push("/signin");
      }
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: apiSendOtp,
  });

  const verifyOtpMutation = useMutation({
    mutationFn: apiVerifyOtp,
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: apiForgotPassword,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: apiResetPassword,
  });

  return {
    user,
    accessToken,
    isAuthenticated,
    
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    registerBuyer: registerBuyerMutation.mutateAsync,
    isRegisteringBuyer: registerBuyerMutation.isPending,
    registerBuyerError: registerBuyerMutation.error,

    registerSeller: registerSellerMutation.mutateAsync,
    isRegisteringSeller: registerSellerMutation.isPending,
    registerSellerError: registerSellerMutation.error,

    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,

    sendOtp: sendOtpMutation.mutateAsync,
    isSendingOtp: sendOtpMutation.isPending,

    verifyOtp: verifyOtpMutation.mutateAsync,
    isVerifyingOtp: verifyOtpMutation.isPending,

    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSubmittingForgotPassword: forgotPasswordMutation.isPending,

    resetPassword: resetPasswordMutation.mutateAsync,
    isSubmittingResetPassword: resetPasswordMutation.isPending,
    setSession,
    refreshSession: () => {},
  };
};
export default useAuth;
