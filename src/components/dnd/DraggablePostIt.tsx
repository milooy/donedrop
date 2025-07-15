import { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { type Todo } from "@/hooks/useSupabaseData";

interface DraggablePostItProps {
  todo: Todo;
  children: React.ReactNode;
  from: "main" | "inbox";
}

export const DraggablePostIt = memo<DraggablePostItProps>(({ 
  todo, 
  children, 
  from 
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${from}-${todo.id}`,
    data: { todo, from },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
});

DraggablePostIt.displayName = "DraggablePostIt";