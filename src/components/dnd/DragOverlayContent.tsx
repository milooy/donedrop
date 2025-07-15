import { memo } from "react";
import { DragOverlay } from "@dnd-kit/core";
import { type Todo } from "@/hooks/useSupabaseData";
import { COLOR_STYLES } from "@/lib/constants";

interface DragOverlayContentProps {
  activeTodo: Todo | null;
}

export const DragOverlayContent = memo<DragOverlayContentProps>(({ activeTodo }) => (
  <DragOverlay>
    {activeTodo && (
      <div
        className={`
          w-32 h-32 border-2 p-2 cursor-grabbing 
          transform rotate-3 shadow-lg
          ${COLOR_STYLES[activeTodo.color]}
        `}
      >
        <div className="text-sm">{activeTodo.text}</div>
      </div>
    )}
  </DragOverlay>
));

DragOverlayContent.displayName = "DragOverlayContent";