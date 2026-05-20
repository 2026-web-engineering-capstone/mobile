import type { Coordinate } from '@/features/home/hooks/use-current-location';
import type { StationInfo } from '@/features/home/types';

// Haversine 거리(km). 두 좌표 사이 대권 거리.
export function haversineKm(a: Coordinate, b: Coordinate): number {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function findNearestStation(
  location: Coordinate,
  stations: readonly StationInfo[],
): StationInfo | null {
  if (stations.length === 0) {
    return null;
  }

  let bestStation: StationInfo = stations[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const station of stations) {
    const distance = haversineKm(location, {
      latitude: station.latitude,
      longitude: station.longitude,
    });
    if (distance < bestDistance) {
      bestDistance = distance;
      bestStation = station;
    }
  }

  return bestStation;
}
