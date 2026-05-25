import type { StationInfo, SubwayLineTheme } from '@/features/home/types';

// 백엔드 STATION_SEED와 정렬된 정적 카탈로그. 위치 기반 최근접 역 계산과 화면
// 표시에 사용된다. 새 노선이 추가될 때마다 백엔드 시드와 함께 업데이트한다.

const INCHEON_1_THEME: SubwayLineTheme = {
  label: '인',
  colors: { primary: '#3681cb', soft: '#759cce' },
};

const SEOUL_4_THEME: SubwayLineTheme = {
  label: '4',
  colors: { primary: '#00a4e3', soft: '#79cce5' },
};

type RawStation = {
  name: string;
  previous: string;
  next: string;
  latitude: number;
  longitude: number;
};

function withLine(
  stations: readonly RawStation[],
  line: SubwayLineTheme,
): StationInfo[] {
  return stations.map((station) => ({ ...station, line }));
}

const INCHEON_LINE_1: readonly RawStation[] = [
  { name: '계양역', previous: '귤현', next: '귤현', latitude: 37.5715, longitude: 126.7382 },
  { name: '귤현역', previous: '계양', next: '박촌', latitude: 37.5664, longitude: 126.7458 },
  { name: '박촌역', previous: '귤현', next: '임학', latitude: 37.5567, longitude: 126.753 },
  { name: '임학역', previous: '박촌', next: '작전', latitude: 37.5437, longitude: 126.7464 },
  { name: '작전역', previous: '임학', next: '갈산', latitude: 37.5354, longitude: 126.7401 },
  { name: '갈산역', previous: '작전', next: '지식정보단지', latitude: 37.5283, longitude: 126.7282 },
  { name: '지식정보단지역', previous: '갈산', next: '인천대입구', latitude: 37.3791, longitude: 126.6502 },
  { name: '인천대입구역', previous: '지식정보단지', next: '센트럴파크', latitude: 37.3864, longitude: 126.6393 },
  { name: '센트럴파크역', previous: '인천대입구', next: '국제업무지구', latitude: 37.3942, longitude: 126.6373 },
  { name: '국제업무지구역', previous: '센트럴파크', next: '송도달빛축제공원', latitude: 37.4011, longitude: 126.6395 },
  { name: '송도달빛축제공원역', previous: '국제업무지구', next: '국제업무지구', latitude: 37.408, longitude: 126.6322 },
];

const SEOUL_LINE_4: readonly RawStation[] = [
  { name: '당고개역', previous: '당고개', next: '상계', latitude: 37.6694, longitude: 127.0744 },
  { name: '상계역', previous: '당고개', next: '노원', latitude: 37.6586, longitude: 127.0719 },
  { name: '노원역', previous: '상계', next: '창동', latitude: 37.6543, longitude: 127.0617 },
  { name: '창동역', previous: '노원', next: '쌍문', latitude: 37.6531, longitude: 127.0476 },
  { name: '쌍문역', previous: '창동', next: '수유', latitude: 37.6483, longitude: 127.0344 },
  { name: '수유역', previous: '쌍문', next: '미아', latitude: 37.6379, longitude: 127.0254 },
  { name: '미아역', previous: '수유', next: '미아사거리', latitude: 37.6266, longitude: 127.0258 },
  { name: '미아사거리역', previous: '미아', next: '길음', latitude: 37.6133, longitude: 127.0301 },
  { name: '길음역', previous: '미아사거리', next: '성신여대입구', latitude: 37.6035, longitude: 127.0254 },
  { name: '성신여대입구역', previous: '길음', next: '한성대입구', latitude: 37.5928, longitude: 127.0166 },
  { name: '한성대입구역', previous: '성신여대입구', next: '혜화', latitude: 37.5884, longitude: 127.006 },
  { name: '혜화역', previous: '한성대입구', next: '동대문', latitude: 37.5824, longitude: 127.0019 },
  { name: '동대문역', previous: '혜화', next: '동대문역사문화공원', latitude: 37.5712, longitude: 127.0094 },
  { name: '동대문역사문화공원역', previous: '동대문', next: '충무로', latitude: 37.5651, longitude: 127.0079 },
  { name: '충무로역', previous: '동대문역사문화공원', next: '명동', latitude: 37.5613, longitude: 126.9941 },
  { name: '명동역', previous: '충무로', next: '회현', latitude: 37.5605, longitude: 126.9863 },
  { name: '회현역', previous: '명동', next: '서울', latitude: 37.5588, longitude: 126.9785 },
  { name: '서울역', previous: '회현', next: '숙대입구', latitude: 37.5547, longitude: 126.9723 },
  { name: '숙대입구역', previous: '서울', next: '삼각지', latitude: 37.5448, longitude: 126.9716 },
  { name: '삼각지역', previous: '숙대입구', next: '신용산', latitude: 37.5346, longitude: 126.9731 },
  { name: '신용산역', previous: '삼각지', next: '이촌', latitude: 37.5292, longitude: 126.9694 },
  { name: '이촌역', previous: '신용산', next: '동작', latitude: 37.5226, longitude: 126.9747 },
  { name: '동작역', previous: '이촌', next: '총신대입구', latitude: 37.5028, longitude: 126.9793 },
  { name: '총신대입구역', previous: '동작', next: '사당', latitude: 37.4866, longitude: 126.9819 },
  { name: '사당역', previous: '총신대입구', next: '남태령', latitude: 37.4767, longitude: 126.9817 },
  { name: '남태령역', previous: '사당', next: '선바위', latitude: 37.4639, longitude: 126.9886 },
  { name: '선바위역', previous: '남태령', next: '경마공원', latitude: 37.4486, longitude: 126.9928 },
  { name: '경마공원역', previous: '선바위', next: '대공원', latitude: 37.4357, longitude: 127.0033 },
  { name: '대공원역', previous: '경마공원', next: '과천', latitude: 37.4351, longitude: 127.0058 },
  { name: '과천역', previous: '대공원', next: '정부과천청사', latitude: 37.4287, longitude: 126.9879 },
  { name: '정부과천청사역', previous: '과천', next: '인덕원', latitude: 37.4258, longitude: 126.9907 },
  { name: '인덕원역', previous: '정부과천청사', next: '평촌', latitude: 37.4017, longitude: 126.9784 },
  { name: '평촌역', previous: '인덕원', next: '범계', latitude: 37.3922, longitude: 126.9665 },
  { name: '범계역', previous: '평촌', next: '금정', latitude: 37.3905, longitude: 126.954 },
  { name: '금정역', previous: '범계', next: '산본', latitude: 37.3722, longitude: 126.9438 },
  { name: '산본역', previous: '금정', next: '수리산', latitude: 37.3593, longitude: 126.9305 },
  { name: '수리산역', previous: '산본', next: '대야미', latitude: 37.3492, longitude: 126.9217 },
  { name: '대야미역', previous: '수리산', next: '반월', latitude: 37.327, longitude: 126.9118 },
  { name: '반월역', previous: '대야미', next: '상록수', latitude: 37.3127, longitude: 126.8967 },
  { name: '상록수역', previous: '반월', next: '한대앞', latitude: 37.3024, longitude: 126.8657 },
  { name: '한대앞역', previous: '상록수', next: '중앙', latitude: 37.3127, longitude: 126.8466 },
  { name: '중앙역', previous: '한대앞', next: '고잔', latitude: 37.3144, longitude: 126.8369 },
  { name: '고잔역', previous: '중앙', next: '초지', latitude: 37.3208, longitude: 126.8285 },
  { name: '초지역', previous: '고잔', next: '안산', latitude: 37.322, longitude: 126.817 },
  { name: '안산역', previous: '초지', next: '신길온천', latitude: 37.326, longitude: 126.8051 },
  { name: '신길온천역', previous: '안산', next: '정왕', latitude: 37.3429, longitude: 126.8043 },
  { name: '정왕역', previous: '신길온천', next: '오이도', latitude: 37.3499, longitude: 126.7995 },
  { name: '오이도역', previous: '정왕', next: '정왕', latitude: 37.3601, longitude: 126.7864 },
];

export const STATION_CATALOG: readonly StationInfo[] = [
  ...withLine(INCHEON_LINE_1, INCHEON_1_THEME),
  ...withLine(SEOUL_LINE_4, SEOUL_4_THEME),
];

export const DEFAULT_STATION: StationInfo =
  STATION_CATALOG.find((station) => station.name === '한성대입구역') ??
  STATION_CATALOG[0];
