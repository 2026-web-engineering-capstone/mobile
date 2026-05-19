export type SupportRequestStatus =
  | '접수'
  | '배정'
  | '지원 중'
  | '승차 완료'
  | '하차 대기'
  | '완료'
  | '취소';

export type SupportRequest = {
  id: string;
  passengerName: string;
  origin: string;
  destination: string;
  supportTypes: string[];
  meetingPoint: string;
  notes: string;
  createdAt: string;
  requestedAtLabel: string;
  staff: string | null;
  trainCar: string | null;
  eta: string | null;
  status: SupportRequestStatus;
  priority: '높음' | '보통';
};

export const MOCK_SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: 'REQ-2026-004',
    passengerName: '박서연',
    origin: '인천대입구역',
    destination: '센트럴파크역',
    supportTypes: ['휠체어 발판', '엘리베이터 동선 안내'],
    meetingPoint: '엘리베이터 앞',
    notes: '전동휠체어 사용, 보호자 1명 동행',
    createdAt: '2026-05-04 08:42',
    requestedAtLabel: '방금 전',
    staff: null,
    trainCar: null,
    eta: null,
    status: '접수',
    priority: '높음',
  },
  {
    id: 'REQ-2026-003',
    passengerName: '김민지',
    origin: '인천대입구역',
    destination: '센트럴파크역',
    supportTypes: ['휠체어 발판'],
    meetingPoint: '고객안내센터 앞',
    notes: '전동휠체어 사용',
    createdAt: '2026-05-04 08:35',
    requestedAtLabel: '7분 전',
    staff: '김민수',
    trainCar: null,
    eta: null,
    status: '지원 중',
    priority: '높음',
  },
  {
    id: 'REQ-2026-002',
    passengerName: '최은호',
    origin: '지식정보단지역',
    destination: '인천대입구역',
    supportTypes: ['시각 안내 동행'],
    meetingPoint: '개찰구 앞',
    notes: '음성 안내 선호',
    createdAt: '2026-05-04 08:10',
    requestedAtLabel: '32분 전',
    staff: '이서준',
    trainCar: '4',
    eta: '3분 후 도착',
    status: '하차 대기',
    priority: '보통',
  },
  {
    id: 'REQ-2026-001',
    passengerName: '한지우',
    origin: '인천대입구역',
    destination: '송도달빛축제공원역',
    supportTypes: ['휠체어 발판'],
    meetingPoint: '엘리베이터 앞',
    notes: '',
    createdAt: '2026-05-03 17:20',
    requestedAtLabel: '어제',
    staff: '김민수',
    trainCar: '2',
    eta: null,
    status: '완료',
    priority: '보통',
  },
];

export const STAFF_STATUS_COLOR: Record<
  SupportRequestStatus,
  'default' | 'warning' | 'accent' | 'success' | 'danger'
> = {
  접수: 'default',
  배정: 'warning',
  '지원 중': 'accent',
  '승차 완료': 'accent',
  '하차 대기': 'warning',
  완료: 'success',
  취소: 'danger',
};

export function getSupportRequestById(requestId: string) {
  return (
    MOCK_SUPPORT_REQUESTS.find((request) => request.id === requestId) ??
    MOCK_SUPPORT_REQUESTS[0]
  );
}

export function getOpenSupportRequests() {
  return MOCK_SUPPORT_REQUESTS.filter(
    (request) => request.status !== '완료' && request.status !== '취소',
  );
}

export function getCompletedSupportRequests() {
  return MOCK_SUPPORT_REQUESTS.filter(
    (request) => request.status === '완료' || request.status === '취소',
  );
}
