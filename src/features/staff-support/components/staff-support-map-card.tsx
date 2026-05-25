import { Text, View } from 'react-native';

import { LiveNaverMap } from '@/features/home/components/live-naver-map';
import type { Coordinate } from '@/features/home/hooks/use-current-location';
import type { StationInfo } from '@/features/home/types';

type StaffSupportMapCardProps = {
  currentLocation: Coordinate | null;
  station: StationInfo;
};

export function StaffSupportMapCard({
  currentLocation,
  station,
}: StaffSupportMapCardProps) {
  return (
    <View className="overflow-hidden rounded-2xl bg-default-100">
      <View className="h-80">
        <LiveNaverMap currentLocation={currentLocation} station={station} />
      </View>
      {!currentLocation ? (
        <View className="absolute bottom-4 left-4 rounded-full bg-background/95 px-3 py-1.5">
          <Text className="text-xs text-default-600">위치 신호 수신 대기 중</Text>
        </View>
      ) : null}
    </View>
  );
}
