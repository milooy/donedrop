import { type PostItColor } from "@/hooks/useSupabaseData";

// 색상 관련 상수
export const POST_IT_COLORS: PostItColor[] = ["yellow", "pink", "blue"];

export const COLOR_STYLES = {
  yellow: "border-yellow-300 bg-yellow-100",
  pink: "border-pink-300 bg-pink-100",
  blue: "border-blue-300 bg-blue-100",
} as const;

export const GRAY_COLOR_STYLES = {
  yellow: "border-gray-300 bg-gray-100",
  pink: "border-gray-300 bg-gray-100",
  blue: "border-gray-300 bg-gray-100",
} as const;

// 포스트잇 배경색
export const POST_IT_BACKGROUNDS = {
  yellow: "#FFFF88",
  pink: "#FFB3BA",
  blue: "#87CEEB",
} as const;

// 포스트잇 테두리색
export const POST_IT_BORDERS = {
  yellow: "#e6e600",
  pink: "#ff9999",
  blue: "#70b8d9",
} as const;

// 앱 설정
export const APP_CONFIG = {
  REWARD_COUNT: 10,
  MAX_TODO_LENGTH: 100,
  ROTATION_RANGE: {
    INPUT: 2, // -2도 ~ 2도
    MAIN: 4, // -4도 ~ 4도
    INBOX: 3, // -3도 ~ 3도
  },
} as const;

// 그림자 스타일
export const SHADOW_STYLES = {
  LIGHT:
    "0 8px 16px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
  PINNED:
    "0 12px 24px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.1)",
  CARD: "0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)",
} as const;
