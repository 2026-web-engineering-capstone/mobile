import { useQuery } from '@tanstack/react-query';
import { fetchStationFacilities } from '@/features/transit/api/transit';
import { queryKeys } from '@/lib/query/query-keys';

export function useStationFacilities(stationName: string | null) {
  return useQuery({
    queryKey: stationName
      ? queryKeys.transit.facilities(stationName)
      : ['transit', 'facilities', 'disabled'],
    queryFn: () => fetchStationFacilities(stationName as string),
    enabled: Boolean(stationName),
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
}
