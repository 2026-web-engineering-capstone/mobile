import { apiFetch } from '@/lib/api/client';
import type { Station } from '@/lib/api/types';
import type { MeetingPoint, SupportType } from '@/features/support-request/store/use-request-draft-store';
import type {
  SupportRequest,
  SupportRequestChecklistItem,
  SupportRequestStatus,
} from '@/features/support-request/types';

export type CreateSupportRequestPayload = {
  origin_station_id: string;
  destination_station_id: string;
  meeting_point: MeetingPoint;
  notes: string;
  support_types: SupportType[];
};

export function listStations(query?: string) {
  const search = query ? `?query=${encodeURIComponent(query)}` : '';
  return apiFetch<Station[]>(`/stations${search}`);
}

export function listSupportRequests() {
  return apiFetch<SupportRequest[]>('/support-requests');
}

export function getSupportRequest(requestId: string) {
  return apiFetch<SupportRequest>(`/support-requests/${requestId}`);
}

export function createSupportRequest(payload: CreateSupportRequestPayload) {
  return apiFetch<SupportRequest>('/support-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function cancelSupportRequest(requestId: string, reason: string) {
  return apiFetch<SupportRequest>(`/support-requests/${requestId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function assignSupportRequest(requestId: string) {
  return apiFetch<SupportRequest>(`/support-requests/${requestId}/assign`, {
    method: 'POST',
  });
}

export function updateSupportRequestChecklist(
  requestId: string,
  items: Array<Pick<SupportRequestChecklistItem, 'code' | 'label' | 'checked'>>,
) {
  return apiFetch<SupportRequest>(`/support-requests/${requestId}/checklist`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export function updateSupportRequestStatus(
  requestId: string,
  status: SupportRequestStatus,
  options?: {
    trainCarNumber?: string;
    completionNote?: string;
  },
) {
  const payload = {
    status,
    ...(options?.trainCarNumber !== undefined
      ? { train_car_number: options.trainCarNumber }
      : {}),
    ...(options?.completionNote !== undefined
      ? { completion_note: options.completionNote.trim() || null }
      : {}),
  };

  return apiFetch<SupportRequest>(`/support-requests/${requestId}/status`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function markSupportRequestUnavailable(requestId: string, reason: string) {
  return apiFetch<SupportRequest>(`/support-requests/${requestId}/unavailable`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
