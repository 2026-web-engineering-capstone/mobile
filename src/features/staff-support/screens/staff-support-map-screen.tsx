import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from 'heroui-native/button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  fetchActiveStaffSupport,
  startStaffSupport,
} from '@/features/staff-support/api';
import { StaffSupportMapCard } from '@/features/staff-support/components/staff-support-map-card';
import { getStationInfoById } from '@/features/staff-support/station-metadata';
import { useSupportRequestsRealtime } from '@/features/support-request/hooks/use-support-requests-realtime';

export function StaffSupportMapScreen() {
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useSupportRequestsRealtime();

  const supportQuery = useQuery({
    queryKey: ['staff-support', 'active', requestId],
    queryFn: () => fetchActiveStaffSupport(requestId),
    refetchInterval: 2000,
  });

  const startMutation = useMutation({
    mutationFn: (requestId: string) => startStaffSupport(requestId),
    onSuccess: (data) => {
      router.push(
        `/(app)/staff-support/train?requestId=${data.request_id}` as never,
      );
    },
  });

  const currentLocation = supportQuery.data?.current_location
    ? {
        latitude: supportQuery.data.current_location.latitude,
        longitude: supportQuery.data.current_location.longitude,
      }
    : null;
  const station = getStationInfoById(supportQuery.data?.origin_station_id);

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View
        className="flex-1 justify-between px-5"
        style={{
          paddingTop: insets.top + 18,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <View className="gap-5">
          <Text className="text-lg font-semibold text-foreground">
            교움
          </Text>
          {supportQuery.isLoading ? (
            <View className="items-center justify-center rounded-2xl bg-default-50 px-4 py-12">
              <Text className="text-sm text-default-400">
                지원 요청 정보를 불러오는 중입니다.
              </Text>
            </View>
          ) : supportQuery.isError || !supportQuery.data ? (
            <View className="items-center justify-center rounded-2xl bg-default-50 px-4 py-12">
              <Text className="text-sm text-default-400">
                현재 진행할 지원 요청이 없습니다.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {station ? (
                <>
                  <StaffSupportMapCard
                    currentLocation={currentLocation}
                    station={station}
                  />
                  <Text className="text-2xl font-semibold leading-9 text-foreground">
                    교통약자의 현재 위치가 지도에{'\n'}표시됩니다.
                  </Text>
                </>
              ) : (
                <View className="items-center justify-center rounded-2xl bg-default-50 px-4 py-12">
                  <Text className="text-sm text-default-400">
                    지원 요청 역 정보를 불러오지 못했습니다.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Button
          size="lg"
          className="rounded-xl bg-brand dark:bg-brand-dark"
          isDisabled={!supportQuery.data}
          onPress={() => {
            if (!supportQuery.data) return;
            if (supportQuery.data.status === 'in_progress') {
              router.push(
                `/(app)/staff-support/train?requestId=${supportQuery.data.request_id}` as never,
              );
              return;
            }
            startMutation.mutate(supportQuery.data.request_id);
          }}
        >
          {startMutation.isPending
            ? '시작 중...'
            : supportQuery.data?.status === 'in_progress'
              ? '열차 정보 입력'
              : '교통지원 시작'}
        </Button>
      </View>
    </View>
  );
}
