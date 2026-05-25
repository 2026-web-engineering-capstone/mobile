import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'heroui-native/card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { assignSupportRequest, listSupportRequests } from '@/features/support-request/api';
import { STATUS_LABELS, TERMINAL_STATUSES } from '@/features/support-request/types';
import { queryKeys } from '@/lib/query/query-keys';
import { queryClient } from '@/lib/query/query-client';
import { useSupportRequestsRealtime } from '@/features/support-request/hooks/use-support-requests-realtime';
import { formatKoreanDateTime } from '@/lib/date/format';

export function StaffHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useSupportRequestsRealtime();

  const requestsQuery = useQuery({
    queryKey: [...queryKeys.supportRequests.all, 'dashboard'],
    queryFn: () => listSupportRequests('all'),
    refetchInterval: 2000,
  });

  const requests = requestsQuery.data ?? [];
  const waitingRequest = requests.find((request) => request.status === 'submitted');
  const acceptedRequest = requests.find(
    (request) => request.assigned_staff_name && request.status !== 'submitted',
  );
  const currentStationName = '한성대입구역';

  const acceptMutation = useMutation({
    mutationFn: async (requestId: string) => assignSupportRequest(requestId),
    onSuccess: async (request) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all });
      router.push(`/(app)/staff-support?requestId=${request.id}` as never);
    },
  });

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="gap-5 px-5">
          <View className="gap-1">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              현재 근무하고 있는 역은
            </Text>
          </View>

          <Card className="rounded-2xl bg-brand-surface dark:bg-brand-surface-dark">
            <Card.Body className="p-4">
              <Text className="text-lg font-semibold text-foreground">
                {currentStationName}
              </Text>
            </Card.Body>
          </Card>

          <Text className="text-2xl font-bold tracking-tight text-foreground">
            입니다.
          </Text>

          <View className="gap-3">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              대기중인 교통지원 요청
            </Text>
            <Card className="rounded-2xl bg-default-50">
              <Card.Body className="gap-4 p-5">
                {waitingRequest ? (
                  <>
                    <View className="gap-3">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-default-500">탑승역</Text>
                        <Text className="text-base font-semibold text-foreground">
                          {waitingRequest.origin_station_name}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-default-500">하차역</Text>
                        <Text className="text-base font-semibold text-foreground">
                          {waitingRequest.destination_station_name}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-default-500">요청 시각</Text>
                        <Text className="text-base font-semibold text-foreground">
                          {formatKoreanDateTime(waitingRequest.created_at)}
                        </Text>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-default-500">상태</Text>
                        <Text className="text-base font-semibold text-foreground">
                          {STATUS_LABELS[waitingRequest.status]}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      className="rounded-xl bg-brand px-4 py-4 dark:bg-brand-dark"
                      onPress={() => acceptMutation.mutate(waitingRequest.id)}
                    >
                      <Text className="text-center text-base font-semibold text-white">
                        {acceptMutation.isPending ? '수락 중...' : '교통지원 수락'}
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <Text className="py-4 text-center text-sm text-default-400">
                    현재 대기 중인 교통지원 요청이 없습니다.
                  </Text>
                )}
              </Card.Body>
            </Card>
          </View>

          <View className="gap-3">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              수락한 교통지원 요청
            </Text>
            <Card className="rounded-2xl bg-default-50">
              <Card.Body className="gap-3 p-5">
                {acceptedRequest ? (
                  <Pressable
                    className="rounded-xl bg-background px-4 py-4"
                    onPress={() =>
                      router.push(
                        TERMINAL_STATUSES.includes(acceptedRequest.status)
                          ? (`/(app)/support/${acceptedRequest.id}` as never)
                          : (`/(app)/staff-support?requestId=${acceptedRequest.id}` as never),
                      )
                    }
                  >
                    <Text className="text-base font-semibold text-foreground">
                      {acceptedRequest.origin_station_name} →{' '}
                      {acceptedRequest.destination_station_name}
                    </Text>
                    <Text className="mt-1 text-sm text-default-400">
                      {STATUS_LABELS[acceptedRequest.status]} ·{' '}
                      {formatKoreanDateTime(acceptedRequest.updated_at)}
                    </Text>
                  </Pressable>
                ) : (
                  <Text className="py-8 text-center text-sm text-default-400">
                    아직 수락한 교통지원 요청이 없습니다.
                  </Text>
                )}
              </Card.Body>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
