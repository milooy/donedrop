import { memo } from "react";
import { type PostItColor } from "@/hooks/useSupabaseData";
import { POST_IT_COLORS, COLOR_STYLES } from "@/lib/constants";

interface ColorPaletteProps {
  selectedColor: PostItColor;
  onColorSelect: (color: PostItColor) => void;
}

export const ColorPalette = memo<ColorPaletteProps>(({ 
  selectedColor, 
  onColorSelect 
}) => (
  <div className="flex gap-2">
    {POST_IT_COLORS.map((color) => (
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
));

ColorPalette.displayName = "ColorPalette";