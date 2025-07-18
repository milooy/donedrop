import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import { fetchUserSettings, upsertUserSettings } from "@/lib/remotes/supabase";
import type { PostItColor } from "@/lib/types";

export const useUserSettings = (user: User | null) => {
  return useQuery({
    queryKey: ["userSettings", user?.id],
    queryFn: () => fetchUserSettings(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useUpdateUserSettings = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      selected_color?: PostItColor;
      inbox_selected_color?: PostItColor;
      coins?: number;
    }) => {
      if (!user) throw new Error("User not authenticated");
      return upsertUserSettings(user.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings", user?.id] });
    },
  });
};
