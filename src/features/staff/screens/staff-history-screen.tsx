import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { listSupportRequests } from '@/features/support-request/api';
import { queryKeys } from '@/lib/query/query-keys';
import { STATUS_COLOR, STATUS_LABELS } from '@/features/support-request/types';
import { SUPPORT_TYPE_LABELS } from '@/features/support-request/store/use-request-draft-store';
import { useSupportRequestsRealtime } from '@/features/support-request/hooks/use-support-requests-realtime';
import { formatKoreanDateTime } from '@/lib/date/format';

export function StaffHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useSupportRequestsRealtime();
  const requestsQuery = useQuery({
    queryKey: [...queryKeys.supportRequests.all, 'staff-history'],
    queryFn: () => listSupportRequests('history'),
    refetchInterval: 4000,
  });
  const requests = requestsQuery.data ?? [];

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
              처리 내역
            </Text>
            <Text className="text-sm text-default-400">
              최근 지원 완료 및 종료 기록
            </Text>
          </View>

          <View className="gap-3">
            {requests.map((request) => (
              <Pressable
                key={request.id}
                onPress={() => router.push(`/(app)/support/${request.id}` as never)}
              >
                <Card className="rounded-2xl">
                  <Card.Body className="gap-3 p-4">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 gap-1">
                        <Text className="text-base font-semibold text-foreground">
                          {request.passenger_name} · {request.origin_station_name} →{' '}
                          {request.destination_station_name}
                        </Text>
                        <Text className="text-xs text-default-400">
                          {formatKoreanDateTime(request.updated_at)}
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
                    <Text className="text-sm text-default-500">
                      {request.support_types
                        .map((supportType) => SUPPORT_TYPE_LABELS[supportType])
                        .join(' · ')}
                    </Text>
                  </Card.Body>
                </Card>
              </Pressable>
            ))}
            {!requests.length && !requestsQuery.isLoading ? (
              <Card className="rounded-2xl">
                <Card.Body className="p-6">
                  <Text className="text-center text-sm text-default-400">
                    아직 처리 완료된 요청이 없습니다.
                  </Text>
                </Card.Body>
              </Card>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
