export type ArrivalTrain = {
  trainNumber: string | null;
  destination: string;
  destinationLabel: string;
  etaMessage: string;
  direction: string | null;
  routeLabel: string | null;
  trainStatus: string | null;
  currentStation: string | null;
  line: string | null;
  lineId: string | null;
  etaSeconds: number | null;
};

export type StationArrivals = {
  stationName: string;
  fetchedAt: number;
  trains: ArrivalTrain[];
};

export type StationFacility = {
  facilityType: string;
  locationNote: string | null;
  operationalStatus: 'operational' | 'out_of_service' | 'unknown';
};

export type StationFacilities = {
  stationName: string;
  fetchedAt: number;
  facilities: StationFacility[];
};

const FACILITY_LABELS: Record<string, string> = {
  elevator: '엘리베이터',
  escalator: '에스컬레이터',
  '엘리베이터': '엘리베이터',
  '에스컬레이터': '에스컬레이터',
  accessible_ramp: '장애인 경사로',
  '장애인경사로': '장애인 경사로',
  '장애인 경사로': '장애인 경사로',
  wheelchair_ramp: '휠체어 경사로',
  '휠체어경사로': '휠체어 경사로',
  '휠체어 경사로': '휠체어 경사로',
  accessible_toilet: '장애인 화장실',
  '장애인화장실': '장애인 화장실',
  '장애인 화장실': '장애인 화장실',
  wheelchair_lift: '휠체어 리프트',
  '휠체어리프트': '휠체어 리프트',
  '휠체어 리프트': '휠체어 리프트',
  moving_walk: '무빙워크',
  '무빙워크': '무빙워크',
  wheelchair_charger: '휠체어 급속충전기',
  '휠체어 급속충전기': '휠체어 급속충전기',
  sign_language_phone: '수어영상전화기',
  '수어영상전화기': '수어영상전화기',
  safe_footboard: '이동식 안전발판',
  '이동식 안전발판': '이동식 안전발판',
  helper: '교통약자 도우미',
  '교통약자 도우미': '교통약자 도우미',
  accessible_gate: '교통약자 개찰구',
  '수유실': '수유실',
};

export function getFacilityLabel(type: string): string {
  return FACILITY_LABELS[type] ?? type;
}

const FACILITY_EMOJI: Record<string, string> = {
  elevator: '🛗',
  '엘리베이터': '🛗',
  escalator: '🔼',
  '에스컬레이터': '🔼',
  accessible_ramp: '♿',
  '장애인 경사로': '♿',
  '장애인경사로': '♿',
  wheelchair_ramp: '♿',
  '휠체어 경사로': '♿',
  '휠체어경사로': '♿',
  accessible_toilet: '🚻',
  '장애인 화장실': '🚻',
  '장애인화장실': '🚻',
  wheelchair_lift: '♿',
  '휠체어 리프트': '♿',
  '휠체어리프트': '♿',
  moving_walk: '↔',
  '무빙워크': '↔',
  wheelchair_charger: '⚡',
  '휠체어 급속충전기': '⚡',
  sign_language_phone: '☎',
  '수어영상전화기': '☎',
  safe_footboard: '▭',
  '이동식 안전발판': '▭',
  helper: 'ⓘ',
  '교통약자 도우미': 'ⓘ',
  accessible_gate: '🚪',
  '수유실': '🤱',
};

export function getFacilityEmoji(type: string): string {
  return FACILITY_EMOJI[type] ?? '•';
}

export const OPERATIONAL_STATUS_LABEL: Record<
  StationFacility['operationalStatus'],
  string
> = {
  operational: '정상',
  out_of_service: '점검 중',
  unknown: '정보 없음',
};
