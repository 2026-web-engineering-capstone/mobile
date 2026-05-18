import { apiFetch } from '@/lib/api/client';
import type { Station } from '@/lib/api/types';
import type { MeetingPoint, SupportType } from '@/features/support-request/store/use-request-draft-store';
import type {
  CancelReasonCode,
  SupportRequestDetail,
  SupportRequestListItem,
  SupportRequestChecklistItem,
  SupportRequestStatus,
  UnavailableReasonCode,
} from '@/features/support-request/types';

export type CreateSupportRequestPayload = {
  origin_station_id: string;
  destination_station_id: string;
  meeting_point: MeetingPoint;
  notes: string;
  support_types: SupportType[];
};

export type UploadSupportRequestCurrentLocationPayload = {
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
};

export function listStations(query?: string) {
  const search = query ? `?query=${encodeURIComponent(query)}` : '';
  return apiFetch<Station[]>(`/stations${search}`);
}

export function listSupportRequests() {
  return apiFetch<SupportRequestListItem[]>('/support-requests');
}

export function getSupportRequest(requestId: string) {
  return apiFetch<SupportRequestDetail>(`/support-requests/${requestId}`);
}

export function createSupportRequest(payload: CreateSupportRequestPayload) {
  return apiFetch<SupportRequestDetail>('/support-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function cancelSupportRequest(requestId: string, reason: CancelReasonCode) {
  return apiFetch<SupportRequestDetail>(`/support-requests/${requestId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function assignSupportRequest(requestId: string) {
  return apiFetch<SupportRequestDetail>(`/support-requests/${requestId}/assign`, {
    method: 'POST',
  });
}

export function updateSupportRequestChecklist(
  requestId: string,
  items: Array<Pick<SupportRequestChecklistItem, 'code' | 'label' | 'checked'>>,
) {
  return apiFetch<SupportRequestDetail>(`/support-requests/${requestId}/checklist`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export function updateSupportRequestStatus(
  requestId: string,
  status: SupportRequestStatus,
  options?: {
    trainNumber?: string;
    trainCarNumber?: string;
    completionNote?: string;
  },
) {
  const payload = {
    status,
    ...(options?.trainNumber !== undefined
      ? { train_number: options.trainNumber }
      : {}),
    ...(options?.trainCarNumber !== undefined
      ? { train_car_number: options.trainCarNumber }
      : {}),
    ...(options?.completionNote !== undefined
      ? { completion_note: options.completionNote.trim() || null }
      : {}),
  };

  return apiFetch<SupportRequestDetail>(`/support-requests/${requestId}/status`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function uploadSupportRequestCurrentLocation(
  requestId: string,
  payload: UploadSupportRequestCurrentLocationPayload,
) {
  return apiFetch<SupportRequestDetail>(
    `/support-requests/${requestId}/current-location`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function markSupportRequestUnavailable(
  requestId: string,
  reason: UnavailableReasonCode,
) {
  return apiFetch<SupportRequestDetail>(`/support-requests/${requestId}/unavailable`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
