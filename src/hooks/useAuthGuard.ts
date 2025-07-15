import { useEffect } from "react";
import { User } from "@supabase/supabase-js";

/**
 * 인증 가드 훅
 * 인증되지 않은 사용자를 홈으로 리다이렉트
 */
export const useAuthGuard = (user: User | null, loading: boolean) => {
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/";
    }
  }, [user, loading]);

  return { isAuthenticated: !!user, isLoading: loading };
};