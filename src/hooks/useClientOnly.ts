import { useState, useEffect } from "react";
import { getTodayString } from "@/lib/utils/date";

/**
 * 클라이언트 전용 상태 관리 훅
 * SSR/hydration 문제를 방지하기 위함
 */
export const useClientOnly = () => {
  const [isClient, setIsClient] = useState(false);
  const [todayString, setTodayString] = useState("");

  useEffect(() => {
    setIsClient(true);
    setTodayString(getTodayString());
  }, []);

  return { isClient, todayString };
};