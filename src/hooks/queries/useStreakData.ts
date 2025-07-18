import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import { createQueryKeys } from "@lukemorales/query-key-factory";

// Streak data query keys
const streakDataKeys = createQueryKeys("streakData", {
  detail: (userId: string) => [userId],
});

export const useStreakData = (user: User | null) => {
  return useQuery({
    queryKey: streakDataKeys.detail(user?.id || '').queryKey,
    queryFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const response = await fetch(`/api/ritual-streak?userId=${user.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch streak data");
      }

      return response.json();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useInvalidateStreakData = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: streakDataKeys.detail._def });
  };
};
