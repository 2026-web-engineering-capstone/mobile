import { QueryClient } from '@tanstack/react-query';
import { getSupportRequestsWebSocketUrl, getSupportRequestsWebSocketOptions } from '@/lib/api/client';
import { queryKeys } from '@/lib/query/query-keys';

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

async function handleRealtimeMessage(
  queryClient: QueryClient,
  message: SupportRequestRealtimeMessage,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.supportRequests.detail(message.requestId),
    }),
  ]);
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
    const WebSocketWithOptions = WebSocket as unknown as {
      new (
        url: string,
        protocols?: string | string[],
        options?: object,
      ): WebSocket;
    };
    const socket = new WebSocketWithOptions(
      getSupportRequestsWebSocketUrl(),
      undefined,
      getSupportRequestsWebSocketOptions(),
    );
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
