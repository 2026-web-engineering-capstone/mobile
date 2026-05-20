import { apiFetch } from '@/lib/api/client';
import type { StationArrivals, StationFacilities } from '@/features/transit/types';

export async function fetchStationArrivals(
  stationName: string,
): Promise<StationArrivals> {
  return apiFetch<StationArrivals>(
    `/transit/arrivals?station_name=${encodeURIComponent(stationName)}`,
  );
}

export async function fetchStationFacilities(
  stationName: string,
): Promise<StationFacilities> {
  return apiFetch<StationFacilities>(
    `/transit/facilities?station_name=${encodeURIComponent(stationName)}`,
  );
}
