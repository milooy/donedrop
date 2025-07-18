import { type RitualGem } from "@/lib/types";

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환 (로컬 시간대 기준)
 */
export const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 두 날짜 사이의 일수 차이를 계산
 */
const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 현재 스트릭 계산 (오늘부터 역순으로 연속 완료일 계산)
 * 보석이 있는 날 = 모든 리추얼을 완료한 날
 */
export const calculateCurrentStreak = (gems: RitualGem[]): number => {
  if (gems.length === 0) return 0;

  let streak = 0;
  let currentDate = getTodayString();

  // 보석들을 날짜별로 Set에 저장 (빠른 검색을 위해)
  const gemDates = new Set(gems.map(gem => gem.date));

  // 오늘부터 역순으로 확인
  while (true) {
    if (gemDates.has(currentDate)) {
      streak++;
      // 다음 날짜로 이동 (하루 전)
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() - 1);
      currentDate = nextDate.toISOString().split('T')[0];
    } else {
      // 보석이 없으면 스트릭 중단
      break;
    }
    
    // 너무 오래된 날짜까지는 확인하지 않음 (365일 제한)
    if (streak >= 365) break;
  }

  return streak;
};

/**
 * 최고 스트릭 계산 (전체 기록에서 가장 긴 연속 완료일)
 * 보석이 있는 날 = 모든 리추얼을 완료한 날
 */
export const calculateBestStreak = (gems: RitualGem[]): number => {
  if (gems.length === 0) return 0;

  // 날짜별로 정렬
  const sortedGems = gems
    .map(gem => gem.date)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  let bestStreak = 0;
  let currentStreak = 0;
  let lastDate: string | null = null;

  for (const date of sortedGems) {
    // 첫 번째 날짜이거나 연속된 날짜인 경우
    if (!lastDate || getDaysDifference(lastDate, date) === 1) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      // 연속되지 않으면 새로운 스트릭 시작
      currentStreak = 1;
      bestStreak = Math.max(bestStreak, currentStreak);
    }
    lastDate = date;
  }

  return bestStreak;
};

/**
 * 오늘 보석이 있는지 확인 (모든 리추얼 완료 여부)
 */
export const hasGemToday = (gems: RitualGem[]): boolean => {
  const today = getTodayString();
  return gems.some(gem => gem.date === today);
};