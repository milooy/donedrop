/**
 * 회전 관련 유틸리티 함수들
 */

/**
 * 랜덤 회전 각도 생성
 */
export const getRandomRotation = (range: number): number => {
  return Math.random() * range * 2 - range;
};

/**
 * ID 기반 일관된 회전 각도 생성
 */
export const getConsistentRotation = (
  id: number, 
  multiplier: number, 
  range: number
): number => {
  return ((id * multiplier) % 100) * (range * 2 / 100) - range;
};

/**
 * 메인 포스트잇 회전 각도
 */
export const getMainPostItRotation = (id: number): number => {
  return getConsistentRotation(id, 37, 4); // -4도 ~ 4도
};

/**
 * 인박스 포스트잇 회전 각도  
 */
export const getInboxPostItRotation = (id: number): number => {
  return getConsistentRotation(id, 23, 3); // -3도 ~ 3도
};

/**
 * 유리병 내 아이템 회전 각도
 */
export const getJarItemRotation = (index: number): number => {
  return ((index * 17) % 45) - 22; // -22도 ~ 22도
};