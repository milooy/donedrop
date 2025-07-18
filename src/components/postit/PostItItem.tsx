import { memo, useCallback, useMemo } from "react";
import { type Todo } from "@/lib/types";
import { DraggablePostIt } from "@/components/dnd/DraggablePostIt";
import { EditableText } from "@/components/ui/EditableText";
import { 
  COLOR_STYLES, 
  POST_IT_BACKGROUNDS, 
  POST_IT_BORDERS, 
  SHADOW_STYLES 
} from "@/lib/constants";
import { getMainPostItRotation } from "@/lib/utils/rotation";
import { getDynamicTextStyleWithLinks } from "@/lib/utils/text-sizing";

interface PostItItemProps {
  todo: Todo;
  onDelete: () => void;
  onTogglePin: () => void;
  onEditText: (newText: string) => void;
}

export const PostItItem = memo<PostItItemProps>(({ 
  todo, 
  onDelete, 
  onTogglePin, 
  onEditText 
}) => {
  const rotation = getMainPostItRotation(todo.id);
  
  // 텍스트 길이에 따른 동적 스타일 계산 (링크 고려)
  const textStyle = useMemo(() => getDynamicTextStyleWithLinks(todo.text), [todo.text]);

  const stopPropagation = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
  }, []);

  const postItStyle = {
    transform: `rotate(${rotation}deg)`,
    boxShadow: todo.isPinned ? SHADOW_STYLES.PINNED : SHADOW_STYLES.LIGHT,
    background: POST_IT_BACKGROUNDS[todo.color],
    border: `2px solid ${POST_IT_BORDERS[todo.color]}`,
    borderRadius: "2px",
  };

  const pinButtonClasses = `
    absolute -top-1 -right-1 w-6 h-6 rounded-full 
    flex items-center justify-center transition-all cursor-pointer
    ${todo.isPinned
      ? "bg-red-500 text-white shadow-md scale-110"
      : "opacity-0 group-hover:opacity-100 bg-gray-300 text-gray-500 hover:bg-red-400 hover:text-white"
    }
  `;

  const deleteButtonClasses = `
    absolute -bottom-1 -right-1 w-5 h-5 rounded-full 
    bg-red-500 text-white text-xs flex items-center justify-center 
    hover:bg-red-600 transition-all cursor-pointer 
    opacity-0 group-hover:opacity-100
  `;

  return (
    <DraggablePostIt todo={todo} from="main">
      <div
        className={`
          group relative w-32 h-32 border-2 p-2 
          ${COLOR_STYLES[todo.color]}
          cursor-grab active:cursor-grabbing 
          hover:scale-105 transition-transform
          ${todo.isPinned ? "shadow-lg" : ""}
        `}
        style={postItStyle}
      >
        {/* Pin 버튼 */}
        <button
          className={pinButtonClasses}
          onClick={onTogglePin}
          onPointerDown={stopPropagation}
          aria-label={todo.isPinned ? "핀 해제" : "핀 고정"}
        >
          {todo.isPinned ? "📌" : "📍"}
        </button>

        <EditableText
          text={todo.text}
          onEdit={onEditText}
          className="text-postit"
          style={{
            fontSize: textStyle.fontSize,
            lineHeight: textStyle.lineHeight,
          }}
        />

        {/* 삭제 버튼 */}
        <button
          className={deleteButtonClasses}
          onClick={onDelete}
          onPointerDown={stopPropagation}
          aria-label="할일 삭제"
        >
          ×
        </button>
      </div>
    </DraggablePostIt>
  );
});

PostItItem.displayName = "PostItItem";