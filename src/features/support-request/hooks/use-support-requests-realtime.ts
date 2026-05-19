import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getWebSocketBaseUrl } from '@/lib/api/client';

export function useSupportRequestsRealtime(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const websocket = new WebSocket(
      `${getWebSocketBaseUrl()}/support-requests/ws`,
    );

    websocket.onmessage = () => {
      void queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      void queryClient.invalidateQueries({ queryKey: ['staff-support'] });
    };

    return () => {
      websocket.close();
    };
  }, [enabled, queryClient]);
}
