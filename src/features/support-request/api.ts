import { apiFetch } from '@/lib/api/client';
import type {
  SupportRequestDetail,
  SupportRequestListItem,
  SupportRequestStatus,
} from '@/features/support-request/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: string | null;
};

type CreateSupportRequestPayload = {
  origin_station_id: string;
  destination_station_id: string;
  meeting_point: string;
  notes: string;
  support_types: string[];
};

export async function createSupportRequest(payload: CreateSupportRequestPayload) {
  const response = await apiFetch<ApiResponse<SupportRequestDetail>>(
    '/support-requests',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

export async function listSupportRequests(scope: 'open' | 'history' | 'all' = 'open') {
  const response = await apiFetch<ApiResponse<SupportRequestListItem[]>>(
    `/support-requests?scope=${scope}`,
  );
  return response.data;
}

export async function getSupportRequest(requestId: string) {
  const response = await apiFetch<ApiResponse<SupportRequestDetail>>(
    `/support-requests/${requestId}`,
  );
  return response.data;
}

export async function assignSupportRequest(requestId: string) {
  const response = await apiFetch<ApiResponse<SupportRequestDetail>>(
    `/support-requests/${requestId}/assign`,
    {
      method: 'POST',
    },
  );
  return response.data;
}

export async function updateSupportRequestStatus(
  requestId: string,
  payload: {
    status: SupportRequestStatus;
    train_car_number?: string | null;
    completion_note?: string | null;
  },
) {
  const response = await apiFetch<ApiResponse<SupportRequestDetail>>(
    `/support-requests/${requestId}/status`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

export async function cancelSupportRequest(requestId: string, reason: string) {
  const response = await apiFetch<ApiResponse<SupportRequestDetail>>(
    `/support-requests/${requestId}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    },
  );
  return response.data;
}

export async function uploadSupportRequestCurrentLocation(
  requestId: string,
  payload: {
    latitude: number;
    longitude: number;
    accuracy_meters?: number | null;
  },
) {
  const response = await apiFetch<ApiResponse<SupportRequestDetail>>(
    `/support-requests/${requestId}/current-location`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}
