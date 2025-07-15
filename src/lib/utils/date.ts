// 날짜 관련 유틸리티 함수들

/**
 * 주어진 타임스탬프가 오늘 날짜인지 확인 (hydration-safe)
 */
export const isToday = (timestamp: number, currentDate: string): boolean => {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  return date.toDateString() === currentDate;
};

/**
 * 타임스탬프를 로케일 날짜 문자열로 변환
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString();
};

/**
 * 현재 날짜 문자열 반환
 */
export const getTodayString = (): string => {
  return new Date().toDateString();
};