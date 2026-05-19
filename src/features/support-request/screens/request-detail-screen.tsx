import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSupportRequest } from '@/features/support-request/api';
import {
  MEETING_POINT_LABELS,
  SUPPORT_TYPE_LABELS,
} from '@/features/support-request/store/use-request-draft-store';
import { STATUS_COLOR, STATUS_LABELS } from '@/features/support-request/types';
import { useSupportRequestsRealtime } from '@/features/support-request/hooks/use-support-requests-realtime';
import { queryKeys } from '@/lib/query/query-keys';
import { formatKoreanDateTime } from '@/lib/date/format';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between py-2">
      <Text className="text-sm text-default-400">{label}</Text>
      <Text className="max-w-[60%] text-right text-sm font-medium text-foreground">
        {value}
      </Text>
    </View>
  );
}

export function RequestDetailScreen({ requestId }: { requestId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useSupportRequestsRealtime();

  const requestQuery = useQuery({
    queryKey: queryKeys.supportRequests.detail(requestId),
    queryFn: () => getSupportRequest(requestId),
    refetchInterval: 2000,
  });

  if (requestQuery.isLoading || !requestQuery.data) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-sm text-default-400">요청 상세를 불러오는 중...</Text>
      </View>
    );
  }

  const request = requestQuery.data;
  const latestEvent = request.events[request.events.length - 1];

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <View className="gap-6 px-5">
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="text-2xl font-bold tracking-tight text-foreground">
                요청 상세
              </Text>
              <Text className="text-xs text-default-400">{request.id}</Text>
            </View>
            <Chip variant="soft" color={STATUS_COLOR[request.status]} size="sm">
              {STATUS_LABELS[request.status]}
            </Chip>
          </View>

          <Card className="rounded-2xl bg-brand-surface dark:bg-brand-surface-dark">
            <Card.Body className="items-center gap-2 p-5">
              <Text className="text-lg font-bold text-brand dark:text-brand-dark">
                {request.origin_station_name}
              </Text>
              <Text className="text-default-400">↓</Text>
              <Text className="text-lg font-bold text-brand dark:text-brand-dark">
                {request.destination_station_name}
              </Text>
            </Card.Body>
          </Card>

          <Card className="rounded-2xl">
            <Card.Body className="p-4">
              <Text className="mb-2 text-xs font-semibold tracking-wider text-default-400">
                요청 정보
              </Text>
              <InfoRow
                label="지원 유형"
                value={request.support_types
                  .map((supportType) => SUPPORT_TYPE_LABELS[supportType])
                  .join(', ')}
              />
              <Separator />
              <InfoRow
                label="만남 위치"
                value={MEETING_POINT_LABELS[request.meeting_point]}
              />
              <Separator />
              <InfoRow
                label="담당 역무원"
                value={request.assigned_staff_name ?? '배정 대기'}
              />
              <Separator />
              <InfoRow
                label="요청 시간"
                value={formatKoreanDateTime(request.created_at)}
              />
              {request.train_car_number ? (
                <>
                  <Separator />
                  <InfoRow label="탑승 열차" value={request.train_car_number} />
                </>
              ) : null}
              {request.notes ? (
                <>
                  <Separator />
                  <InfoRow label="메모" value={request.notes} />
                </>
              ) : null}
            </Card.Body>
          </Card>

          <Card className="rounded-2xl border border-brand/20 dark:border-brand-dark/20">
            <Card.Body className="gap-2 p-4">
              <Text className="text-sm font-semibold text-brand dark:text-brand-dark">
                현재 안내
              </Text>
              <Text className="text-sm leading-5 text-default-600">
                {latestEvent?.message ?? '요청이 접수되었습니다.'}
              </Text>
            </Card.Body>
          </Card>
        </View>
      </ScrollView>

      <View
        className="flex-row gap-3 border-t border-default-100 bg-background px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          size="lg"
          variant="outline"
          className="flex-1 rounded-xl"
          onPress={() => router.back()}
        >
          뒤로
        </Button>
        <Button
          size="lg"
          className="flex-1 rounded-xl bg-brand dark:bg-brand-dark"
          onPress={() => router.push(`/(app)/support/status/${request.id}` as never)}
        >
          상태 타임라인
        </Button>
      </View>
    </View>
  );
}
