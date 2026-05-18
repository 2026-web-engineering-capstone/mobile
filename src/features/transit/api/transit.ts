import { apiFetch } from '@/lib/api/client';
import type { ApiEnvelope } from '@/lib/api/types';
import type { StationArrivals, StationFacilities } from '@/features/transit/types';

export async function fetchStationArrivals(
  stationName: string,
): Promise<StationArrivals> {
  const envelope = await apiFetch<ApiEnvelope<StationArrivals>>(
    `/transit/arrivals?station_name=${encodeURIComponent(stationName)}`,
  );

  if (!envelope.data) {
    throw new Error('실시간 도착 정보 응답이 비어 있어요.');
  }

  return envelope.data;
}

export async function fetchStationFacilities(
  stationName: string,
): Promise<StationFacilities> {
  const envelope = await apiFetch<ApiEnvelope<StationFacilities>>(
    `/transit/facilities?station_name=${encodeURIComponent(stationName)}`,
  );

  if (!envelope.data) {
    throw new Error('역사 편의시설 정보 응답이 비어 있어요.');
  }

  return envelope.data;
}
