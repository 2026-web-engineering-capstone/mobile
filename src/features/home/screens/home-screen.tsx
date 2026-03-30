import {
  Dimensions,
  ScrollView,
  Text,
  View,
} from 'react-native';
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

const HORIZONTAL_PADDING = 18;
const CARD_GAP = 10;
const SCREEN_WIDTH = Dimensions.get('window').width;
const ARRIVAL_CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

const STATION = {
  latitude: 37.3864,
  longitude: 126.6393,
  lineLabel: '인',
  name: '인천대입구역',
  previous: '지식정보단지',
  next: '센트럴파크',
};

const ARRIVAL_CARDS = [
  {
    title: '계양 방면',
    rows: [
      { destination: '계양', eta: '5분' },
      { destination: '계양', eta: '12분' },
    ],
  },
  {
    title: '송도달빛축제공원 방면',
    rows: [
      { destination: '송도달빛축제공원', eta: '5분' },
      { destination: '송도달빛축제공원', eta: '12분' },
    ],
  },
];

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
    <View className="flex-1 bg-white">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1 bg-white"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          paddingTop: insets.top + 10,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="gap-[22px] px-[18px]">
          <Header />
          <MapSection station={STATION} />

          <View className="gap-0.5">
            <Text className="text-[20px] font-light tracking-[-0.6px] text-[#111111]">
              현재 도움을 요청할 수 있는 역은
            </Text>
            <Text className="text-[20px] font-light tracking-[-0.6px] text-[#111111]">
              <Text className="font-medium text-[#3681cb]">{STATION.name}</Text>{' '}
              입니다.
            </Text>
          </View>

          <StationLineIcon lineLabel={STATION.lineLabel} />
          <StationSelector
            currentStation={STATION.name.replace('역', '')}
            lineLabel={STATION.lineLabel}
            nextStation={STATION.next}
            previousStation={STATION.previous}
          />

          <View className="gap-[14px]">
            <Text className="text-[18px] font-bold tracking-[-0.6px] text-[#111111]">
              도착 정보
            </Text>
            <View className="flex-row justify-between">
              {ARRIVAL_CARDS.map((card) => (
                <ArrivalCard
                  key={card.title}
                  width={ARRIVAL_CARD_WIDTH}
                  title={card.title}
                  rows={card.rows}
                />
              ))}
            </View>
          </View>

          <View className="gap-[14px]">
            <Text className="text-[18px] font-bold tracking-[-0.6px] text-[#111111]">
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
