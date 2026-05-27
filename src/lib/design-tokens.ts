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
  line4: '#00A5DE',
  line5: '#996CAC',
  line6: '#CD7C2F',
  line7: '#747F00',
  line8: '#E6186C',
  line9: '#BDB092',
  lineGyeonguiJungang: '#77C4A3',
  lineGyeongchun: '#0C8E72',
  lineSuinBundang: '#F5A200',
  lineSinbundang: '#D31145',
  lineAirport: '#0090D2',
  lineUiSinseol: '#B7C450',
  lineSeohae: '#8FC31F',
  lineGyeonggang: '#0054A6',
  lineSillim: '#6789CA',
  lineGtxA: '#9A6292',
  lineGimpoGold: '#A17800',
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
  color: BRAND_TOKENS.textMuted,
  char: '역',
};

export function getOfficialLineName(line: string | null | undefined): string {
  if (!line) return '';

  const normalizedLine = line.trim().replace(/^서울(?=[1-9]호선$)/, '');

  if (/^[1-9]$/.test(normalizedLine)) return `${normalizedLine}호선`;
  if (/^[1-9]호선$/.test(normalizedLine)) return normalizedLine;
  if (normalizedLine.includes('인천1')) return '인천1호선';
  if (normalizedLine.includes('인천2')) return '인천2호선';
  if (normalizedLine.includes('경의중앙')) return '경의중앙선';
  if (normalizedLine.includes('경춘')) return '경춘선';
  if (normalizedLine.includes('수인분당')) return '수인분당선';
  if (normalizedLine.includes('신분당')) return '신분당선';
  if (normalizedLine.includes('공항')) return '공항철도';
  if (normalizedLine.includes('우이신설')) return '우이신설선';
  if (normalizedLine.includes('서해')) return '서해선';
  if (normalizedLine.includes('경강')) return '경강선';
  if (normalizedLine.includes('신림')) return '신림선';
  if (normalizedLine.includes('GTX')) return 'GTX-A';
  if (normalizedLine.includes('김포')) return '김포골드라인';

  return normalizedLine;
}

export function getLineMeta(line: string | null | undefined): LineMeta {
  const officialLineName = getOfficialLineName(line);
  if (!officialLineName) return FALLBACK_LINE_META;

  if (officialLineName === '인천1호선') return { color: BRAND_TOKENS.line1Incheon, char: '인천1' };
  if (officialLineName === '인천2호선') return { color: BRAND_TOKENS.line2Incheon, char: '인천2' };
  if (officialLineName === '1호선') return { color: BRAND_TOKENS.line1, char: '1' };
  if (officialLineName === '2호선') return { color: BRAND_TOKENS.line2, char: '2' };
  if (officialLineName === '3호선') return { color: BRAND_TOKENS.line3, char: '3' };
  if (officialLineName === '4호선') {
    return { color: BRAND_TOKENS.line4, char: '4' };
  }
  if (officialLineName === '5호선') return { color: BRAND_TOKENS.line5, char: '5' };
  if (officialLineName === '6호선') return { color: BRAND_TOKENS.line6, char: '6' };
  if (officialLineName === '7호선') return { color: BRAND_TOKENS.line7, char: '7' };
  if (officialLineName === '8호선') return { color: BRAND_TOKENS.line8, char: '8' };
  if (officialLineName === '9호선') return { color: BRAND_TOKENS.line9, char: '9' };
  if (officialLineName === '경의중앙선') {
    return { color: BRAND_TOKENS.lineGyeonguiJungang, char: '경의중앙' };
  }
  if (officialLineName === '경춘선') return { color: BRAND_TOKENS.lineGyeongchun, char: '경춘' };
  if (officialLineName === '수인분당선') {
    return { color: BRAND_TOKENS.lineSuinBundang, char: '수인분당' };
  }
  if (officialLineName === '신분당선') return { color: BRAND_TOKENS.lineSinbundang, char: '신분당' };
  if (officialLineName === '공항철도') return { color: BRAND_TOKENS.lineAirport, char: '공항철도' };
  if (officialLineName === '우이신설선') {
    return { color: BRAND_TOKENS.lineUiSinseol, char: '우이신설' };
  }
  if (officialLineName === '서해선') return { color: BRAND_TOKENS.lineSeohae, char: '서해' };
  if (officialLineName === '경강선') return { color: BRAND_TOKENS.lineGyeonggang, char: '경강' };
  if (officialLineName === '신림선') return { color: BRAND_TOKENS.lineSillim, char: '신림' };
  if (officialLineName === 'GTX-A') return { color: BRAND_TOKENS.lineGtxA, char: 'GTX-A' };
  if (officialLineName === '김포골드라인') return { color: BRAND_TOKENS.lineGimpoGold, char: '김포골드' };
  return FALLBACK_LINE_META;
}

const STATION_LINE_OVERRIDES: Record<string, readonly string[]> = {
  공덕: ['5호선', '6호선', '경의중앙선', '공항철도'],
  서울: ['1호선', '4호선', '경의중앙선', '공항철도'],
  시청: ['1호선', '2호선'],
  종로3가: ['1호선', '3호선', '5호선'],
  동대문: ['1호선', '4호선'],
  동대문역사문화공원: ['2호선', '4호선', '5호선'],
  충무로: ['3호선', '4호선'],
  사당: ['2호선', '4호선'],
  이촌: ['4호선', '경의중앙선'],
  삼각지: ['4호선', '6호선'],
  노원: ['4호선', '7호선'],
  창동: ['1호선', '4호선'],
  금정: ['1호선', '4호선'],
  오이도: ['4호선', '수인분당선'],
  왕십리: ['2호선', '5호선', '경의중앙선', '수인분당선'],
  홍대입구: ['2호선', '경의중앙선', '공항철도'],
  강남: ['2호선', '신분당선'],
  양재: ['3호선', '신분당선'],
  선정릉: ['9호선', '수인분당선'],
  선릉: ['2호선', '수인분당선'],
  복정: ['8호선', '수인분당선'],
  모란: ['8호선', '수인분당선'],
};

const STATION_ID_LINE_SUFFIXES: Record<string, string> = {
  L1: '1호선',
  L2: '2호선',
  L3: '3호선',
  L4: '4호선',
  L5: '5호선',
  L6: '6호선',
  L7: '7호선',
  L8: '8호선',
  L9: '9호선',
  GJ: '경의중앙선',
  GC: '경춘선',
  SB: '수인분당선',
  SD: '신분당선',
  AR: '공항철도',
};

const SUBWAY_ID_LINES: Record<string, string> = {
  '1001': '1호선',
  '1002': '2호선',
  '1003': '3호선',
  '1004': '4호선',
  '1005': '5호선',
  '1006': '6호선',
  '1007': '7호선',
  '1008': '8호선',
  '1009': '9호선',
  '1063': '경의중앙선',
  '1065': '공항철도',
  '1067': '경춘선',
  '1075': '수인분당선',
  '1077': '신분당선',
  '1081': '경강선',
  '1091': '김포골드라인',
  '1092': '우이신설선',
  '1093': '서해선',
  '1094': '신림선',
  '1032': 'GTX-A',
};

function normalizeStationName(value: string) {
  return value.trim().replace(/\s+/g, '').replace(/역$/, '');
}

function getLineNameFromStationId(stationId: string | null | undefined) {
  if (!stationId?.startsWith('STN-')) return null;

  const suffix = stationId.split('-').at(-1);
  if (suffix && STATION_ID_LINE_SUFFIXES[suffix]) {
    return STATION_ID_LINE_SUFFIXES[suffix];
  }

  const subwayId = stationId.split('-')[1];
  if (subwayId && SUBWAY_ID_LINES[subwayId]) {
    return SUBWAY_ID_LINES[subwayId];
  }

  return null;
}

export function getStationLineMetas(
  stationOrLine: string | null | undefined,
  stationId?: string | null,
): readonly LineMeta[] {
  const lineNameFromId = getLineNameFromStationId(stationId);
  if (lineNameFromId) return [getLineMeta(lineNameFromId)];

  if (!stationOrLine) return [FALLBACK_LINE_META];

  const normalizedStation = normalizeStationName(stationOrLine);
  const overrideLines = STATION_LINE_OVERRIDES[normalizedStation];

  if (overrideLines) {
    return overrideLines.map(getLineMeta);
  }

  return [getLineMeta(stationOrLine)];
}
