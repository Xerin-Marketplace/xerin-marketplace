import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  is_verified?: boolean;
  status?: string;
  account_type?: string;
  is_seller?: boolean;
  seller_status?: string | null;
  roles?: string[];
  permissions?: string[];
};

export type AuthSession = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  user: AuthUser;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenType: "bearer",
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<AuthSession>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token ?? null;
      state.tokenType = action.payload.token_type ?? "bearer";
      state.isAuthenticated = true;
    },

    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload && state.accessToken);
    },

    setTokens: (
      state,
      action: PayloadAction<{
        access_token: string;
        refresh_token?: string;
        token_type?: string;
      }>
    ) => {
      state.accessToken = action.payload.access_token;
      state.refreshToken = action.payload.refresh_token ?? state.refreshToken;
      state.tokenType = action.payload.token_type ?? "bearer";
      state.isAuthenticated = Boolean(state.user);
    },

    clearSession: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenType = "bearer";
      state.isAuthenticated = false;
    },
  },
});

export const { setSession, setUser, setTokens, clearSession } = authSlice.actions;
export default authSlice.reducer;
