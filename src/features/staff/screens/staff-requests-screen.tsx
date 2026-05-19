import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { assignSupportRequest, listSupportRequests } from '@/features/support-request/api';
import { queryKeys } from '@/lib/query/query-keys';
import { queryClient } from '@/lib/query/query-client';
import { MEETING_POINT_LABELS, SUPPORT_TYPE_LABELS } from '@/features/support-request/store/use-request-draft-store';
import { STATUS_COLOR, STATUS_LABELS } from '@/features/support-request/types';
import { useSupportRequestsRealtime } from '@/features/support-request/hooks/use-support-requests-realtime';
import { formatKoreanDateTime } from '@/lib/date/format';

export function StaffRequestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useSupportRequestsRealtime();
  const requestsQuery = useQuery({
    queryKey: [...queryKeys.supportRequests.all, 'open'],
    queryFn: () => listSupportRequests('open'),
    refetchInterval: 2000,
  });
  const requests = (requestsQuery.data ?? []).filter(
    (request) => request.status === 'submitted',
  );

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => assignSupportRequest(requestId),
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
          paddingBottom: insets.bottom + 32,
        }}
      >
        <View className="gap-5 px-5">
          <View className="gap-1">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              지원 요청함
            </Text>
            <Text className="text-sm text-default-400">
              접수부터 하차 대기까지 실시간으로 관리합니다
            </Text>
          </View>

          {requests.map((request) => (
            <Card key={request.id} className="rounded-2xl">
              <Card.Body className="gap-4 p-4">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 gap-1">
                    <Text className="text-base font-semibold text-foreground">
                      {request.passenger_name}
                    </Text>
                    <Text className="text-xs text-default-400">
                      {request.id} · {formatKoreanDateTime(request.created_at)}
                    </Text>
                  </View>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={STATUS_COLOR[request.status]}
                  >
                    {STATUS_LABELS[request.status]}
                  </Chip>
                </View>

                <Separator />

                <View className="gap-2">
                  <Text className="text-sm font-medium text-foreground">
                    {request.origin_station_name} → {request.destination_station_name}
                  </Text>
                  <Text className="text-sm text-default-500">
                    {request.support_types
                      .map((supportType) => SUPPORT_TYPE_LABELS[supportType])
                      .join(' · ')}
                  </Text>
                  <Text className="text-sm text-default-500">
                    만남 위치: {MEETING_POINT_LABELS[request.meeting_point]}
                  </Text>
                  <Text className="text-sm text-default-500">
                    담당: {request.assigned_staff_name ?? '미배정'}
                  </Text>
                </View>

                <View className="flex-row gap-2">
                  <Button
                    className="flex-1 rounded-xl bg-brand dark:bg-brand-dark"
                    isDisabled={acceptMutation.isPending}
                    onPress={() => acceptMutation.mutate(request.id)}
                  >
                    {acceptMutation.isPending ? '수락 중...' : '수락하러 가기'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl"
                    isDisabled
                  >
                    처리 현황
                  </Button>
                </View>
              </Card.Body>
            </Card>
          ))}
          {!requests.length && !requestsQuery.isLoading ? (
            <Card className="rounded-2xl">
              <Card.Body className="p-6">
                <Text className="text-center text-sm text-default-400">
                  현재 처리할 요청이 없습니다.
                </Text>
              </Card.Body>
            </Card>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
