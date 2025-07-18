import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import {
  fetchActiveTodos,
  fetchInboxTodos,
  fetchCompletedTodos,
  insertTodo,
  insertInboxTodo,
  updateTodo,
  updateInboxTodo,
  deleteTodo,
  deleteInboxTodo,
  moveTodoToCompleted,
  moveTodoToInbox,
  moveTodoToMain,
  archiveCompletedTodos,
} from "@/lib/remotes/supabase";
import type { Todo, PostItColor, TodoStatus } from "@/lib/types";

// Todos query keys
const todosKeys = createQueryKeys("todos", {
  list: (userId: string) => [userId],
  inbox: (userId: string) => [userId],
  completed: (userId: string) => [userId],
});

export const useTodos = (user: User | null) => {
  return useQuery({
    queryKey: todosKeys.list(user?.id || '').queryKey,
    queryFn: () => fetchActiveTodos(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useInboxTodos = (user: User | null) => {
  return useQuery({
    queryKey: todosKeys.inbox(user?.id || '').queryKey,
    queryFn: () => fetchInboxTodos(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useCompletedTodos = (user: User | null) => {
  return useQuery({
    queryKey: todosKeys.completed(user?.id || '').queryKey,
    queryFn: () => fetchCompletedTodos(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5분
  });
};

export const useAddTodo = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      text,
      color,
    }: {
      text: string;
      color: PostItColor;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const newTodo = {
        id: Date.now(),
        text,
        color,
        status: "active" as TodoStatus,
        isPinned: false,
        createdAt: Date.now(),
      };

      return insertTodo(newTodo, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.list._def });
    },
  });
};

export const useAddInboxTodo = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      text,
      color,
    }: {
      text: string;
      color: PostItColor;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const newTodo = {
        id: Date.now(),
        text,
        color,
        status: "inbox" as TodoStatus,
        isPinned: false,
        createdAt: Date.now(),
      };

      return insertInboxTodo(newTodo, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.inbox._def });
    },
  });
};

export const useUpdateTodo = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      todoId,
      updates,
    }: {
      todoId: number;
      updates: Partial<Todo>;
    }) => {
      if (!user) throw new Error("User not authenticated");
      return updateTodo(todoId, updates, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.list._def });
    },
  });
};

export const useUpdateInboxTodo = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      todoId,
      updates,
    }: {
      todoId: number;
      updates: Partial<Todo>;
    }) => {
      if (!user) throw new Error("User not authenticated");
      return updateInboxTodo(todoId, updates, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.inbox._def });
    },
  });
};

export const useDeleteTodo = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoId: number) => {
      if (!user) throw new Error("User not authenticated");
      return deleteTodo(todoId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.list._def });
    },
  });
};

export const useDeleteInboxTodo = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoId: number) => {
      if (!user) throw new Error("User not authenticated");
      return deleteInboxTodo(todoId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.inbox._def });
    },
  });
};

export const useCompleteTodo = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoId: number) => {
      if (!user) throw new Error("User not authenticated");
      return moveTodoToCompleted(todoId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.list._def });
      queryClient.invalidateQueries({ queryKey: todosKeys.inbox._def });
      queryClient.invalidateQueries({ queryKey: todosKeys.completed._def });
    },
  });
};

export const useMoveToInbox = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoId: number) => {
      if (!user) throw new Error("User not authenticated");
      return moveTodoToInbox(todoId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.list._def });
      queryClient.invalidateQueries({ queryKey: todosKeys.inbox._def });
    },
  });
};

export const useMoveToMain = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoId: number) => {
      if (!user) throw new Error("User not authenticated");
      return moveTodoToMain(todoId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.list._def });
      queryClient.invalidateQueries({ queryKey: todosKeys.inbox._def });
    },
  });
};

export const useArchiveCompletedTodos = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      return archiveCompletedTodos(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosKeys.completed._def });
    },
  });
};
