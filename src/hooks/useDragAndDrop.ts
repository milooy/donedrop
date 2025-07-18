import { useState, useCallback } from "react";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { type Todo } from "@/lib/types";

interface UseDragAndDropProps {
  completeTodo: (todo: Todo, fromInbox?: boolean) => Promise<void>;
  moveToMain: (todo: Todo) => Promise<void>;
  moveToInbox: (todo: Todo) => Promise<void>;
}

export const useDragAndDrop = ({ 
  completeTodo, 
  moveToMain, 
  moveToInbox 
}: UseDragAndDropProps) => {
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveTodo(event.active.data.current?.todo as Todo);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTodo(null);

    if (!over) return;
    
    const draggedTodo = active.data.current?.todo as Todo;
    const fromArea = active.data.current?.from as "main" | "inbox";
    
    if (!draggedTodo || !fromArea) return;

    try {
      // 유리병으로 드래그 (완료 처리)
      if (over.id === "glass-jar") {
        await completeTodo(draggedTodo, fromArea === "inbox");
      }
      // 메인 보드로 드래그 (inbox → main)
      else if (over.id === "main-board" && fromArea === "inbox") {
        await moveToMain(draggedTodo);
      }
      // 인박스로 드래그 (main → inbox)
      else if (over.id === "inbox" && fromArea === "main") {
        await moveToInbox(draggedTodo);
      }
    } catch (error) {
      console.error("Drag and drop error:", error);
    }
  }, [completeTodo, moveToMain, moveToInbox]);

  return {
    activeTodo,
    handleDragStart,
    handleDragEnd,
  };
};