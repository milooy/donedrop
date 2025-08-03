import { useMemo } from "react";
import { type Todo } from "@/lib/types";

/**
 * 할일 정렬 로직을 위한 커스텀 훅
 * 개구리가 최우선, 핀된 할일이 다음, 그 다음은 생성 시간 순으로 정렬
 */
export const useTodoSorting = (todos: Todo[]) => {
  return useMemo(() => {
    return [...todos].sort((a, b) => {
      // 0. 개구리가 최우선 (핀보다도 앞에)
      if (a.type === 'frog' && b.type !== 'frog') return -1;
      if (a.type !== 'frog' && b.type === 'frog') return 1;
      
      // 1. 핀된 것들끼리는 pinnedAt 기준 최신순
      if (a.isPinned && b.isPinned) {
        return (b.pinnedAt || 0) - (a.pinnedAt || 0);
      }
      // 2. 핀된 것이 일반 것보다 앞에
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // 3. 둘 다 핀 안된 것들은 생성일 기준 최신순
      return b.createdAt - a.createdAt;
    });
  }, [todos]);
};