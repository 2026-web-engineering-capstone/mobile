import { Text, View } from 'react-native';
import { NaverMapWebView } from '@/features/home/components/naver-map-webview';
import {
  type Coordinate,
  useCurrentLocation,
} from '@/features/home/hooks/use-current-location';

type StationMapInfo = {
  latitude: number;
  longitude: number;
  name: string;
};

type MapSectionProps = {
  routePath?: Coordinate[];
  station: StationMapInfo;
};

const NAVER_MAP_CLIENT_ID = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID ?? '';

export function MapSection({ routePath, station }: MapSectionProps) {
  const { currentLocation, errorMessage, isLoading } = useCurrentLocation();

  if (!NAVER_MAP_CLIENT_ID) {
    return (
      <View className="h-[235px] items-center justify-center rounded-[10px] bg-default-100 px-6">
        <Text className="text-center text-sm leading-6 text-default-500">
          `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID`가 설정되지 않았습니다.
        </Text>
        <Text className="mt-1 text-center text-sm leading-6 text-default-500">
          Naver Maps JS v3를 불러오려면 클라이언트 아이디가 필요합니다.
        </Text>
      </View>
    );
  }

  return (
    <View className="h-[235px] overflow-hidden rounded-[10px] bg-[#eef2f7]">
      <NaverMapWebView
        clientId={NAVER_MAP_CLIENT_ID}
        currentLocation={currentLocation}
        routePath={routePath}
        station={station}
      />
      {isLoading ? (
        <View className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5">
          <Text className="text-xs text-default-600">현재 위치 확인 중</Text>
        </View>
      ) : null}
      {errorMessage ? (
        <View className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/95 px-3 py-2">
          <Text className="text-xs leading-5 text-danger">{errorMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}
