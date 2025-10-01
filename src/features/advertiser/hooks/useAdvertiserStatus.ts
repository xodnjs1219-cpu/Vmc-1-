"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export type AdvertiserStatus = "verified" | "pending" | "failed" | "none";

export const useAdvertiserStatus = () => {
  const { user, isAuthenticated } = useCurrentUser();

  const { data, isLoading } = useQuery<{
    status: AdvertiserStatus;
    hasProfile: boolean;
  }>({
    queryKey: ["advertiserStatus", user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) {
        return { status: "none" as const, hasProfile: false };
      }

      const response = await fetch(`/api/advertiser/profile`);

      if (!response.ok) {
        return { status: "none" as const, hasProfile: false };
      }

      const data = await response.json();
      const verificationStatus = data.profile?.verificationStatus;

      return {
        status: verificationStatus || "none",
        hasProfile: !!data.profile,
      };
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    status: data?.status || "none",
    hasProfile: data?.hasProfile || false,
    isVerified: data?.status === "verified",
    isPending: data?.status === "pending",
    isFailed: data?.status === "failed",
    isLoading,
  };
};
