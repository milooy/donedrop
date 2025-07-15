import { memo } from "react";
import { useDroppable } from "@dnd-kit/core";

interface DroppableAreaProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const DroppableArea = memo<DroppableAreaProps>(({ 
  id, 
  children, 
  className = "" 
}) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        ${className} 
        ${isOver ? "ring-2 ring-blue-500 bg-blue-50" : ""}
      `}
    >
      {children}
    </div>
  );
});

DroppableArea.displayName = "DroppableArea";