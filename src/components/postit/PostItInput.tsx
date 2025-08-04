import { memo, useState, useCallback, useMemo, useEffect } from "react";
import { type PostItColor, type PostItType } from "@/lib/types";
import { ColorPalette } from "@/components/ui/ColorPalette";
import { 
  COLOR_STYLES, 
  POST_IT_BACKGROUNDS, 
  POST_IT_BORDERS, 
  SHADOW_STYLES,
  APP_CONFIG,
  FROG_EMOJIS
} from "@/lib/constants";
import { getRandomRotation } from "@/lib/utils/rotation";
import { getDynamicTextStyleWithLinks } from "@/lib/utils/text-sizing";

interface PostItInputProps {
  selectedColor: PostItColor;
  onColorSelect: (color: PostItColor) => void;
  onAddTodo: (text: string, color: PostItColor, type?: PostItType) => void;
  isFrogModeActive?: boolean;
  onFrogModeComplete?: () => void;
}

export const PostItInput = memo<PostItInputProps>(({ 
  selectedColor, 
  onColorSelect, 
  onAddTodo,
  isFrogModeActive = false,
  onFrogModeComplete,
}) => {
  const [text, setText] = useState("");
  const [randomRotation] = useState(() => 
    getRandomRotation(APP_CONFIG.ROTATION_RANGE.INPUT)
  );

  // 외부에서 개구리 모드가 활성화되면 개구리 모드로 전환
  useEffect(() => {
    if (isFrogModeActive) {
      // 개구리 모드 활성화 시 자동으로 플레이스홀더 텍스트로 포커스
    }
  }, [isFrogModeActive]);
  
  // 텍스트 길이에 따른 동적 스타일 계산 (링크 고려)
  const textStyle = useMemo(() => getDynamicTextStyleWithLinks(text), [text]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      if (isFrogModeActive) {
        onAddTodo(text.trim(), 'green', 'frog');
        onFrogModeComplete?.();
      } else {
        onAddTodo(text.trim(), selectedColor, 'normal');
      }
      setText("");
    }
  }, [text, selectedColor, onAddTodo, isFrogModeActive, onFrogModeComplete]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  const currentColor = isFrogModeActive ? 'green' : selectedColor;
  const postItStyle = {
    transform: `rotate(${randomRotation}deg)`,
    boxShadow: SHADOW_STYLES.LIGHT,
    background: POST_IT_BACKGROUNDS[currentColor],
    border: `2px solid ${POST_IT_BORDERS[currentColor]}`,
    borderRadius: "2px",
  };

  return (
    <div
      className={`
        w-32 h-32 border-2 p-2 
        ${COLOR_STYLES[currentColor]} 
        hover:scale-105 transition-transform
      `}
      style={postItStyle}
    >
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        <div className="flex justify-between items-center">
          {!isFrogModeActive && (
            <ColorPalette
              selectedColor={selectedColor}
              onColorSelect={onColorSelect}
            />
          )}
          {isFrogModeActive && (
            <div className="flex items-center gap-1">
              <span className="text-lg">{FROG_EMOJIS.NORMAL}</span>
              <span className="text-xs text-gray-600">개구리 모드</span>
            </div>
          )}
        </div>
        <input
          value={text}
          onChange={handleTextChange}
          placeholder={isFrogModeActive ? "🐸 가장 중요한 일..." : "새 할일..."}
          className="flex-1 resize-none border-none outline-none bg-transparent mt-2 text-postit placeholder:text-postit placeholder:opacity-70"
          style={{
            fontSize: textStyle.fontSize,
            lineHeight: textStyle.lineHeight,
          }}
          maxLength={APP_CONFIG.MAX_TODO_LENGTH}
          autoFocus={isFrogModeActive}
        />
      </form>
    </div>
  );
});

PostItInput.displayName = "PostItInput";