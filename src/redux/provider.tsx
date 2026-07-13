"use client";

import React from "react";
import { Provider } from "react-redux";
import AuthBootstrap from "@/components/Auth/AuthBootstrap";
import { store } from "./store";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthBootstrap>{children}</AuthBootstrap>
    </Provider>
  );
}
