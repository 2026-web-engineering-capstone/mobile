import { QueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { getSupportRequestsWebSocketUrl } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/query-keys';
import {
  SUPPORT_REQUEST_STATUS_GUIDES,
  SUPPORT_REQUEST_STATUS_LABELS,
  type SupportRequestDetail,
  type SupportRequestStatus,
} from '@/features/support-request/types';

type SupportRequestUpdatedMessage = {
  type: 'support_request.updated';
  requestId: string;
};

type SupportRequestRealtimeMessage = SupportRequestUpdatedMessage;

type SupportRequestsRealtimeConnection = {
  close: () => void;
};

const RECONNECT_DELAY_MS = 3_000;
const NON_RETRYABLE_CLOSE_CODES = new Set([1003, 1008]);

function isSupportRequestUpdatedMessage(
  value: unknown,
): value is SupportRequestUpdatedMessage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as {
    type?: unknown;
    requestId?: unknown;
  };

  return (
    candidate.type === 'support_request.updated' &&
    typeof candidate.requestId === 'string'
  );
}

function getStatusToastBody(status: SupportRequestStatus): string {
  return SUPPORT_REQUEST_STATUS_GUIDES[status] ?? '요청 상태가 갱신되었습니다.';
}

async function scheduleStatusChangeNotification(
  request: SupportRequestDetail,
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `상태: ${SUPPORT_REQUEST_STATUS_LABELS[request.status]}`,
        body: getStatusToastBody(request.status),
        data: { requestId: request.id, status: request.status },
      },
      trigger: null,
    });
  } catch {
    // expo-notifications가 사용 불가한 환경(예: web)일 수 있다. 사용자에게는
    // WebSocket 갱신으로 화면이 이미 업데이트되므로 조용히 넘긴다.
  }
}

async function handleRealtimeMessage(
  queryClient: QueryClient,
  message: SupportRequestRealtimeMessage,
): Promise<void> {
  const detailKey = queryKeys.supportRequests.detail(message.requestId);
  const previous =
    queryClient.getQueryData<SupportRequestDetail>(detailKey) ?? null;
  const previousStatus = previous?.status ?? null;

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all }),
    queryClient.refetchQueries({ queryKey: detailKey, exact: true }),
  ]);

  if (previousStatus === null) {
    return;
  }

  const next = queryClient.getQueryData<SupportRequestDetail>(detailKey);
  if (!next || next.status === previousStatus) {
    return;
  }

  await scheduleStatusChangeNotification(next);
}

export function connectSupportRequestsWebSocket(
  queryClient: QueryClient,
): SupportRequestsRealtimeConnection {
  let activeSocket: WebSocket | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let closedManually = false;

  const clearReconnectTimeout = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
  };

  const scheduleReconnect = () => {
    if (closedManually || reconnectTimeout) {
      return;
    }

    reconnectTimeout = setTimeout(() => {
      reconnectTimeout = null;
      connect();
    }, RECONNECT_DELAY_MS);
  };

  const closeSocket = (socket: WebSocket) => {
    if (
      socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING
    ) {
      socket.close();
    }
  };

  const connect = () => {
    if (closedManually) {
      return;
    }

    clearReconnectTimeout();
    const socket = new WebSocket(getSupportRequestsWebSocketUrl());
    activeSocket = socket;

    socket.onmessage = (event) => {
      if (activeSocket !== socket || closedManually) {
        return;
      }

      try {
        const payload: unknown = JSON.parse(String(event.data));
        if (!isSupportRequestUpdatedMessage(payload)) {
          return;
        }
        void handleRealtimeMessage(queryClient, payload).catch(() => undefined);
      } catch {
        return;
      }
    };

    socket.onerror = () => {
      if (activeSocket !== socket || closedManually) {
        return;
      }
      closeSocket(socket);
    };

    socket.onclose = (event) => {
      if (activeSocket !== socket) {
        return;
      }

      activeSocket = null;
      if (!closedManually && !NON_RETRYABLE_CLOSE_CODES.has(event.code)) {
        scheduleReconnect();
      }
    };
  };

  connect();

  return {
    close: () => {
      closedManually = true;
      clearReconnectTimeout();
      const socket = activeSocket;
      activeSocket = null;
      if (socket) {
        closeSocket(socket);
      }
    },
  };
}
