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

export type SupportRequestCurrentLocation = {
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  recorded_at: string | null;
};

export type SupportRequestChecklistDraftItem = Pick<
  SupportRequestChecklistItem,
  'code' | 'label' | 'checked'
>;

export type SupportRequestEvent = {
  id: number;
  type: string;
  actor_name: string;
  actor_role: SessionUser['role'];
  from_status: SupportRequestStatus | null;
  to_status: SupportRequestStatus | null;
  message: string;
  created_at: string;
};

export type CancelReasonCode =
  | 'change_of_plans'
  | 'duplicate_request'
  | 'no_longer_needed';

export type UnavailableReasonCode =
  | 'no_show'
  | 'urgent_duty'
  | 'support_unavailable';

export type SupportRequestListItem = {
  id: string;
  status: SupportRequestStatus;
  origin_station_id: string;
  origin_station_name: string;
  destination_station_id: string;
  destination_station_name: string;
  support_types: SupportType[];
  meeting_point: MeetingPoint;
  passenger_name: string;
  assigned_staff_name: string | null;
  train_car_number: string | null;
  created_at: string;
};

export type SupportRequestDetail = SupportRequestListItem & {
  passenger_id: string;
  assigned_staff_id: string | null;
  notes: string;
  cancel_reason: CancelReasonCode | null;
  unavailable_reason: UnavailableReasonCode | null;
  completion_note: string | null;
  current_location: SupportRequestCurrentLocation | null;
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

export const LOCATION_UPLOAD_ALLOWED_STATUSES: SupportRequestStatus[] = [
  'submitted',
  'assigned',
  'in_progress',
];

export const STAFF_ORIGIN_PROCESSING_STATUSES: SupportRequestStatus[] = [
  'submitted',
  'assigned',
  'in_progress',
];

export const STAFF_HANDOFF_STATUSES: SupportRequestStatus[] = [
  'boarded',
  'awaiting_dropoff',
];

const STAFF_CURRENT_LOCATION_VISIBLE_STATUSES: SupportRequestStatus[] = [
  'submitted',
  'assigned',
  'in_progress',
];

export type StaffQueueItemKind =
  | 'origin_processing'
  | 'destination_handoff'
  | 'origin_handoff_monitoring';

export type StaffQueueItemClassification = {
  kind: StaffQueueItemKind;
  label: string;
  description: string;
  isActionable: boolean;
  sortPriority: number;
};

const STAFF_QUEUE_CLASSIFICATIONS: Record<
  StaffQueueItemKind,
  StaffQueueItemClassification
> = {
  origin_processing: {
    kind: 'origin_processing',
    label: '출발역 처리',
    description: '승객 만남부터 승차 완료까지 처리할 요청입니다.',
    isActionable: true,
    sortPriority: 0,
  },
  destination_handoff: {
    kind: 'destination_handoff',
    label: '하차역 인계',
    description: '열차 도착 후 하차 지원을 처리할 요청입니다.',
    isActionable: true,
    sortPriority: 1,
  },
  origin_handoff_monitoring: {
    kind: 'origin_handoff_monitoring',
    label: '인계 모니터링',
    description: '하차 역 인계 진행 상황을 확인하는 요청입니다.',
    isActionable: false,
    sortPriority: 2,
  },
};

export const CANCEL_REASON_LABELS: Record<CancelReasonCode, string> = {
  change_of_plans: '일정이 변경되었어요.',
  duplicate_request: '중복으로 요청했어요.',
  no_longer_needed: '도움이 더 이상 필요하지 않아요.',
};

export const UNAVAILABLE_REASON_LABELS: Record<UnavailableReasonCode, string> = {
  no_show: '승객을 만나지 못했어요.',
  urgent_duty: '긴급 업무 대응이 필요해졌어요.',
  support_unavailable: '현재 현장 지원이 어려워요.',
};

function getReasonLabel<T extends string>(
  labels: Record<T, string>,
  reason: string | null | undefined,
  fallbackPrefix: string,
) {
  if (!reason) {
    return null;
  }

  if (reason in labels) {
    return labels[reason as T];
  }

  return `${fallbackPrefix} (${reason})`;
}

export function getCancelReasonLabel(reason: string | null | undefined) {
  return getReasonLabel(CANCEL_REASON_LABELS, reason, '알 수 없는 취소 사유');
}

export function getUnavailableReasonLabel(reason: string | null | undefined) {
  return getReasonLabel(UNAVAILABLE_REASON_LABELS, reason, '알 수 없는 지원 불가 사유');
}

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

export function getSupportRequestStatusGuide(
  request: Pick<
    SupportRequestDetail,
    'status' | 'cancel_reason' | 'unavailable_reason' | 'completion_note'
  >,
) {
  const cancelReasonLabel = getCancelReasonLabel(request.cancel_reason);
  if (cancelReasonLabel) {
    return `취소 사유: ${cancelReasonLabel}`;
  }

  const unavailableReasonLabel = getUnavailableReasonLabel(request.unavailable_reason);
  if (unavailableReasonLabel) {
    return `지원 불가 사유: ${unavailableReasonLabel}`;
  }

  if (request.completion_note) {
    return `완료 메모: ${request.completion_note}`;
  }

  return SUPPORT_REQUEST_STATUS_GUIDES[request.status];
}

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

export function getStaffQueueItemClassification(
  request: Pick<
    SupportRequestListItem,
    'origin_station_id' | 'destination_station_id' | 'status'
  >,
  user: SessionUser | null,
) {
  if (!user || user.role !== 'staff' || !user.station_id) {
    return null;
  }

  if (TERMINAL_REQUEST_STATUSES.includes(request.status)) {
    return null;
  }

  if (
    user.station_id === request.destination_station_id &&
    STAFF_HANDOFF_STATUSES.includes(request.status)
  ) {
    return STAFF_QUEUE_CLASSIFICATIONS.destination_handoff;
  }

  if (
    user.station_id === request.origin_station_id &&
    STAFF_ORIGIN_PROCESSING_STATUSES.includes(request.status)
  ) {
    return STAFF_QUEUE_CLASSIFICATIONS.origin_processing;
  }

  if (
    user.station_id === request.origin_station_id &&
    STAFF_HANDOFF_STATUSES.includes(request.status)
  ) {
    return STAFF_QUEUE_CLASSIFICATIONS.origin_handoff_monitoring;
  }

  return null;
}

export function canStaffViewSupportRequestListItem(
  request: SupportRequestListItem,
  user: SessionUser | null,
) {
  return getStaffQueueItemClassification(request, user) !== null;
}

export function canStaffViewSupportRequest(
  request: SupportRequestDetail,
  user: SessionUser | null,
) {
  if (!user || user.role !== 'staff') {
    return false;
  }

  if (request.assigned_staff_id === user.id) {
    return true;
  }

  return canStaffViewSupportRequestListItem(request, user);
}

export function canStaffManageSupportRequest(
  request: SupportRequestDetail,
  user: SessionUser | null,
) {
  if (!user || user.role !== 'staff') {
    return false;
  }

  if (TERMINAL_REQUEST_STATUSES.includes(request.status)) {
    return false;
  }

  if (STAFF_HANDOFF_STATUSES.includes(request.status)) {
    return user.station_id === request.destination_station_id;
  }

  return request.assigned_staff_id === user.id;
}

export function canStaffAssignSupportRequest(
  request: SupportRequestDetail,
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

export function canPassengerUploadCurrentLocation(
  request: SupportRequestDetail,
  user: SessionUser | null,
) {
  return Boolean(
    user &&
      user.role === 'passenger' &&
      request.passenger_id === user.id &&
      LOCATION_UPLOAD_ALLOWED_STATUSES.includes(request.status),
  );
}

export function canStaffViewPassengerCurrentLocation(
  request: SupportRequestDetail,
  user: SessionUser | null,
) {
  return Boolean(
    request.current_location &&
      user &&
      user.role === 'staff' &&
      user.station_id === request.origin_station_id &&
      STAFF_CURRENT_LOCATION_VISIBLE_STATUSES.includes(request.status),
  );
}

export function isDestinationHandoffStaff(
  request: SupportRequestListItem,
  user: SessionUser | null,
) {
  return Boolean(
    user &&
      user.role === 'staff' &&
      user.station_id === request.destination_station_id &&
      STAFF_HANDOFF_STATUSES.includes(request.status),
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
