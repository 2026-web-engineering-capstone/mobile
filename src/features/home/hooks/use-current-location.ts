import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type Coordinate = {
  latitude: number;
  longitude: number;
  accuracy_meters?: number | null;
};

type UseCurrentLocationResult = {
  currentLocation: Coordinate | null;
  errorMessage: string | null;
  isLoading: boolean;
};

export function useCurrentLocation(
  enabled = true,
): UseCurrentLocationResult {
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setCurrentLocation(null);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;

    async function initializeLocation() {
      setIsLoading(true);

      const isLocationServicesEnabled = await Location.hasServicesEnabledAsync();
      if (!isMounted) {
        return;
      }

      if (!isLocationServicesEnabled) {
        setErrorMessage(
          '기기의 위치 서비스가 꺼져 있어 현재 위치를 확인할 수 없습니다.',
        );
        setIsLoading(false);
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!isMounted) {
        return;
      }

      if (status !== 'granted') {
        setErrorMessage('위치 권한이 없어 현재 위치를 표시할 수 없습니다.');
        setIsLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!isMounted) {
        return;
      }

      setErrorMessage(null);
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy_meters: location.coords.accuracy ?? null,
      });
      setIsLoading(false);

      const nextSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (nextLocation) => {
          if (!isMounted) {
            return;
          }

          setCurrentLocation({
            latitude: nextLocation.coords.latitude,
            longitude: nextLocation.coords.longitude,
            accuracy_meters: nextLocation.coords.accuracy ?? null,
          });
          setErrorMessage(null);
        },
      );

      if (!isMounted) {
        nextSubscription.remove();
        return;
      }

      subscription = nextSubscription;
    }

    initializeLocation().catch((error: unknown) => {
      if (!isMounted) {
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : '현재 위치를 불러오지 못했습니다.',
      );
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [enabled]);

  return {
    currentLocation,
    errorMessage,
    isLoading,
  };
}
