/**
 * URL 감지 및 링크 처리 유틸리티
 */

// URL 정규식 패턴
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/**
 * URL에서 도메인명을 추출합니다.
 * @param url - 추출할 URL
 * @returns 도메인명
 */
export function extractDomain(url: string): string {
  try {
    const urlObject = new URL(url);
    return urlObject.hostname;
  } catch {
    // URL 파싱 실패 시 원본 URL 반환
    return url;
  }
}

/**
 * 텍스트에서 URL을 감지하고 링크 정보를 반환합니다.
 * @param text - 분석할 텍스트
 * @returns 링크 정보 배열
 */
export function detectLinks(text: string): LinkInfo[] {
  const links: LinkInfo[] = [];
  const matches = text.matchAll(URL_REGEX);
  
  for (const match of matches) {
    const url = match[0];
    const domain = extractDomain(url);
    
    links.push({
      url,
      domain,
      startIndex: match.index || 0,
      endIndex: (match.index || 0) + url.length,
      originalText: url,
    });
  }
  
  return links;
}

/**
 * 텍스트에서 링크를 도메인명으로 대체합니다.
 * @param text - 원본 텍스트
 * @returns 링크가 도메인명으로 대체된 텍스트와 링크 정보
 */
export function replaceLinksWithDomains(text: string): {
  displayText: string;
  links: LinkInfo[];
} {
  const links = detectLinks(text);
  
  if (links.length === 0) {
    return { displayText: text, links: [] };
  }
  
  let displayText = text;
  let offset = 0;
  
  // 뒤에서부터 대체해서 인덱스 변화 방지
  const sortedLinks = [...links].sort((a, b) => b.startIndex - a.startIndex);
  
  for (const link of sortedLinks) {
    const before = displayText.slice(0, link.startIndex);
    const after = displayText.slice(link.endIndex);
    displayText = before + link.domain + after;
    
    // 새로운 인덱스 계산
    const lengthDiff = link.domain.length - link.originalText.length;
    link.endIndex = link.startIndex + link.domain.length;
  }
  
  return { displayText, links: sortedLinks };
}

/**
 * 텍스트가 순수한 링크인지 확인합니다.
 * @param text - 확인할 텍스트
 * @returns 순수한 링크 여부
 */
export function isPureLink(text: string): boolean {
  const trimmedText = text.trim();
  const links = detectLinks(trimmedText);
  
  return links.length === 1 && links[0].originalText === trimmedText;
}

/**
 * 링크가 도메인명으로 표시될 때의 실제 표시 길이를 계산합니다.
 * @param text - 원본 텍스트
 * @returns 표시될 텍스트 길이
 */
export function getDisplayTextLength(text: string): number {
  const { displayText } = replaceLinksWithDomains(text);
  return displayText.length;
}

/**
 * 링크 정보 인터페이스
 */
export interface LinkInfo {
  url: string;           // 원본 URL
  domain: string;        // 도메인명
  startIndex: number;    // 텍스트 내 시작 위치
  endIndex: number;      // 텍스트 내 끝 위치
  originalText: string;  // 원본 링크 텍스트
}