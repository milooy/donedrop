import { memo, useCallback, useMemo } from "react";
import { type Todo } from "@/lib/types";
import { DraggablePostIt } from "@/components/dnd/DraggablePostIt";
import { EditableText } from "@/components/ui/EditableText";
import { usePostItActions } from "@/hooks/usePostItActions";
import {
  COLOR_STYLES,
  FROG_EMOJIS,
} from "@/lib/constants";
import { getMainPostItRotation } from "@/lib/utils/rotation";
import { getDynamicTextStyleWithLinks } from "@/lib/utils/text-sizing";
import { createPostItStyle, createPinButtonClasses, BUTTON_STYLES } from "./PostItStyles";

interface PostItItemProps {
  todo: Todo;
  hasOtherCompletedTodos?: boolean;
}

export const PostItItem = memo<PostItItemProps>(
  ({ todo, hasOtherCompletedTodos = false }) => {
    const rotation = getMainPostItRotation(todo.id);
    const { handleTogglePin, handleDelete, handleEditText, stopPropagation } = usePostItActions(todo);

    const textStyle = useMemo(
      () => getDynamicTextStyleWithLinks(todo.text),
      [todo.text]
    );

    const getFrogEmoji = useCallback(() => {
      if (todo.type !== "frog") return null;
      if (hasOtherCompletedTodos) return FROG_EMOJIS.SAD;
      return FROG_EMOJIS.NORMAL;
    }, [todo.type, hasOtherCompletedTodos]);

    const postItStyle = createPostItStyle(todo, rotation);
    const pinButtonClasses = createPinButtonClasses(todo.isPinned);

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
          {/* Pin 버튼 - 개구리는 제외 */}
          {todo.type !== 'frog' && (
            <button
              className={pinButtonClasses}
              onClick={handleTogglePin}
              onPointerDown={stopPropagation}
              aria-label={todo.isPinned ? "핀 해제" : "핀 고정"}
            >
              {todo.isPinned ? "📌" : "📍"}
            </button>
          )}

          {todo.type === "frog" && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-center">
                <span
                  className={`text-2xl leading-none ${
                    hasOtherCompletedTodos ? "animate-pulse" : "animate-bounce"
                  }`}
                >
                  {getFrogEmoji()}
                </span>
              </div>
              <EditableText
                text={todo.text}
                onEdit={handleEditText}
                className="text-postit text-center"
                style={{
                  fontSize: textStyle.fontSize,
                  lineHeight: textStyle.lineHeight,
                }}
              />
            </div>
          )}
          {todo.type !== "frog" && (
            <EditableText
              text={todo.text}
              onEdit={handleEditText}
              className="text-postit"
              style={{
                fontSize: textStyle.fontSize,
                lineHeight: textStyle.lineHeight,
              }}
            />
          )}

          {/* 삭제 버튼 */}
          <button
            className={BUTTON_STYLES.delete}
            onClick={handleDelete}
            onPointerDown={stopPropagation}
            aria-label="할일 삭제"
          >
            ×
          </button>
        </div>
      </DraggablePostIt>
    );
  }
);

PostItItem.displayName = "PostItItem";
