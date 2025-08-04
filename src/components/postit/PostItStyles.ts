import {
  POST_IT_BACKGROUNDS,
  POST_IT_BORDERS,
  SHADOW_STYLES,
} from "@/lib/constants";
import type { Todo } from "@/lib/types";

export const createPostItStyle = (todo: Todo, rotation: number) => ({
  transform: `rotate(${rotation}deg)`,
  boxShadow: todo.isPinned ? SHADOW_STYLES.PINNED : SHADOW_STYLES.LIGHT,
  background: POST_IT_BACKGROUNDS[todo.color],
  border: `2px solid ${POST_IT_BORDERS[todo.color]}`,
  borderRadius: "2px",
});

export const BUTTON_STYLES = {
  pin: {
    base: "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer",
    pinned: "bg-red-500 text-white shadow-md scale-110",
    unpinned: "opacity-0 group-hover:opacity-100 bg-gray-300 text-gray-500 hover:bg-red-400 hover:text-white",
  },
  delete: "absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer opacity-0 group-hover:opacity-100",
} as const;

export const createPinButtonClasses = (isPinned: boolean) => `
  ${BUTTON_STYLES.pin.base}
  ${isPinned ? BUTTON_STYLES.pin.pinned : BUTTON_STYLES.pin.unpinned}
`.trim();