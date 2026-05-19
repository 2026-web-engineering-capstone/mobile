import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listSupportRequests, uploadSupportRequestCurrentLocation } from '@/features/support-request/api';
import { TERMINAL_STATUSES } from '@/features/support-request/types';
import { useCurrentLocation } from '@/features/home/hooks/use-current-location';
import { useAuth } from '@/providers/auth-provider';
import { queryKeys } from '@/lib/query/query-keys';

export function usePassengerLocationSync() {
  const { role, isAuthenticated } = useAuth();
  const lastUploadKeyRef = useRef<string | null>(null);

  const isPassenger = isAuthenticated && role === 'passenger';
  const { currentLocation } = useCurrentLocation(isPassenger);

  const openRequestsQuery = useQuery({
    queryKey: [...queryKeys.supportRequests.all, 'passenger-open-sync'],
    queryFn: () => listSupportRequests('open'),
    enabled: isPassenger,
    refetchInterval: 5000,
  });

  const activeRequest = useMemo(() => {
    const items = openRequestsQuery.data ?? [];
    return items.find((item) => !TERMINAL_STATUSES.includes(item.status));
  }, [openRequestsQuery.data]);

  useEffect(() => {
    if (!isPassenger || !activeRequest || !currentLocation) {
      return;
    }

    const uploadKey = [
      activeRequest.id,
      currentLocation.latitude.toFixed(5),
      currentLocation.longitude.toFixed(5),
    ].join(':');

    if (lastUploadKeyRef.current === uploadKey) {
      return;
    }

    lastUploadKeyRef.current = uploadKey;

    void uploadSupportRequestCurrentLocation(activeRequest.id, {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
    }).catch(() => {
      lastUploadKeyRef.current = null;
    });
  }, [activeRequest, currentLocation, isPassenger]);
}
