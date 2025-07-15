import { memo, useState, useCallback, useMemo } from "react";
import { type PostItColor } from "@/hooks/useSupabaseData";
import { ColorPalette } from "@/components/ui/ColorPalette";
import { 
  COLOR_STYLES, 
  POST_IT_BACKGROUNDS, 
  POST_IT_BORDERS, 
  SHADOW_STYLES,
  APP_CONFIG 
} from "@/lib/constants";
import { getRandomRotation } from "@/lib/utils/rotation";
import { getDynamicTextStyleWithLinks } from "@/lib/utils/text-sizing";

interface PostItInputProps {
  selectedColor: PostItColor;
  onColorSelect: (color: PostItColor) => void;
  onAddTodo: (text: string, color: PostItColor) => void;
}

export const PostItInput = memo<PostItInputProps>(({ 
  selectedColor, 
  onColorSelect, 
  onAddTodo 
}) => {
  const [text, setText] = useState("");
  const [randomRotation] = useState(() => 
    getRandomRotation(APP_CONFIG.ROTATION_RANGE.INPUT)
  );
  
  // 텍스트 길이에 따른 동적 스타일 계산 (링크 고려)
  const textStyle = useMemo(() => getDynamicTextStyleWithLinks(text), [text]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTodo(text.trim(), selectedColor);
      setText("");
    }
  }, [text, selectedColor, onAddTodo]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  }, []);

  const postItStyle = {
    transform: `rotate(${randomRotation}deg)`,
    boxShadow: SHADOW_STYLES.LIGHT,
    background: POST_IT_BACKGROUNDS[selectedColor],
    border: `2px solid ${POST_IT_BORDERS[selectedColor]}`,
    borderRadius: "2px",
  };

  return (
    <div
      className={`
        w-32 h-32 border-2 p-2 
        ${COLOR_STYLES[selectedColor]} 
        hover:scale-105 transition-transform
      `}
      style={postItStyle}
    >
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        <ColorPalette
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
        />
        <input
          value={text}
          onChange={handleTextChange}
          placeholder="새 할일..."
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