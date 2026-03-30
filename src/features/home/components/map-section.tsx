import { Text, View } from 'react-native';
import { NativeNaverMap } from '@/features/home/components/native-naver-map';
import {
  type Coordinate,
  useCurrentLocation,
} from '@/features/home/hooks/use-current-location';
import type { StationInfo } from '@/features/home/types';

type MapSectionProps = {
  routePath?: Coordinate[];
  station: StationInfo;
};

function resolveNaverMapClientId() {
  const directClientId = process.env.EXPO_PUBLIC_NAVER_MAP_CLIENT_ID;

  if (directClientId) {
    return directClientId;
  }

  const legacyPageUrl = process.env.EXPO_PUBLIC_NAVER_MAP_PAGE_URL;

  if (!legacyPageUrl) {
    return '';
  }

  try {
    return new URL(legacyPageUrl).searchParams.get('ncpKeyId') ?? '';
  } catch {
    return '';
  }
}

const NAVER_MAP_CLIENT_ID = resolveNaverMapClientId();

export function MapSection({ routePath, station }: MapSectionProps) {
  const { currentLocation, errorMessage, isLoading } = useCurrentLocation();

  if (!NAVER_MAP_CLIENT_ID) {
    return (
      <View className="h-60 items-center justify-center rounded-2xl bg-default-100 px-6">
        <Text className="text-center text-sm leading-6 text-default-500">
          `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID`가 설정되지 않았습니다.
        </Text>
        <Text className="mt-1 text-center text-sm leading-6 text-default-500">
          NAVER Cloud의 Mobile App 키를 `.env`에 설정한 뒤 개발 빌드를 다시 생성해주세요.
        </Text>
      </View>
    );
  }

  return (
    <View className="h-60 overflow-hidden rounded-2xl bg-[#eef2f7]">
      <NativeNaverMap
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
