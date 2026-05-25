import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSupportRequestsWebSocketUrl } from '@/lib/api/client';

export function useSupportRequestsRealtime(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const websocket = new WebSocket(getSupportRequestsWebSocketUrl());

    websocket.onmessage = () => {
      void queryClient.invalidateQueries({ queryKey: ['support-requests'] });
    };

    return () => {
      websocket.close();
    };
  }, [enabled, queryClient]);
}
