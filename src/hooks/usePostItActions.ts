import { useCallback } from "react";
import { useAuthState } from "./useAuthState";
import { useUpdateTodo, useDeleteTodo } from "./queries/useTodos";
import type { Todo, Timestamp } from "@/lib/types";

export const usePostItActions = (todo: Todo) => {
  const { user } = useAuthState();
  const updateTodoMutation = useUpdateTodo(user);
  const deleteTodoMutation = useDeleteTodo(user);

  const handleTogglePin = useCallback(() => {
    const updates = {
      isPinned: !todo.isPinned,
      pinnedAt: (!todo.isPinned ? Date.now() : undefined) as Timestamp | undefined,
    };
    updateTodoMutation.mutate({ todoId: todo.id, updates });
  }, [todo.id, todo.isPinned, updateTodoMutation]);

  const handleDelete = useCallback(() => {
    deleteTodoMutation.mutate(todo.id);
  }, [todo.id, deleteTodoMutation]);

  const handleEditText = useCallback((newText: string) => {
    updateTodoMutation.mutate({ 
      todoId: todo.id, 
      updates: { text: newText } 
    });
  }, [todo.id, updateTodoMutation]);

  const stopPropagation = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
  }, []);

  return {
    handleTogglePin,
    handleDelete,
    handleEditText,
    stopPropagation,
    isUpdating: updateTodoMutation.isPending,
    isDeleting: deleteTodoMutation.isPending,
  };
};