import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import {
  assignSupportRequest,
  cancelSupportRequest,
  createSupportRequest,
  getSupportRequest,
  listStations,
  listSupportRequests,
  markSupportRequestUnavailable,
  updateSupportRequestChecklist,
  updateSupportRequestStatus,
  uploadSupportRequestCurrentLocation,
  type CreateSupportRequestPayload,
  type UploadSupportRequestCurrentLocationPayload,
} from '@/features/support-request/api/support-requests';
import {
  SUPPORT_REQUEST_FLOW,
  TERMINAL_REQUEST_STATUSES,
  type CancelReasonCode,
  type SupportRequestDetail,
  type SupportRequestListItem,
  type SupportRequestStatus,
  type UnavailableReasonCode,
} from '@/features/support-request/types';

function toSupportRequestListItem(
  request: SupportRequestDetail,
): SupportRequestListItem {
  return {
    id: request.id,
    status: request.status,
    origin_station_id: request.origin_station_id,
    origin_station_name: request.origin_station_name,
    destination_station_id: request.destination_station_id,
    destination_station_name: request.destination_station_name,
    support_types: request.support_types,
    meeting_point: request.meeting_point,
    passenger_name: request.passenger_name,
    assigned_staff_name: request.assigned_staff_name,
    assigned_staff_id: request.assigned_staff_id,
    train_number: request.train_number,
    train_car_number: request.train_car_number,
    created_at: request.created_at,
    boarded_at: request.boarded_at,
    dropoff_started_at: request.dropoff_started_at,
    completed_at: request.completed_at,
  };
}

export function cacheSupportRequestInList(
  queryClient: QueryClient,
  request: SupportRequestDetail,
) {
  const listItem = toSupportRequestListItem(request);

  queryClient.setQueryData(
    queryKeys.supportRequests.all,
    (existing: SupportRequestListItem[] | undefined) => {
      if (!existing) return [listItem];
      if (existing.some((item) => item.id === listItem.id)) {
        return existing.map((item) => (item.id === listItem.id ? listItem : item));
      }
      return [listItem, ...existing];
    },
  );
}

export function useStations(query?: string) {
  return useQuery({
    queryKey: query ? queryKeys.stations.search(query) : queryKeys.stations.all,
    queryFn: () => listStations(query),
  });
}

export function useSupportRequests(
  enabled = true,
  refetchInterval: number | false = enabled ? 10_000 : false,
) {
  return useQuery({
    queryKey: queryKeys.supportRequests.all,
    queryFn: listSupportRequests,
    enabled,
    refetchInterval,
  });
}

export function useSupportRequest(requestId: string) {
  return useQuery({
    queryKey: queryKeys.supportRequests.detail(requestId),
    queryFn: () => getSupportRequest(requestId),
    enabled: Boolean(requestId),
    refetchInterval: (query) => {
      const current = query.state.data;
      if (!current || TERMINAL_REQUEST_STATUSES.includes(current.status)) {
        return false;
      }
      return 10_000;
    },
  });
}

export function useCreateSupportRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSupportRequestPayload) => createSupportRequest(payload),
    onSuccess: async (created) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.session }),
      ]);
      queryClient.setQueryData(queryKeys.supportRequests.detail(created.id), created);
    },
  });
}

export function useCancelSupportRequest(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: CancelReasonCode) => cancelSupportRequest(requestId, reason),
    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKeys.supportRequests.detail(requestId), updated);
      cacheSupportRequestInList(queryClient, updated);
      await queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all });
    },
  });
}

export function useAssignSupportRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => assignSupportRequest(requestId),
    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKeys.supportRequests.detail(updated.id), updated);
      cacheSupportRequestInList(queryClient, updated);
      await queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all });
    },
  });
}

export function useUpdateSupportRequestChecklist(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      items: Array<{ code: string; label: string; checked: boolean }>,
    ) => updateSupportRequestChecklist(requestId, items),
    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKeys.supportRequests.detail(requestId), updated);
      cacheSupportRequestInList(queryClient, updated);
      await queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all });
    },
  });
}

export function useUpdateSupportRequestStatus(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      status,
      trainNumber,
      trainCarNumber,
      completionNote,
    }: {
      status: SupportRequestStatus;
      trainNumber?: string;
      trainCarNumber?: string;
      completionNote?: string;
    }) =>
      updateSupportRequestStatus(requestId, status, {
        trainNumber,
        trainCarNumber,
        completionNote,
      }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKeys.supportRequests.detail(requestId), updated);
      cacheSupportRequestInList(queryClient, updated);
      await queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all });
    },
  });
}

export function useUploadSupportRequestCurrentLocation(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadSupportRequestCurrentLocationPayload) =>
      uploadSupportRequestCurrentLocation(requestId, payload),
    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKeys.supportRequests.detail(requestId), updated);
      cacheSupportRequestInList(queryClient, updated);
      await queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all });
    },
  });
}

export function useMarkSupportRequestUnavailable(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: UnavailableReasonCode) =>
      markSupportRequestUnavailable(requestId, reason),
    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKeys.supportRequests.detail(requestId), updated);
      cacheSupportRequestInList(queryClient, updated);
      await queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all });
    },
  });
}

export function getNextProgressStatus(status: SupportRequestStatus) {
  const currentIndex = SUPPORT_REQUEST_FLOW.indexOf(status);
  if (currentIndex === -1 || currentIndex === SUPPORT_REQUEST_FLOW.length - 1) {
    return null;
  }
  return SUPPORT_REQUEST_FLOW[currentIndex + 1];
}
