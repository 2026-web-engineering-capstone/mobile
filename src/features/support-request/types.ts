export type SupportRequestStatus =
  | 'submitted'
  | 'assigned'
  | 'in_progress'
  | 'boarded'
  | 'awaiting_dropoff'
  | 'completed'
  | 'cancelled'
  | 'unavailable';

export type SupportType = 'wheelchair' | 'visual-guide' | 'boarding-ramp';

export type MeetingPoint =
  | 'elevator'
  | 'gate'
  | 'info-center'
  | 'platform'
  | 'other';

export type SupportRequestChecklistItem = {
  id: number;
  code: string;
  label: string;
  checked: boolean;
};

export type SupportRequestEvent = {
  id: number;
  type: string;
  actor_name: string;
  actor_role: 'passenger' | 'staff' | 'driver' | 'admin';
  from_status: SupportRequestStatus | null;
  to_status: SupportRequestStatus | null;
  message: string;
  created_at: string;
};

export type SupportRequestCurrentLocation = {
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  recorded_at: string | null;
};

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
  updated_at: string;
};

export type SupportRequestDetail = SupportRequestListItem & {
  notes: string;
  cancel_reason: string | null;
  unavailable_reason: string | null;
  completion_note: string | null;
  passenger_id: string;
  assigned_staff_id: string | null;
  current_location: SupportRequestCurrentLocation | null;
  checklist_items: SupportRequestChecklistItem[];
  events: SupportRequestEvent[];
};

export const STATUS_LABELS: Record<SupportRequestStatus, string> = {
  submitted: '접수',
  assigned: '배정',
  in_progress: '지원 중',
  boarded: '승차 완료',
  awaiting_dropoff: '하차 대기',
  completed: '완료',
  cancelled: '취소',
  unavailable: '지원 불가',
};

export const STATUS_COLOR: Record<
  SupportRequestStatus,
  'default' | 'warning' | 'accent' | 'success' | 'danger'
> = {
  submitted: 'default',
  assigned: 'warning',
  in_progress: 'accent',
  boarded: 'accent',
  awaiting_dropoff: 'warning',
  completed: 'success',
  cancelled: 'danger',
  unavailable: 'danger',
};

export const TERMINAL_STATUSES: SupportRequestStatus[] = [
  'completed',
  'cancelled',
  'unavailable',
];
