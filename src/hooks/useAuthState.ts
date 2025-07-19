import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { supabase } from "@/lib/supabase";

const authKeys = createQueryKeys("auth", {
  user: null,
});

export const useAuthState = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading: loading } = useQuery({
    queryKey: authKeys.user.queryKey,
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    staleTime: 0, // 인증 상태는 항상 최신 상태 유지
    gcTime: 0, // 캐시하지 않음
  });

  const signInWithGoogleMutation = useMutation({
    mutationFn: async () => {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : `${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) throw error;
    },
    onError: (error) => {
      console.error("Error signing in:", error);
    },
  });

  const signInWithGitHubMutation = useMutation({
    mutationFn: async () => {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : `${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo },
      });

      if (error) throw error;
    },
    onError: (error) => {
      console.error("Error signing in with GitHub:", error);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
    },
    onError: (error) => {
      console.error("Error signing out:", error);
    },
  });

  // Auth state change 리스너 설정 (React Query와 별도로 실행)
  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      queryClient.setQueryData(authKeys.user.queryKey, session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return {
    user: user || null,
    loading,
    signInWithGoogle: signInWithGoogleMutation.mutate,
    signInWithGitHub: signInWithGitHubMutation.mutate,
    signOut: signOutMutation.mutate,
    isSigningIn:
      signInWithGoogleMutation.isPending || signInWithGitHubMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };
};
