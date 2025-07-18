import { useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";

export const useStreakData = (user: User | null) => {
  return useQuery({
    queryKey: ["streakData", user?.id],
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

export const useInvalidateStreakData = (user: User | null) => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["streakData", user?.id] });
  };
};
