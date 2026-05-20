import type { StationInfo } from '@/features/home/types';

// 백엔드 STATION_SEED와 정렬된 인천1호선 11개 역. 좌표는 실제 좌표 근사값.
// 위치 기반 최근접 역 계산에만 사용되며, 추가 역이 필요해지면 여기 한 곳만 늘리면 된다.
export const STATION_CATALOG: readonly StationInfo[] = [
  {
    name: '계양역',
    previous: '귤현',
    next: '귤현',
    latitude: 37.5715,
    longitude: 126.7382,
    line: { label: '인', colors: { primary: '#3681cb', soft: '#759cce' } },
  },
  {
    name: '귤현역',
    previous: '계양',
    next: '박촌',
    latitude: 37.5664,
    longitude: 126.7458,
    line: { label: '인', colors: { primary: '#3681cb', soft: '#759cce' } },
  },
  {
    name: '박촌역',
    previous: '귤현',
    next: '임학',
    latitude: 37.5567,
    longitude: 126.753,
    line: { label: '인', colors: { primary: '#3681cb', soft: '#759cce' } },
  },
  {
    name: '임학역',
    previous: '박촌',
    next: '작전',
    latitude: 37.5437,
    longitude: 126.7464,
    line: { label: '인', colors: { primary: '#3681cb', soft: '#759cce' } },
  },
  {
    name: '작전역',
    previous: '임학',
    next: '갈산',
    latitude: 37.5354,
    longitude: 126.7401,
    line: { label: '인', colors: { primary: '#3681cb', soft: '#759cce' } },
  },
  {
    name: '갈산역',
    previous: '작전',
    next: '지식정보단지',
    latitude: 37.5283,
    longitude: 126.7282,
    line: { label: '인', colors: { primary: '#3681cb', soft: '#759cce' } },
  },
  {
    name: '지식정보단지역',
    previous: '갈산',
    next: '인천대입구',
    latitude: 37.3791,
    longitude: 126.6502,
    line: { label: '인', colors: { primary: '#3681cb', soft: '#759cce' } },
  },
  {
    name: '인천대입구역',
    previous: '지식정보단지',
    next: '센트럴파크',
    latitude: 37.3864,
    longitude: 126.6393,
    line: { label: '인', colors: { primary: '#3681cb', soft: '#759cce' } },
  },
  {
    name: '센트럴파크역',
    previous: '인천대입구',
    next: '국제업무지구',
    latitude: 37.3942,
    longitude: 126.6373,
    line: { label: '인', colors: { primary: '#3681cb', soft: '#759cce' } },
  },
  {
    name: '국제업무지구역',
    previous: '센트럴파크',
    next: '송도달빛축제공원',
    latitude: 37.4011,
    longitude: 126.6395,
    line: { label: '인', colors: { primary: '#3681cb', soft: '#759cce' } },
  },
  {
    name: '송도달빛축제공원역',
    previous: '국제업무지구',
    next: '국제업무지구',
    latitude: 37.408,
    longitude: 126.6322,
    line: { label: '인', colors: { primary: '#3681cb', soft: '#759cce' } },
  },
] as const;

export const DEFAULT_STATION: StationInfo =
  STATION_CATALOG.find((station) => station.name === '인천대입구역') ??
  STATION_CATALOG[0];
