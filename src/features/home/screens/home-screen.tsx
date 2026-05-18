import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusChip } from '@/components/ui';
import { Header } from '@/features/home/components/header';
import { MapSection } from '@/features/home/components/map-section';
import { StationLineIcon } from '@/features/home/components/station-line-icon';
import { StationSelector } from '@/features/home/components/station-selector';
import type { StationInfo } from '@/features/home/types';
import { useSupportRequests } from '@/features/support-request/hooks/use-support-requests';
import { LiveArrivalSection } from '@/features/transit/components/live-arrival-section';
import { LiveFacilitiesSection } from '@/features/transit/components/live-facilities-section';
import {
  SUPPORT_REQUEST_STATUS_GUIDES,
  TERMINAL_REQUEST_STATUSES,
} from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';

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

export function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: requests = [] } = useSupportRequests(user?.role === 'passenger');

  const activeRequest = requests.find(
    (request) =>
      request.passenger_name === user?.name &&
      !TERMINAL_REQUEST_STATUSES.includes(request.status),
  );

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

          {/* 진행 중인 요청 우선 노출 */}
          {activeRequest ? (
            <Pressable
              onPress={() =>
                router.push(`/(app)/support/status/${activeRequest.id}`)
              }
              accessibilityRole="button"
              accessibilityLabel="진행 중인 지원 요청 보기"
            >
              <Card className="rounded-3xl border-l-4 border-brand bg-brand-tint dark:border-brand-dark dark:bg-brand-tint-dark">
                <Card.Body className="gap-3 p-5">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-dark">
                      진행 중인 요청
                    </Text>
                    <StatusChip status={activeRequest.status} size="sm" />
                  </View>
                  <Text className="text-lg font-bold text-foreground">
                    {activeRequest.origin_station_name}{' '}
                    <Text className="text-default-300">→</Text>{' '}
                    {activeRequest.destination_station_name}
                  </Text>
                  <Text className="text-sm leading-5 text-default-600">
                    {SUPPORT_REQUEST_STATUS_GUIDES[activeRequest.status]}
                  </Text>
                  <Text className="text-xs font-semibold text-brand dark:text-brand-dark">
                    상태 자세히 보기 →
                  </Text>
                </Card.Body>
              </Card>
            </Pressable>
          ) : null}

          <MapSection station={STATION} />

          <View className="gap-1">
            <Text className="text-2xl font-light tracking-tight text-foreground">
              현재 도움을 요청할 수 있는 역은
            </Text>
            <Text className="text-2xl font-light tracking-tight text-foreground">
              <Text
                style={{ color: STATION.line.colors.primary }}
                className="font-medium"
              >
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

          <LiveArrivalSection stationName={STATION.name} />

          <LiveFacilitiesSection stationName={STATION.name} />

          {/* 주요 CTA */}
          <View className="mt-2 gap-2">
            <Button
              size="lg"
              className="rounded-2xl bg-brand dark:bg-brand-dark"
              onPress={() => router.push('/(app)/support/new')}
            >
              {activeRequest ? '추가로 새 요청 만들기' : '지금 지원 요청하기'}
            </Button>
            <Text className="text-center text-xs text-default-400">
              출발·도착 역과 지원 유형을 선택해 빠르게 요청할 수 있어요
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
