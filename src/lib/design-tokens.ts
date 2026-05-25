/**
 * 교움 디자인 시스템 토큰.
 *
 * Claude Design 시안(`교움.html` 핸드오프 번들)의 TOKENS 객체를 React Native용으로
 * 그대로 포팅한 값이다. 인디고 브랜드 + 코랄 액센트 + Pretendard/Noto Sans KR.
 * className 기반 스타일링이 어려운 동적 색(노선 색, hex 보정 등)에서 직접 import해
 * style prop에 주입한다.
 */

export const BRAND_TOKENS = {
  // 브랜드
  brand: '#2C5FCF',
  brandDark: '#1E4AAB',
  brandLight: '#E8F0FE',
  brandSubtle: '#F4F7FE',

  // 액센트 (요청 CTA, 강조)
  accent: '#FF7A59',
  accentLight: '#FFF1ED',

  // 텍스트
  text: '#0E1726',
  textMid: '#3D4759',
  textMuted: '#6B7588',
  textOnDark: '#FFFFFF',

  // 어두운 인디고/브랜드 카드 위에 올릴 흰색 알파 계열.
  // request-status-screen·staff-* 등 brand/brandDark 배경 위 텍스트·디바이더용.
  // 값은 실제 화면에서 이미 사용 중이던 rgba 단계를 그대로 토큰화한 것이다.
  onBrand10: 'rgba(255,255,255,0.10)',
  onBrand15: 'rgba(255,255,255,0.15)',
  onBrand18: 'rgba(255,255,255,0.18)',
  onBrand50: 'rgba(255,255,255,0.50)',
  onBrand55: 'rgba(255,255,255,0.55)',
  onBrand60: 'rgba(255,255,255,0.60)',
  onBrand70: 'rgba(255,255,255,0.70)',
  onBrand85: 'rgba(255,255,255,0.85)',
  onBrand100: '#FFFFFF',

  // 표면
  bg: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F9FAFC',

  // 보더 (DESIGN.md alias: border ↔ outline, borderStrong ↔ outline-strong)
  border: '#E5E9F0',
  borderStrong: '#CFD5E0',

  // 상태
  success: '#06B47A',
  successBg: '#E6F8F1',
  danger: '#E63946',
  dangerBg: '#FDECEE',
  warning: '#F59E0B',
  warningBg: '#FEF4E2',
  info: '#0EA5E9',
  infoBg: '#E5F4FD',

  // 한국 지하철 실제 노선 색
  line1Incheon: '#7CA8D5',
  line2Incheon: '#ED8B00',
  line1: '#0052A4',
  line2: '#00A84D',
  line3: '#EF7C1C',
  line4: '#00A4E3',
  line9: '#BDB092',
} as const;

export type BrandTokens = typeof BRAND_TOKENS;

/**
 * DESIGN.md 폰트 스택 — Pretendard 1순위, 시스템 폴백.
 * expo-font 플러그인이 4 weight(Regular/Medium/SemiBold/Bold)를 등록한다.
 * iOS/Android 모두 fontFamily 문자열을 "Pretendard-{Weight}"로 분기한다.
 */

/**
 * 기본 fontFamily — Pretendard Regular(400).
 * weight를 가진 Text는 fontWeight prop + RN 자동 weight 매핑을 활용한다.
 * 정확한 weight 매핑이 필요한 곳에서는 `pretendard(weight)` 헬퍼를 사용한다.
 */
export const FONT_FAMILY = 'Pretendard-Regular';

/**
 * fontWeight(또는 단순 키워드) → Pretendard family 문자열.
 * RN의 fontWeight 숫자/키워드 결합은 iOS에서 일관되지 않아 family로 분기한다.
 */
export function pretendard(
  weight?: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | 'normal' | 'bold',
): string {
  switch (weight) {
    case '500':
      return 'Pretendard-Medium';
    case '700':
    case '800':
    case '900':
    case 'bold':
      return 'Pretendard-Bold';
    case '600':
      return 'Pretendard-SemiBold';
    case '100':
    case '200':
    case '300':
    case '400':
    case 'normal':
    case undefined:
      return 'Pretendard-Regular';
    default:
      return 'Pretendard-Regular';
  }
}

/**
 * DESIGN.md rounded 토큰 — 7단계.
 *   xs(6)    ToggleChip 안 체크박스
 *   sm(12)   ToggleChip 안 아이콘 컨테이너
 *   chip(14) StationChip, ToggleChip 외곽, SearchInput, MiniMap
 *   button(16) 모든 CTA
 *   card(18) 표준/강조 카드
 *   pill(999) Status pill, BottomBar 정보 칩, AppBar 모드 탭
 */
export const RADIUS = {
  xs: 6,
  sm: 12,
  chip: 14,
  button: 16,
  card: 18,
  pill: 999,
} as const;

/** 시안 spacing — 16/20/24/32. */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

/**
 * 노선 코드(StationLine 인터페이스)에 따른 색·라벨 매핑.
 * Station.line 백엔드 문자열을 기반으로 노선 뱃지에 사용할 색을 선택한다.
 */
export type LineMeta = { readonly color: string; readonly char: string };

const FALLBACK_LINE_META: LineMeta = {
  color: BRAND_TOKENS.line4,
  char: '4',
};

export function getLineMeta(line: string | null | undefined): LineMeta {
  if (!line) return FALLBACK_LINE_META;
  if (line.includes('인천1')) return { color: BRAND_TOKENS.line1Incheon, char: '인' };
  if (line.includes('인천2')) return { color: BRAND_TOKENS.line2Incheon, char: '인' };
  if (line.startsWith('1호선')) return { color: BRAND_TOKENS.line1, char: '1' };
  if (line.startsWith('2호선')) return { color: BRAND_TOKENS.line2, char: '2' };
  if (line.startsWith('3호선')) return { color: BRAND_TOKENS.line3, char: '3' };
  if (line.includes('4호선')) {
    return { color: BRAND_TOKENS.line4, char: '4' };
  }
  if (line.startsWith('9호선')) return { color: BRAND_TOKENS.line9, char: '9' };
  return FALLBACK_LINE_META;
}
