import { User } from "@supabase/supabase-js";

/**
 * 사용자 관련 유틸리티 함수들
 */

/**
 * 사용자 표시 이름 반환
 */
export const getUserDisplayName = (user: User | null): string => {
  return user?.user_metadata?.full_name || user?.email || "사용자";
};

/**
 * 사용자 아바타 URL 반환
 */
export const getUserAvatar = (user: User | null): string | null => {
  return user?.user_metadata?.avatar_url || null;
};

/**
 * 사용자 이니셜 반환
 */
export const getUserInitial = (user: User | null): string => {
  return getUserDisplayName(user).charAt(0).toUpperCase();
};

/**
 * 사용자 이름 (성 제외) 반환
 */
export const getUserFirstName = (user: User | null): string => {
  return getUserDisplayName(user).split(" ")[0];
};