"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/hooks/useAuthState";
import LoginScreen from "@/components/LoginScreen";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function Home() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, signInWithGitHub } = useAuthState();

  useEffect(() => {
    if (!loading && user) {
      router.push("/board");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">리다이렉트 중...</p>
        </div>
      </div>
    );
  }

  return (
    <LoginScreen
      onSignIn={signInWithGoogle}
      onGitHubSignIn={signInWithGitHub}
    />
  );
}
