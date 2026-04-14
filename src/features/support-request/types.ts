import type { SessionUser, Station } from '@/lib/api/types';
import type {
  MeetingPoint,
  SupportType,
} from '@/features/support-request/store/use-request-draft-store';

export type SupportRequestStatus =
  | 'submitted'
  | 'assigned'
  | 'in_progress'
  | 'boarded'
  | 'awaiting_dropoff'
  | 'completed'
  | 'cancelled'
  | 'unavailable';

export type SupportRequestChecklistItem = {
  id: number;
  code: string;
  label: string;
  checked: boolean;
};

export type SupportRequestChecklistDraftItem = Pick<
  SupportRequestChecklistItem,
  'code' | 'label' | 'checked'
>;

export type SupportRequestEvent = {
  id: number;
  type: string;
  actor_name: string;
  from_status: SupportRequestStatus | null;
  to_status: SupportRequestStatus | null;
  message: string;
  created_at: string;
};

export type SupportRequest = {
  id: string;
  status: SupportRequestStatus;
  origin_station_id: string;
  origin_station_name: string;
  destination_station_id: string;
  destination_station_name: string;
  support_types: SupportType[];
  meeting_point: MeetingPoint;
  notes: string;
  passenger_name: string;
  assigned_staff_name: string | null;
  train_car_number: string | null;
  created_at: string;
  passenger_id: string;
  assigned_staff_id: string | null;
  cancel_reason: string | null;
  unavailable_reason: string | null;
  completion_note: string | null;
  checklist_items: SupportRequestChecklistItem[];
  events: SupportRequestEvent[];
};

export const SUPPORT_REQUEST_STATUS_LABELS: Record<SupportRequestStatus, string> = {
  submitted: '접수',
  assigned: '배정',
  in_progress: '지원 중',
  boarded: '승차 완료',
  awaiting_dropoff: '하차 대기',
  completed: '완료',
  cancelled: '취소',
  unavailable: '지원 불가',
};

export const SUPPORT_REQUEST_FLOW: SupportRequestStatus[] = [
  'submitted',
  'assigned',
  'in_progress',
  'boarded',
  'awaiting_dropoff',
  'completed',
];

export const TERMINAL_REQUEST_STATUSES: SupportRequestStatus[] = [
  'completed',
  'cancelled',
  'unavailable',
];

export const CANCELLABLE_REQUEST_STATUSES: SupportRequestStatus[] = [
  'submitted',
  'assigned',
];

export const SUPPORT_REQUEST_STATUS_GUIDES: Record<SupportRequestStatus, string> = {
  submitted: '요청이 정상적으로 접수되었습니다.',
  assigned: '역무원이 배정되어 준비를 시작했습니다.',
  in_progress: '역무원이 만남 위치로 이동하고 있습니다.',
  boarded: '승차가 완료되었고 열차 정보가 공유됩니다.',
  awaiting_dropoff: '하차 역에서 지원 준비를 하고 있습니다.',
  completed: '안전한 승하차 지원이 완료되었습니다.',
  cancelled: '요청이 취소되었습니다.',
  unavailable: '현재 요청을 지원할 수 없는 상태입니다.',
};

export const STATUS_CHIP_COLORS: Record<
  SupportRequestStatus,
  'accent' | 'success' | 'warning' | 'danger' | 'default'
> = {
  submitted: 'default',
  assigned: 'warning',
  in_progress: 'accent',
  boarded: 'accent',
  awaiting_dropoff: 'warning',
  completed: 'success',
  cancelled: 'danger',
  unavailable: 'warning',
};

export function canStaffViewSupportRequest(
  request: SupportRequest,
  user: SessionUser | null,
) {
  if (!user || user.role !== 'staff') {
    return false;
  }

  if (request.assigned_staff_id === user.id) {
    return true;
  }

  if (
    user.station_id === request.origin_station_id &&
    [
      'submitted',
      'assigned',
      'in_progress',
      'boarded',
      'awaiting_dropoff',
    ].includes(request.status)
  ) {
    return true;
  }

  return (
    user.station_id === request.destination_station_id &&
    ['boarded', 'awaiting_dropoff'].includes(request.status)
  );
}

export function canStaffManageSupportRequest(
  request: SupportRequest,
  user: SessionUser | null,
) {
  if (!user || user.role !== 'staff') {
    return false;
  }

  if (TERMINAL_REQUEST_STATUSES.includes(request.status)) {
    return false;
  }

  if (['boarded', 'awaiting_dropoff'].includes(request.status)) {
    return user.station_id === request.destination_station_id;
  }

  return request.assigned_staff_id === user.id;
}

export function canStaffAssignSupportRequest(
  request: SupportRequest,
  user: SessionUser | null,
) {
  if (!user || user.role !== 'staff') {
    return false;
  }

  return (
    request.status === 'submitted' &&
    !request.assigned_staff_id &&
    request.origin_station_id === user.station_id
  );
}

export function isDestinationHandoffStaff(
  request: SupportRequest,
  user: SessionUser | null,
) {
  return Boolean(
    user &&
      user.role === 'staff' &&
      user.station_id === request.destination_station_id &&
      ['boarded', 'awaiting_dropoff'].includes(request.status),
  );
}

export const DEMO_STATIONS: Station[] = [
  { id: 'STN-GY', name: '계양역', line: '인천1호선', line_color: '#3681cb' },
  { id: 'STN-GH', name: '귤현역', line: '인천1호선', line_color: '#3681cb' },
  { id: 'STN-BC', name: '박촌역', line: '인천1호선', line_color: '#3681cb' },
  { id: 'STN-IH', name: '임학역', line: '인천1호선', line_color: '#3681cb' },
  { id: 'STN-JJ', name: '작전역', line: '인천1호선', line_color: '#3681cb' },
  { id: 'STN-GS', name: '갈산역', line: '인천1호선', line_color: '#3681cb' },
  { id: 'STN-JI', name: '지식정보단지역', line: '인천1호선', line_color: '#3681cb' },
  { id: 'STN-ICU', name: '인천대입구역', line: '인천1호선', line_color: '#3681cb' },
  { id: 'STN-CP', name: '센트럴파크역', line: '인천1호선', line_color: '#3681cb' },
  { id: 'STN-IBD', name: '국제업무지구역', line: '인천1호선', line_color: '#3681cb' },
  { id: 'STN-SD', name: '송도달빛축제공원역', line: '인천1호선', line_color: '#3681cb' },
];
