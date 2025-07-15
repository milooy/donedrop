import { type RitualCompletion, type Ritual } from "@/hooks/useSupabaseData";

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
 * 특정 날짜에 모든 활성 리추얼이 완료되었는지 확인
 */
const isAllRitualsCompleted = (
  completion: RitualCompletion,
  activeRituals: Ritual[]
): boolean => {
  if (activeRituals.length === 0) return false;
  
  return activeRituals.every(ritual => 
    completion.completedRitualIds.includes(ritual.id)
  );
};

/**
 * 현재 스트릭 계산 (오늘부터 역순으로 연속 완료일 계산)
 */
export const calculateCurrentStreak = (
  completions: RitualCompletion[],
  activeRituals: Ritual[]
): number => {
  if (activeRituals.length === 0) return 0;

  const today = getTodayString();
  const sortedCompletions = completions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let streak = 0;
  let currentDate = today;

  // 오늘부터 역순으로 확인
  for (let i = 0; i < sortedCompletions.length; i++) {
    const completion = sortedCompletions[i];
    
    // 현재 확인 중인 날짜와 완료 기록 날짜가 일치하는지 확인
    if (completion.date === currentDate) {
      // 모든 리추얼이 완료되었는지 확인
      if (isAllRitualsCompleted(completion, activeRituals)) {
        streak++;
        // 다음 날짜로 이동 (하루 전)
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() - 1);
        currentDate = nextDate.toISOString().split('T')[0];
      } else {
        // 모든 리추얼이 완료되지 않았으면 스트릭 중단
        break;
      }
    } else {
      // 연속되지 않은 날짜가 나오면 스트릭 중단
      const daysDiff = getDaysDifference(completion.date, currentDate);
      if (daysDiff > 1) break;
      
      // 하루 차이인 경우, 현재 날짜 업데이트하고 다시 확인
      currentDate = completion.date;
      i--; // 같은 completion을 다시 확인
    }
  }

  return streak;
};

/**
 * 최고 스트릭 계산 (전체 기록에서 가장 긴 연속 완료일)
 */
export const calculateBestStreak = (
  completions: RitualCompletion[],
  activeRituals: Ritual[]
): number => {
  if (activeRituals.length === 0) return 0;

  const sortedCompletions = completions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let bestStreak = 0;
  let currentStreak = 0;
  let lastDate: string | null = null;

  for (const completion of sortedCompletions) {
    // 모든 리추얼이 완료되었는지 확인
    if (isAllRitualsCompleted(completion, activeRituals)) {
      // 첫 번째 완료 날짜이거나 연속된 날짜인 경우
      if (!lastDate || getDaysDifference(lastDate, completion.date) === 1) {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        // 연속되지 않으면 새로운 스트릭 시작
        currentStreak = 1;
      }
      lastDate = completion.date;
    } else {
      // 모든 리추얼이 완료되지 않았으면 스트릭 리셋
      currentStreak = 0;
      lastDate = null;
    }
  }

  return bestStreak;
};

/**
 * 오늘 완료된 리추얼 ID 목록 반환
 */
export const getTodayCompletedRitualIds = (
  completions: RitualCompletion[]
): number[] => {
  const today = getTodayString();
  const todayCompletion = completions.find(c => c.date === today);
  return todayCompletion?.completedRitualIds || [];
};

/**
 * 모든 활성 리추얼이 오늘 완료되었는지 확인
 */
export const isAllRitualsCompletedToday = (
  completions: RitualCompletion[],
  activeRituals: Ritual[]
): boolean => {
  if (activeRituals.length === 0) return false;
  
  const todayCompletedIds = getTodayCompletedRitualIds(completions);
  return activeRituals.every(ritual => 
    todayCompletedIds.includes(ritual.id)
  );
};