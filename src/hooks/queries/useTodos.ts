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
import type { Todo, PostItColor, PostItType, TodoStatus, TodoUpdate } from "@/lib/types";

// Todos query keys
const todosKeys = createQueryKeys("todos", {
  list: (userId: string) => [userId],
  inbox: (userId: string) => [userId],
  completed: (userId: string) => [userId],
});

// 공통 에러 체크 함수
const requireUser = (user: User | null): string => {
  if (!user) throw new Error("User not authenticated");
  return user.id;
};

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
      type = 'normal',
    }: {
      text: string;
      color: PostItColor;
      type?: PostItType;
    }) => {
      const userId = requireUser(user);

      const newTodo = {
        id: Date.now(),
        text,
        color,
        type,
        status: "active" as TodoStatus,
        isPinned: false,
        createdAt: Date.now(),
      };

      return insertTodo(newTodo, userId);
    },
    onMutate: async ({ text, color, type = 'normal' }) => {
      const userId = user?.id || '';
      await queryClient.cancelQueries({ queryKey: todosKeys.list(userId).queryKey });
      
      const previousTodos = queryClient.getQueryData<Todo[]>(todosKeys.list(userId).queryKey);
      
      const optimisticTodo: Todo = {
        id: Date.now(),
        text,
        color,
        type,
        status: "active" as TodoStatus,
        isPinned: false,
        createdAt: Date.now(),
      };
      
      queryClient.setQueryData<Todo[]>(
        todosKeys.list(userId).queryKey,
        old => old ? [...old, optimisticTodo] : [optimisticTodo]
      );
      
      return { previousTodos };
    },
    onError: (err, variables, context) => {
      const userId = user?.id || '';
      if (context?.previousTodos) {
        queryClient.setQueryData(todosKeys.list(userId).queryKey, context.previousTodos);
      }
    },
    onSettled: () => {
      const userId = user?.id || '';
      queryClient.invalidateQueries({ queryKey: todosKeys.list(userId).queryKey });
    },
  });
};

export const useAddInboxTodo = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      text,
      color,
      type = 'normal',
    }: {
      text: string;
      color: PostItColor;
      type?: PostItType;
    }) => {
      const userId = requireUser(user);

      const newTodo = {
        id: Date.now(),
        text,
        color,
        type,
        status: "inbox" as TodoStatus,
        isPinned: false,
        createdAt: Date.now(),
      };

      return insertInboxTodo(newTodo, userId);
    },
    onMutate: async ({ text, color, type = 'normal' }) => {
      const userId = user?.id || '';
      await queryClient.cancelQueries({ queryKey: todosKeys.inbox(userId).queryKey });
      
      const previousTodos = queryClient.getQueryData<Todo[]>(todosKeys.inbox(userId).queryKey);
      
      const optimisticTodo: Todo = {
        id: Date.now(),
        text,
        color,
        type,
        status: "inbox" as TodoStatus,
        isPinned: false,
        createdAt: Date.now(),
      };
      
      queryClient.setQueryData<Todo[]>(
        todosKeys.inbox(userId).queryKey,
        old => old ? [...old, optimisticTodo] : [optimisticTodo]
      );
      
      return { previousTodos };
    },
    onError: (err, variables, context) => {
      const userId = user?.id || '';
      if (context?.previousTodos) {
        queryClient.setQueryData(todosKeys.inbox(userId).queryKey, context.previousTodos);
      }
    },
    onSettled: () => {
      const userId = user?.id || '';
      queryClient.invalidateQueries({ queryKey: todosKeys.inbox(userId).queryKey });
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
      updates: TodoUpdate;
    }) => {
      const userId = requireUser(user);
      return updateTodo(todoId, updates, userId);
    },
    onMutate: async ({ todoId, updates }) => {
      const userId = user?.id || '';
      await queryClient.cancelQueries({ queryKey: todosKeys.list(userId).queryKey });
      
      const previousTodos = queryClient.getQueryData<Todo[]>(todosKeys.list(userId).queryKey);
      
      queryClient.setQueryData<Todo[]>(
        todosKeys.list(userId).queryKey,
        old => old?.map(todo => 
          todo.id === todoId ? { ...todo, ...updates } : todo
        ) || []
      );
      
      return { previousTodos };
    },
    onError: (err, variables, context) => {
      const userId = user?.id || '';
      if (context?.previousTodos) {
        queryClient.setQueryData(todosKeys.list(userId).queryKey, context.previousTodos);
      }
    },
    onSettled: () => {
      const userId = user?.id || '';
      queryClient.invalidateQueries({ queryKey: todosKeys.list(userId).queryKey });
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
      updates: TodoUpdate;
    }) => {
      const userId = requireUser(user);
      return updateInboxTodo(todoId, updates, userId);
    },
    onMutate: async ({ todoId, updates }) => {
      const userId = user?.id || '';
      await queryClient.cancelQueries({ queryKey: todosKeys.inbox(userId).queryKey });
      
      const previousTodos = queryClient.getQueryData<Todo[]>(todosKeys.inbox(userId).queryKey);
      
      queryClient.setQueryData<Todo[]>(
        todosKeys.inbox(userId).queryKey,
        old => old?.map(todo => 
          todo.id === todoId ? { ...todo, ...updates } : todo
        ) || []
      );
      
      return { previousTodos };
    },
    onError: (err, variables, context) => {
      const userId = user?.id || '';
      if (context?.previousTodos) {
        queryClient.setQueryData(todosKeys.inbox(userId).queryKey, context.previousTodos);
      }
    },
    onSettled: () => {
      const userId = user?.id || '';
      queryClient.invalidateQueries({ queryKey: todosKeys.inbox(userId).queryKey });
    },
  });
};

export const useDeleteTodo = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoId: number) => {
      const userId = requireUser(user);
      return deleteTodo(todoId, userId);
    },
    onMutate: async (todoId) => {
      const userId = user?.id || '';
      await queryClient.cancelQueries({ queryKey: todosKeys.list(userId).queryKey });
      
      const previousTodos = queryClient.getQueryData<Todo[]>(todosKeys.list(userId).queryKey);
      
      queryClient.setQueryData<Todo[]>(
        todosKeys.list(userId).queryKey,
        old => old?.filter(todo => todo.id !== todoId) || []
      );
      
      return { previousTodos };
    },
    onError: (err, todoId, context) => {
      const userId = user?.id || '';
      if (context?.previousTodos) {
        queryClient.setQueryData(todosKeys.list(userId).queryKey, context.previousTodos);
      }
    },
    onSettled: () => {
      const userId = user?.id || '';
      queryClient.invalidateQueries({ queryKey: todosKeys.list(userId).queryKey });
    },
  });
};

export const useDeleteInboxTodo = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoId: number) => {
      const userId = requireUser(user);
      return deleteInboxTodo(todoId, userId);
    },
    onMutate: async (todoId) => {
      const userId = user?.id || '';
      await queryClient.cancelQueries({ queryKey: todosKeys.inbox(userId).queryKey });
      
      const previousTodos = queryClient.getQueryData<Todo[]>(todosKeys.inbox(userId).queryKey);
      
      queryClient.setQueryData<Todo[]>(
        todosKeys.inbox(userId).queryKey,
        old => old?.filter(todo => todo.id !== todoId) || []
      );
      
      return { previousTodos };
    },
    onError: (err, todoId, context) => {
      const userId = user?.id || '';
      if (context?.previousTodos) {
        queryClient.setQueryData(todosKeys.inbox(userId).queryKey, context.previousTodos);
      }
    },
    onSettled: () => {
      const userId = user?.id || '';
      queryClient.invalidateQueries({ queryKey: todosKeys.inbox(userId).queryKey });
    },
  });
};

export const useCompleteTodo = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoId: number) => {
      const userId = requireUser(user);
      return moveTodoToCompleted(todoId, userId);
    },
    onSuccess: () => {
      const userId = user?.id || '';
      queryClient.invalidateQueries({ queryKey: todosKeys.list(userId).queryKey });
      queryClient.invalidateQueries({ queryKey: todosKeys.inbox(userId).queryKey });
      queryClient.invalidateQueries({ queryKey: todosKeys.completed(userId).queryKey });
    },
  });
};

export const useMoveToInbox = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoId: number) => {
      const userId = requireUser(user);
      return moveTodoToInbox(todoId, userId);
    },
    onSuccess: () => {
      const userId = user?.id || '';
      queryClient.invalidateQueries({ queryKey: todosKeys.list(userId).queryKey });
      queryClient.invalidateQueries({ queryKey: todosKeys.inbox(userId).queryKey });
    },
  });
};

export const useMoveToMain = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoId: number) => {
      const userId = requireUser(user);
      return moveTodoToMain(todoId, userId);
    },
    onSuccess: () => {
      const userId = user?.id || '';
      queryClient.invalidateQueries({ queryKey: todosKeys.list(userId).queryKey });
      queryClient.invalidateQueries({ queryKey: todosKeys.inbox(userId).queryKey });
    },
  });
};

export const useArchiveCompletedTodos = (user: User | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const userId = requireUser(user);
      return archiveCompletedTodos(userId);
    },
    onSuccess: () => {
      const userId = user?.id || '';
      queryClient.invalidateQueries({ queryKey: todosKeys.completed(userId).queryKey });
    },
  });
};
