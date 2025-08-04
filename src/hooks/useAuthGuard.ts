import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

/**
 * 인증 가드 훅
 * 인증되지 않은 사용자를 홈으로 리다이렉트
 */
export const useAuthGuard = (user: User | null, loading: boolean) => {
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  return { isAuthenticated: !!user, isLoading: loading };
};