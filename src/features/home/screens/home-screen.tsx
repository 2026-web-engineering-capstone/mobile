import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrivalCard } from '@/features/home/components/arrival-card';
import { FacilitiesGrid } from '@/features/home/components/facilities-grid';
import { Header } from '@/features/home/components/header';
import { MapSection } from '@/features/home/components/map-section';
import { StationLineIcon } from '@/features/home/components/station-line-icon';
import { StationSelector } from '@/features/home/components/station-selector';
import type { StationInfo } from '@/features/home/types';

const STATION: StationInfo = {
  latitude: 37.3864,
  longitude: 126.6393,
  name: '인천대입구역',
  previous: '지식정보단지',
  next: '센트럴파크',
  line: {
    label: '인',
    colors: {
      primary: '#3681cb',
      soft: '#759cce',
    },
  },
};

const FACILITIES = [
  { label: '수유실', available: true },
  { label: '장애인화장실', available: true },
  { label: '엘리베이터', available: true },
  { label: '휠체어 리프트', available: false },
];

export function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="gap-6 px-5">
          <Header />
          <MapSection station={STATION} />

          <View className="gap-1">
            <Text className="text-2xl font-light tracking-tight text-foreground">
              현재 도움을 요청할 수 있는 역은
            </Text>
            <Text className="text-2xl font-light tracking-tight text-foreground">
              <Text style={{ color: STATION.line.colors.primary }} className="font-medium">
                {STATION.name}
              </Text>{' '}
              입니다.
            </Text>
          </View>

          <StationLineIcon line={STATION.line} />
          <StationSelector
            currentStation={STATION.name.replace('역', '')}
            line={STATION.line}
            nextStation={STATION.next}
            previousStation={STATION.previous}
          />

          <View className="gap-4">
            <Text className="text-xl font-bold tracking-tight text-foreground">
              도착 정보
            </Text>
            <View className="flex-row gap-3">
              <ArrivalCard
                title="계양 방면"
                rows={[
                  { destination: '계양', eta: '5분' },
                  { destination: '계양', eta: '12분' },
                ]}
                etaColor={STATION.line.colors.soft}
              />
              <ArrivalCard
                title="송도달빛축제공원 방면"
                rows={[
                  { destination: '송도달빛축제공원', eta: '5분' },
                  { destination: '송도달빛축제공원', eta: '12분' },
                ]}
                etaColor={STATION.line.colors.soft}
              />
            </View>
          </View>

          <View className="gap-4">
            <Text className="text-xl font-bold tracking-tight text-foreground">
              교통약자 시설
            </Text>
            <FacilitiesGrid facilities={FACILITIES} />
          </View>

          <View className="mt-2">
            <Button onPress={() => router.push('/(app)/support/new')}>
              교통지원 요청
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
