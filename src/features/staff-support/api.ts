import { apiFetch } from '@/lib/api/client';
import type {
  StaffSupportArrivalOption,
  StaffSupportSummary,
} from '@/features/staff-support/types';

type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: string | null;
};

export async function fetchActiveStaffSupport(
  requestId?: string | null,
): Promise<StaffSupportSummary> {
  const response = await apiFetch<ApiResponse<StaffSupportSummary>>(
    requestId
      ? `/staff-support/active?request_id=${encodeURIComponent(requestId)}`
      : '/staff-support/active',
  );
  return response.data;
}

export async function startStaffSupport(
  requestId: string,
): Promise<StaffSupportSummary> {
  const response = await apiFetch<ApiResponse<StaffSupportSummary>>(
    `/staff-support/${requestId}/start`,
    { method: 'POST' },
  );
  return response.data;
}

export async function fetchStaffSupportTrainOptions(
  requestId: string,
): Promise<StaffSupportArrivalOption[]> {
  const response = await apiFetch<ApiResponse<StaffSupportArrivalOption[]>>(
    `/staff-support/${requestId}/train-options`,
  );
  return response.data;
}

export async function boardStaffSupport(
  requestId: string,
  trainNumber: string,
): Promise<StaffSupportSummary> {
  const response = await apiFetch<ApiResponse<StaffSupportSummary>>(
    `/staff-support/${requestId}/board?train_number=${encodeURIComponent(trainNumber)}`,
    { method: 'POST' },
  );
  return response.data;
}

export async function completeStaffSupport(
  requestId: string,
): Promise<StaffSupportSummary> {
  const response = await apiFetch<ApiResponse<StaffSupportSummary>>(
    `/staff-support/${requestId}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({
        completion_note: '교통지원이 완료되었습니다.',
      }),
    },
  );
  return response.data;
}
