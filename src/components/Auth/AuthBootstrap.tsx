"use client";

import { ReactNode, useEffect } from "react";
import { useDispatch } from "react-redux";
import { authStorage } from "@/lib/auth/storage";
import { setSession, setTokens } from "@/redux/features/auth-slice";

type AuthBootstrapProps = {
  children: ReactNode;
};

export default function AuthBootstrap({ children }: AuthBootstrapProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    const session = authStorage.getSession();

    if (!session?.access_token) return;

    if (session.user?.id) {
      dispatch(
        setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          token_type: session.token_type,
          user: {
            ...session.user,
            id: String(session.user.id),
          },
        })
      );

      return;
    }

    dispatch(
      setTokens({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        token_type: session.token_type,
      })
    );
  }, [dispatch]);

  return <>{children}</>;
}
