import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type Coordinate = {
  latitude: number;
  longitude: number;
};

type UseCurrentLocationResult = {
  currentLocation: Coordinate | null;
  errorMessage: string | null;
  isLoading: boolean;
};

export function useCurrentLocation(): UseCurrentLocationResult {
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;

    async function initializeLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        if (isMounted) {
          setErrorMessage('위치 권한이 없어 현재 위치를 표시할 수 없습니다.');
          setIsLoading(false);
        }
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (isMounted) {
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setIsLoading(false);
      }

      subscription = await Location.watchPositionAsync(
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
          });
        },
      );
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
  }, []);

  return {
    currentLocation,
    errorMessage,
    isLoading,
  };
}
