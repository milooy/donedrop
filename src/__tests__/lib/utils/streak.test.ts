import { 
  getTodayString, 
  calculateCurrentStreak, 
  calculateBestStreak, 
  hasGemToday 
} from '@/lib/utils/streak';
import type { RitualGem } from '@/lib/types';

describe('Streak Utils', () => {
  describe('getTodayString', () => {
    test('오늘 날짜를 YYYY-MM-DD 형식으로 반환해야 함', () => {
      const today = new Date();
      const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      expect(getTodayString()).toBe(expected);
    });

    test('반환되는 문자열이 항상 10자리여야 함', () => {
      const result = getTodayString();
      expect(result).toHaveLength(10);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('calculateCurrentStreak', () => {
    test('빈 보석 배열에서 스트릭은 0이어야 함', () => {
      expect(calculateCurrentStreak([])).toBe(0);
    });

    test('오늘만 보석이 있으면 스트릭은 1이어야 함', () => {
      const today = getTodayString();
      const gems: RitualGem[] = [
        { id: 1, userId: 'user1', date: today, createdAt: Date.now(), isArchived: false }
      ];
      
      expect(calculateCurrentStreak(gems)).toBe(1);
    });

    test('연속된 날짜의 보석들로 스트릭을 계산해야 함', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBefore = new Date(today);
      dayBefore.setDate(dayBefore.getDate() - 2);
      
      const gems: RitualGem[] = [
        { id: 1, userId: 'user1', date: today.toISOString().split('T')[0], createdAt: Date.now(), isArchived: false },
        { id: 2, userId: 'user1', date: yesterday.toISOString().split('T')[0], createdAt: Date.now(), isArchived: false },
        { id: 3, userId: 'user1', date: dayBefore.toISOString().split('T')[0], createdAt: Date.now(), isArchived: false }
      ];
      
      expect(calculateCurrentStreak(gems)).toBe(3);
    });

    test('중간에 빠진 날짜가 있으면 스트릭이 중단되어야 함', () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const gems: RitualGem[] = [
        { id: 1, userId: 'user1', date: today.toISOString().split('T')[0], createdAt: Date.now(), isArchived: false },
        { id: 2, userId: 'user1', date: threeDaysAgo.toISOString().split('T')[0], createdAt: Date.now(), isArchived: false }
      ];
      
      expect(calculateCurrentStreak(gems)).toBe(1);
    });

    test('오늘 보석이 없으면 스트릭은 0이어야 함', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const gems: RitualGem[] = [
        { id: 1, userId: 'user1', date: yesterday.toISOString().split('T')[0], createdAt: Date.now(), isArchived: false }
      ];
      
      expect(calculateCurrentStreak(gems)).toBe(0);
    });
  });

  describe('calculateBestStreak', () => {
    test('빈 보석 배열에서 최고 스트릭은 0이어야 함', () => {
      expect(calculateBestStreak([])).toBe(0);
    });

    test('하나의 보석만 있으면 최고 스트릭은 1이어야 함', () => {
      const gems: RitualGem[] = [
        { id: 1, userId: 'user1', date: '2024-01-01', createdAt: Date.now(), isArchived: false }
      ];
      
      expect(calculateBestStreak(gems)).toBe(1);
    });

    test('연속된 날짜들의 최고 스트릭을 계산해야 함', () => {
      const gems: RitualGem[] = [
        { id: 1, userId: 'user1', date: '2024-01-01', createdAt: Date.now(), isArchived: false },
        { id: 2, userId: 'user1', date: '2024-01-02', createdAt: Date.now(), isArchived: false },
        { id: 3, userId: 'user1', date: '2024-01-03', createdAt: Date.now(), isArchived: false },
        { id: 4, userId: 'user1', date: '2024-01-05', createdAt: Date.now(), isArchived: false },
        { id: 5, userId: 'user1', date: '2024-01-06', createdAt: Date.now(), isArchived: false }
      ];
      
      expect(calculateBestStreak(gems)).toBe(3);
    });

    test('분리된 여러 스트릭 중 최고를 찾아야 함', () => {
      const gems: RitualGem[] = [
        { id: 1, userId: 'user1', date: '2024-01-01', createdAt: Date.now(), isArchived: false },
        { id: 2, userId: 'user1', date: '2024-01-02', createdAt: Date.now(), isArchived: false },
        { id: 3, userId: 'user1', date: '2024-01-05', createdAt: Date.now(), isArchived: false },
        { id: 4, userId: 'user1', date: '2024-01-06', createdAt: Date.now(), isArchived: false },
        { id: 5, userId: 'user1', date: '2024-01-07', createdAt: Date.now(), isArchived: false },
        { id: 6, userId: 'user1', date: '2024-01-08', createdAt: Date.now(), isArchived: false }
      ];
      
      expect(calculateBestStreak(gems)).toBe(4);
    });

    test('순서가 뒤섞인 배열도 올바르게 처리해야 함', () => {
      const gems: RitualGem[] = [
        { id: 1, userId: 'user1', date: '2024-01-03', createdAt: Date.now(), isArchived: false },
        { id: 2, userId: 'user1', date: '2024-01-01', createdAt: Date.now(), isArchived: false },
        { id: 3, userId: 'user1', date: '2024-01-02', createdAt: Date.now(), isArchived: false }
      ];
      
      expect(calculateBestStreak(gems)).toBe(3);
    });
  });

  describe('hasGemToday', () => {
    test('빈 보석 배열에서 false를 반환해야 함', () => {
      expect(hasGemToday([])).toBe(false);
    });

    test('오늘 보석이 있으면 true를 반환해야 함', () => {
      const today = getTodayString();
      const gems: RitualGem[] = [
        { id: 1, userId: 'user1', date: today, createdAt: Date.now(), isArchived: false }
      ];
      
      expect(hasGemToday(gems)).toBe(true);
    });

    test('오늘 보석이 없으면 false를 반환해야 함', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const gems: RitualGem[] = [
        { id: 1, userId: 'user1', date: yesterday.toISOString().split('T')[0], createdAt: Date.now(), isArchived: false }
      ];
      
      expect(hasGemToday(gems)).toBe(false);
    });

    test('여러 날짜 중 오늘이 포함되어 있으면 true를 반환해야 함', () => {
      const today = getTodayString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const gems: RitualGem[] = [
        { id: 1, userId: 'user1', date: yesterday.toISOString().split('T')[0], createdAt: Date.now(), isArchived: false },
        { id: 2, userId: 'user1', date: today, createdAt: Date.now(), isArchived: false }
      ];
      
      expect(hasGemToday(gems)).toBe(true);
    });
  });
});