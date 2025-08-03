import { memo } from "react";
import { type PostItColor } from "@/lib/types";
import { POST_IT_COLORS, COLOR_STYLES } from "@/lib/constants";

interface ColorPaletteProps {
  selectedColor: PostItColor;
  onColorSelect: (color: PostItColor) => void;
}

export const ColorPalette = memo<ColorPaletteProps>(({ 
  selectedColor, 
  onColorSelect 
}) => {
  // green은 개구리 전용이므로 일반 색상 선택에서 제외
  const availableColors = POST_IT_COLORS.filter(color => color !== 'green');
  
  return (
    <div className="flex gap-2">
      {availableColors.map((color) => (
        <button
          key={color}
          className={`
            w-6 h-6 rounded border-2 
            ${COLOR_STYLES[color]} 
            ${selectedColor === color ? "ring-2 ring-gray-500" : ""} 
            hover:scale-110 transition-transform
          `}
          onClick={() => onColorSelect(color)}
          aria-label={`${color} 색상 선택`}
        />
      ))}
    </div>
  );
});

ColorPalette.displayName = "ColorPalette";