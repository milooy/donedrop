import { getTodayString } from '@/lib/utils/streak';
import type { Ritual, RitualCompleteLog } from '@/lib/types';
import { User } from '@supabase/supabase-js';
import { useToggleRitual, useInsertRitualGem, useUpsertRitualCompletion } from './queries/useRituals';
import { useInvalidateStreakData } from './queries/useStreakData';

export const useRitualLogic = (
  user: User | null,
  rituals: Ritual[],
  ritualCompleteLogs: RitualCompleteLog[],
  showModal: (rituals: Ritual[]) => void
) => {
  const toggleRitualMutation = useToggleRitual(user);
  const insertRitualGemMutation = useInsertRitualGem(user);
  const upsertRitualCompletionMutation = useUpsertRitualCompletion(user);
  const invalidateStreakData = useInvalidateStreakData(user);

  const formatDateString = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTodayCompletedRitualIds = (logs: RitualCompleteLog[], today: string): number[] => {
    const todayLogs = logs.filter(log => formatDateString(log.completedAt) === today);
    return [...new Set(todayLogs.map(log => log.ritualId))];
  };

  const hasCompletedAllRitualsToday = (
    logs: RitualCompleteLog[],
    activeRituals: Ritual[],
    today: string
  ): boolean => {
    if (activeRituals.length === 0) return false;
    
    const todayCompletedIds = getTodayCompletedRitualIds(logs, today);
    const activeRitualIds = activeRituals.map(r => r.id);
    return activeRitualIds.every(id => todayCompletedIds.includes(id));
  };

  const toggleRitual = async (ritualId: number) => {
    const today = getTodayString();
    const todayCompletedIds = getTodayCompletedRitualIds(ritualCompleteLogs, today);
    const isCompleted = todayCompletedIds.includes(ritualId);

    await toggleRitualMutation.mutateAsync({ ritualId, isCompleted });

    if (!isCompleted) {
      const activeRituals = rituals.filter(r => r.isActive);
      const updatedCompletedIds = [...todayCompletedIds, ritualId];
      const activeRitualIds = activeRituals.map(r => r.id);

      const isNowAllCompleted = activeRitualIds.length > 0 && 
        activeRitualIds.every(id => updatedCompletedIds.includes(id));

      if (isNowAllCompleted) {
        const hadCompletedAllToday = hasCompletedAllRitualsToday(ritualCompleteLogs, activeRituals, today);

        if (!hadCompletedAllToday) {
          showModal(activeRituals);
          
          await insertRitualGemMutation.mutateAsync(today);
          await upsertRitualCompletionMutation.mutateAsync({ 
            date: today, 
            completedRitualIds: activeRitualIds 
          });
          
          invalidateStreakData();
        }
      }
    }
  };

  const today = getTodayString();
  const todayCompletedRitualIds = getTodayCompletedRitualIds(ritualCompleteLogs, today);

  return {
    toggleRitual,
    todayCompletedRitualIds,
  };
};