import {
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
  type CreateSupportRequestPayload,
} from '@/features/support-request/api/support-requests';
import {
  SUPPORT_REQUEST_FLOW,
  TERMINAL_REQUEST_STATUSES,
  type SupportRequestStatus,
} from '@/features/support-request/types';

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
    mutationFn: (reason: string) => cancelSupportRequest(requestId, reason),
    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKeys.supportRequests.detail(requestId), updated);
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
      await queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all });
    },
  });
}

export function useUpdateSupportRequestStatus(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      status,
      trainCarNumber,
      completionNote,
    }: {
      status: SupportRequestStatus;
      trainCarNumber?: string;
      completionNote?: string;
    }) =>
      updateSupportRequestStatus(requestId, status, {
        trainCarNumber,
        completionNote,
      }),
    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKeys.supportRequests.detail(requestId), updated);
      await queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all });
    },
  });
}

export function useMarkSupportRequestUnavailable(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => markSupportRequestUnavailable(requestId, reason),
    onSuccess: async (updated) => {
      queryClient.setQueryData(queryKeys.supportRequests.detail(requestId), updated);
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
