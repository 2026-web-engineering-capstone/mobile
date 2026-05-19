import { Text, View } from 'react-native';
import { LiveNaverMap } from '@/features/home/components/live-naver-map';
import { useCurrentLocation } from '@/features/home/hooks/use-current-location';
import type { StationInfo } from '@/features/home/types';

type MapSectionProps = {
  station: StationInfo;
};

export function MapSection({ station }: MapSectionProps) {
  const { currentLocation, errorMessage, isLoading } = useCurrentLocation();

  return (
    <View className="h-60 overflow-hidden rounded-2xl bg-default-100">
      <LiveNaverMap currentLocation={currentLocation} station={station} />
      {isLoading ? (
        <View className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1.5">
          <Text className="text-xs text-default-600">현재 위치 확인 중</Text>
        </View>
      ) : null}
      {errorMessage ? (
        <View className="absolute bottom-3 left-3 right-3 rounded-xl bg-background/95 px-3 py-2">
          <Text className="text-xs leading-5 text-danger">{errorMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}
