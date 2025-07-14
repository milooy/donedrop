"use client";

import { useEffect } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import LoginScreen from "@/components/LoginScreen";

export default function Home() {
  // Supabase 데이터 훅
  const { user, loading, signInWithGoogle } = useSupabaseData();

  // 인증된 사용자는 앱 페이지로 리다이렉트
  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/app';
    }
  }, [user, loading]);

  // 로딩 중인 경우
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 사용자에게 로그인 화면 표시
  if (!user) {
    return <LoginScreen onSignIn={signInWithGoogle} />;
  }

  // 인증된 사용자는 리다이렉트 되므로 빈 화면
  return null;
}
