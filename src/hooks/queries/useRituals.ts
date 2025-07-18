import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import {
  fetchRituals,
  fetchRitualCompleteLogs,
  fetchRitualGems,
  fetchRitualCompletions,
  insertRitual,
  updateRitual,
  deleteRitual,
  insertRitualCompleteLog,
  deleteRitualCompleteLog,
  insertRitualGem,
  upsertRitualCompletion,
  archiveRitualGems,
  archiveRitualCompletions,
} from "@/lib/remotes/supabase";
import type { Ritual } from "@/lib/types";

export const useRituals = (user: User | null) => {
  return useQuery({
    queryKey: ["rituals", user?.id],
    queryFn: () => fetchRituals(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useRitualCompleteLogs = (user: User | null) => {
  return useQuery({
    queryKey: ["ritualCompleteLogs", user?.id],
    queryFn: () => fetchRitualCompleteLogs(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useRitualGems = (user: User | null) => {
  return useQuery({
    queryKey: ["ritualGems", user?.id],
    queryFn: () => fetchRitualGems(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useRitualCompletions = (user: User | null) => {
  return useQuery({
    queryKey: ["ritualCompletions", user?.id],
    queryFn: () => fetchRitualCompletions(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useAddRitual = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      orderIndex,
    }: {
      name: string;
      orderIndex: number;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const newRitual = {
        id: Date.now(),
        name,
        orderIndex,
        isActive: true,
        createdAt: Date.now(),
      };

      return insertRitual(newRitual, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rituals", user?.id] });
    },
  });
};

export const useUpdateRitual = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ritualId,
      updates,
    }: {
      ritualId: number;
      updates: Partial<Ritual>;
    }) => {
      if (!user) throw new Error("User not authenticated");
      return updateRitual(ritualId, updates, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rituals", user?.id] });
    },
  });
};

export const useDeleteRitual = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ritualId: number) => {
      if (!user) throw new Error("User not authenticated");
      return deleteRitual(ritualId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rituals", user?.id] });
    },
  });
};

export const useToggleRitual = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ritualId,
      isCompleted,
    }: {
      ritualId: number;
      isCompleted: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");

      if (isCompleted) {
        return deleteRitualCompleteLog(ritualId, user.id);
      } else {
        return insertRitualCompleteLog(ritualId, user.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ritualCompleteLogs", user?.id],
      });
    },
  });
};

export const useInsertRitualGem = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (date: string) => {
      if (!user) throw new Error("User not authenticated");
      return insertRitualGem(date, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ritualGems", user?.id] });
    },
  });
};

export const useUpsertRitualCompletion = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      date,
      completedRitualIds,
    }: {
      date: string;
      completedRitualIds: number[];
    }) => {
      if (!user) throw new Error("User not authenticated");
      return upsertRitualCompletion(user.id, date, completedRitualIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ritualCompletions", user?.id],
      });
    },
  });
};

export const useArchiveRitualGems = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      return archiveRitualGems(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ritualGems", user?.id] });
    },
  });
};

export const useArchiveRitualCompletions = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      return archiveRitualCompletions(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ritualCompletions", user?.id],
      });
    },
  });
};
