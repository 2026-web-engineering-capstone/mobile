import { GENERATED_STATION_CATALOG } from '@/features/home/data/generated/station-coordinate-catalog';
import type { StationInfo } from '@/features/home/types';

// 백엔드 실시간 도착 카탈로그와 같은 역 목록을 사용한다.
// 현재 위치 기반 최근접 역 계산과 홈 화면의 가까운 역 표시에 쓰인다.
export const STATION_CATALOG: readonly StationInfo[] = GENERATED_STATION_CATALOG;

export const DEFAULT_STATION: StationInfo =
  STATION_CATALOG.find((station) => station.name === '한성대입구역') ??
  STATION_CATALOG[0];
