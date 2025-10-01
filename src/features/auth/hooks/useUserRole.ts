"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "./useCurrentUser";

export type UserRole = "advertiser" | "influencer" | null;

export const useUserRole = () => {
  const { user, isAuthenticated } = useCurrentUser();

  const { data: role, isLoading } = useQuery<UserRole>({
    queryKey: ["userRole", user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) return null;

      const response = await fetch(`/api/auth/profile`);
      if (!response.ok) return null;

      const data = await response.json();
      return data.role || null;
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    role,
    isLoading,
    isAdvertiser: role === "advertiser",
    isInfluencer: role === "influencer",
  };
};
