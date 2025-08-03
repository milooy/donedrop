import { memo, useState, useCallback, useMemo } from "react";
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
  canAddFrog?: boolean;
}

export const PostItInput = memo<PostItInputProps>(({ 
  selectedColor, 
  onColorSelect, 
  onAddTodo,
  canAddFrog = true
}) => {
  const [text, setText] = useState("");
  const [isFrogMode, setIsFrogMode] = useState(false);
  const [randomRotation] = useState(() => 
    getRandomRotation(APP_CONFIG.ROTATION_RANGE.INPUT)
  );
  
  // 텍스트 길이에 따른 동적 스타일 계산 (링크 고려)
  const textStyle = useMemo(() => getDynamicTextStyleWithLinks(text), [text]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      if (isFrogMode) {
        onAddTodo(text.trim(), 'green', 'frog');
        setIsFrogMode(false);
      } else {
        onAddTodo(text.trim(), selectedColor, 'normal');
      }
      setText("");
    }
  }, [text, selectedColor, onAddTodo, isFrogMode]);

  const handleToggleFrogMode = useCallback(() => {
    setIsFrogMode(!isFrogMode);
  }, [isFrogMode]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  const currentColor = isFrogMode ? 'green' : selectedColor;
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
          {!isFrogMode && (
            <ColorPalette
              selectedColor={selectedColor}
              onColorSelect={onColorSelect}
            />
          )}
          {isFrogMode && (
            <div className="flex items-center gap-1">
              <span className="text-lg">{FROG_EMOJIS.NORMAL}</span>
              <span className="text-xs text-gray-600">개구리 모드</span>
            </div>
          )}
          {canAddFrog && (
            <button
              type="button"
              onClick={handleToggleFrogMode}
              className={`text-lg hover:scale-110 transition-transform cursor-pointer ${
                isFrogMode ? 'ring-2 ring-green-500 rounded' : ''
              }`}
              aria-label="개구리 모드 토글 (Eat the frog first!)"
              title="개구리 모드 토글 (Eat the frog first!)"
            >
              {FROG_EMOJIS.NORMAL}
            </button>
          )}
          {!canAddFrog && (
            <div className="text-lg opacity-50" title="오늘은 이미 개구리 포스트잇을 만들었습니다">
              {FROG_EMOJIS.NORMAL}
            </div>
          )}
        </div>
        <input
          value={text}
          onChange={handleTextChange}
          placeholder={isFrogMode ? "🐸 가장 중요한 일..." : "새 할일..."}
          className="flex-1 resize-none border-none outline-none bg-transparent mt-2 text-postit placeholder:text-postit placeholder:opacity-70"
          style={{
            fontSize: textStyle.fontSize,
            lineHeight: textStyle.lineHeight,
          }}
          maxLength={APP_CONFIG.MAX_TODO_LENGTH}
        />
      </form>
    </div>
  );
});

PostItInput.displayName = "PostItInput";