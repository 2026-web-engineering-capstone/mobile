/**
 * DESIGN.md typography 슬롯을 RN TextStyle로 변환하는 헬퍼.
 *
 * 사용 예:
 *   <Text style={typo('body-lg')}>큰 본문</Text>
 *   <Text style={typo('title', 'lg')}>접근성 확대 타이틀</Text>
 *
 * fontFamily는 design-tokens.ts FONT_FAMILY를 기본 적용한다.
 */

import type { TextStyle } from 'react-native';
import { pretendard } from './design-tokens';
import { TEXT_SCALE, type FontScale, type TypoSlot, type TypoToken } from './tokens';

/** 접근성 폰트 스케일별 fontSize/lineHeight 배율. */
const FONT_SCALE_MULTIPLIER: Record<FontScale, number> = {
  md: 1,
  lg: 1.2,
};

export function typo(slot: TypoSlot, scale: FontScale = 'md'): TextStyle {
  const token: TypoToken = TEXT_SCALE[slot];
  const m = FONT_SCALE_MULTIPLIER[scale];
  const style: TextStyle = {
    fontFamily: pretendard(token.fontWeight),
    fontSize: Math.round(token.fontSize * m),
    fontWeight: token.fontWeight,
    lineHeight: Math.round(token.lineHeight * m),
  };
  if (token.letterSpacing !== undefined) {
    style.letterSpacing = token.letterSpacing;
  }
  if (token.textTransform !== undefined) {
    style.textTransform = token.textTransform;
  }
  return style;
}

export type { TypoSlot, FontScale } from './tokens';
