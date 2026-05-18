import { useQuery } from '@tanstack/react-query';
import { fetchStationArrivals } from '@/features/transit/api/transit';
import { queryKeys } from '@/lib/query/query-keys';

export function useStationArrivals(stationName: string | null) {
  return useQuery({
    queryKey: stationName
      ? queryKeys.transit.arrivals(stationName)
      : ['transit', 'arrivals', 'disabled'],
    queryFn: () => fetchStationArrivals(stationName as string),
    enabled: Boolean(stationName),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    retry: 1,
  });
}
