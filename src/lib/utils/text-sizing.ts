/**
 * 텍스트 길이에 따른 동적 폰트 크기 계산 유틸리티
 */

export interface TextSizeConfig {
  maxFontSize: number;
  minFontSize: number;
  shortTextThreshold: number;
  longTextThreshold: number;
}

// 기본 설정
const DEFAULT_CONFIG: TextSizeConfig = {
  maxFontSize: 21, // 최대 폰트 크기 (px)
  minFontSize: 10, // 최소 폰트 크기 (px)
  shortTextThreshold: 10, // 짧은 텍스트 기준 (문자)
  longTextThreshold: 50, // 긴 텍스트 기준 (문자)
};

/**
 * 텍스트 길이에 따라 적절한 폰트 크기를 계산합니다.
 * @param text - 크기를 계산할 텍스트
 * @param config - 폰트 크기 설정 (선택사항)
 * @returns 계산된 폰트 크기 (px)
 */
export function getDynamicFontSize(
  text: string,
  config: Partial<TextSizeConfig> = {}
): number {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (!text || text.trim().length === 0) {
    return finalConfig.maxFontSize;
  }

  const textLength = text.trim().length;

  // 매우 짧은 텍스트: 최대 크기
  if (textLength <= finalConfig.shortTextThreshold) {
    return finalConfig.maxFontSize;
  }

  // 매우 긴 텍스트: 최소 크기
  if (textLength >= finalConfig.longTextThreshold) {
    return finalConfig.minFontSize;
  }

  // 중간 길이: 선형 보간으로 계산
  const ratio =
    (textLength - finalConfig.shortTextThreshold) /
    (finalConfig.longTextThreshold - finalConfig.shortTextThreshold);

  const fontSize =
    finalConfig.maxFontSize -
    ratio * (finalConfig.maxFontSize - finalConfig.minFontSize);

  return Math.round(fontSize);
}

/**
 * 폰트 크기에 해당하는 Tailwind CSS 클래스를 반환합니다.
 * @param fontSize - 폰트 크기 (px)
 * @returns Tailwind CSS 클래스명
 */
export function getFontSizeClass(fontSize: number): string {
  if (fontSize >= 18) return "text-lg";
  if (fontSize >= 16) return "text-base";
  if (fontSize >= 14) return "text-sm";
  if (fontSize >= 12) return "text-xs";
  return "text-xs";
}

/**
 * 텍스트에 맞는 동적 스타일을 반환합니다.
 * @param text - 텍스트 내용
 * @param config - 폰트 크기 설정 (선택사항)
 * @returns 인라인 스타일과 CSS 클래스
 */
export function getDynamicTextStyle(
  text: string,
  config: Partial<TextSizeConfig> = {}
) {
  const fontSize = getDynamicFontSize(text, config);
  const cssClass = getFontSizeClass(fontSize);

  return {
    fontSize: `${fontSize}px`,
    cssClass,
    lineHeight: fontSize <= 12 ? "1.3" : "1.4",
  };
}
