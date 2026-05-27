import { useQuery } from '@tanstack/react-query';

import { listNearestStations } from '@/features/support-request/api/support-requests';
import { queryKeys } from '@/lib/query/query-keys';

export function useNearestStations(
  lat: number | null,
  lng: number | null,
  limit = 5,
) {
  return useQuery({
    queryKey: queryKeys.stations.nearest(lat ?? 0, lng ?? 0),
    queryFn: () => listNearestStations(lat!, lng!, limit),
    enabled: lat !== null && lng !== null,
  });
}
