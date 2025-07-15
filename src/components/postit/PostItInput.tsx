import { memo, useState, useCallback } from "react";
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
          className="flex-1 resize-none border-none outline-none bg-transparent text-sm mt-2"
          maxLength={APP_CONFIG.MAX_TODO_LENGTH}
        />
      </form>
    </div>
  );
});

PostItInput.displayName = "PostItInput";