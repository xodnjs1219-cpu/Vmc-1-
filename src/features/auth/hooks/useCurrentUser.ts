"use client";

import { useMemo } from "react";
import { useCurrentUserContext } from "../context/current-user-context";

export const useCurrentUser = () => {
  const context = useCurrentUserContext();

  return useMemo(
    () => ({
      user: context.user,
      status: context.status,
      isAuthenticated: context.isAuthenticated,
      isLoading: context.isLoading,
      refresh: context.refresh,
    }),
    [context.user, context.status, context.isAuthenticated, context.isLoading, context.refresh]
  );
};
