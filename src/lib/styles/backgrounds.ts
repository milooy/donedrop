/**
 * 배경 스타일 상수들
 */

export const WOOD_BACKGROUND = `
  linear-gradient(135deg, 
    #654321 0%, 
    #8B4513 15%, 
    #A0522D 30%, 
    #B8860B 45%, 
    #CD853F 60%, 
    #D2B48C 75%, 
    #DEB887 90%, 
    #F5DEB3 100%
  ),
  repeating-linear-gradient(
    90deg,
    transparent,
    transparent 0.5px,
    rgba(139, 69, 19, 0.1) 0.5px,
    rgba(139, 69, 19, 0.1) 1px
  )
`;

export const MEMO_BOARD_BACKGROUND = `
  radial-gradient(circle at 20% 20%, #C4A484 0%, #D2B48C 25%, #BC9A6A 50%, #A0845C 75%, #8B7355 100%),
  repeating-radial-gradient(circle at 60% 40%, 
    transparent 0%, 
    transparent 2px, 
    rgba(139, 115, 85, 0.1) 2px, 
    rgba(139, 115, 85, 0.1) 4px
  )
`;

export const INBOX_BACKGROUND = `
  linear-gradient(135deg, 
    #92400e 0%, 
    #a16207 100%
  )
`;

export const GLASS_JAR_BACKGROUND = `
  linear-gradient(135deg, 
    rgba(255, 255, 255, 0.95) 0%,
    rgba(240, 248, 255, 0.9) 15%,
    rgba(219, 234, 254, 0.85) 30%,
    rgba(191, 219, 254, 0.8) 45%,
    rgba(147, 197, 253, 0.75) 60%,
    rgba(96, 165, 250, 0.7) 75%,
    rgba(59, 130, 246, 0.65) 90%,
    rgba(29, 78, 216, 0.6) 100%
  ),
  radial-gradient(ellipse at 25% 15%, rgba(255, 255, 255, 0.9) 0%, transparent 45%),
  radial-gradient(ellipse at 75% 25%, rgba(255, 255, 255, 0.6) 0%, transparent 35%),
  radial-gradient(ellipse at 40% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 60%),
  radial-gradient(ellipse at 80% 80%, rgba(29, 78, 216, 0.4) 0%, transparent 50%)
`;

export const GLASS_JAR_SHADOW = `
  inset 20px 0 40px rgba(255, 255, 255, 0.6),
  inset -20px 0 40px rgba(59, 130, 246, 0.3),
  inset 0 15px 30px rgba(255, 255, 255, 0.5),
  inset 0 -15px 30px rgba(29, 78, 216, 0.25),
  0 25px 80px rgba(0, 0, 0, 0.35),
  0 15px 40px rgba(0, 0, 0, 0.25),
  0 8px 20px rgba(0, 0, 0, 0.15),
  0 40px 100px rgba(29, 78, 216, 0.1)
`;