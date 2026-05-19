import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  assignSupportRequest,
  getSupportRequest,
  updateSupportRequestStatus,
} from '@/features/support-request/api';
import { queryKeys } from '@/lib/query/query-keys';
import { queryClient } from '@/lib/query/query-client';
import { MEETING_POINT_LABELS, SUPPORT_TYPE_LABELS } from '@/features/support-request/store/use-request-draft-store';
import { STATUS_COLOR, STATUS_LABELS, type SupportRequestStatus } from '@/features/support-request/types';
import { useSupportRequestsRealtime } from '@/features/support-request/hooks/use-support-requests-realtime';
import { formatKoreanDateTime } from '@/lib/date/format';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between py-2">
      <Text className="text-sm text-default-400">{label}</Text>
      <Text className="max-w-[62%] text-right text-sm font-medium text-foreground">
        {value}
      </Text>
    </View>
  );
}

function getNextAction(status: SupportRequestStatus) {
  switch (status) {
    case 'submitted':
      return { label: '요청 수락', run: 'assign' as const };
    case 'assigned':
      return { label: '지원 시작', run: 'start' as const };
    case 'in_progress':
      return { label: '열차 정보 입력', run: 'train' as const };
    case 'boarded':
      return { label: '하차 대기 전환', run: 'awaiting' as const };
    case 'awaiting_dropoff':
      return { label: '지원 완료', run: 'complete' as const };
    default:
      return null;
  }
}

export function StaffRequestDetailScreen({ requestId }: { requestId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useSupportRequestsRealtime();

  const requestQuery = useQuery({
    queryKey: queryKeys.supportRequests.detail(requestId),
    queryFn: () => getSupportRequest(requestId),
    refetchInterval: 2000,
  });

  const transitionMutation = useMutation({
    mutationFn: async (run: 'assign' | 'start' | 'awaiting' | 'complete') => {
      if (run === 'assign') {
        return assignSupportRequest(requestId);
      }
      if (run === 'start') {
        return updateSupportRequestStatus(requestId, {
          status: 'in_progress',
        });
      }
      if (run === 'awaiting') {
        return updateSupportRequestStatus(requestId, {
          status: 'awaiting_dropoff',
        });
      }
      return updateSupportRequestStatus(requestId, {
        status: 'completed',
        completion_note: '승차 지원과 하차역 전달을 완료했습니다.',
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.supportRequests.detail(requestId),
      });
    },
  });

  const nextAction = useMemo(
    () => (requestQuery.data ? getNextAction(requestQuery.data.status) : null),
    [requestQuery.data],
  );

  if (requestQuery.isLoading || !requestQuery.data) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-sm text-default-400">요청 상세를 불러오는 중...</Text>
      </View>
    );
  }

  const request = requestQuery.data;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 120,
        }}
      >
        <View className="gap-6 px-5">
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="text-2xl font-bold tracking-tight text-foreground">
                요청 처리
              </Text>
              <Text className="text-xs text-default-400">{request.id}</Text>
            </View>
            <Chip variant="soft" size="sm" color={STATUS_COLOR[request.status]}>
              {STATUS_LABELS[request.status]}
            </Chip>
          </View>

          <Card className="rounded-2xl bg-brand-surface dark:bg-brand-surface-dark">
            <Card.Body className="gap-2 p-5">
              <Text className="text-lg font-bold text-foreground">
                {request.passenger_name}
              </Text>
              <Text className="text-sm text-default-500">
                {request.origin_station_name} → {request.destination_station_name}
              </Text>
              <Text className="text-sm text-default-500">
                {request.support_types
                  .map((supportType) => SUPPORT_TYPE_LABELS[supportType])
                  .join(' · ')}
              </Text>
            </Card.Body>
          </Card>

          <Card className="rounded-2xl">
            <Card.Body className="p-4">
              <Text className="mb-2 text-xs font-semibold tracking-wider text-default-400">
                요청 정보
              </Text>
              <InfoRow
                label="만남 위치"
                value={MEETING_POINT_LABELS[request.meeting_point]}
              />
              <Separator />
              <InfoRow
                label="담당 역무원"
                value={request.assigned_staff_name ?? '미배정'}
              />
              <Separator />
              <InfoRow
                label="요청 시각"
                value={formatKoreanDateTime(request.created_at)}
              />
              <Separator />
              <InfoRow label="메모" value={request.notes || '없음'} />
              {request.train_car_number ? (
                <>
                  <Separator />
                  <InfoRow label="탑승 열차 번호" value={request.train_car_number} />
                </>
              ) : null}
            </Card.Body>
          </Card>

          <Card className="rounded-2xl border border-brand/20 dark:border-brand-dark/20">
            <Card.Body className="gap-2 p-4">
              <Text className="text-sm font-semibold text-brand dark:text-brand-dark">
                처리 안내
              </Text>
              <Text className="text-sm leading-5 text-default-600">
                {request.events[request.events.length - 1]?.message ??
                  '진행 상황에 맞춰 다음 단계를 처리해주세요.'}
              </Text>
            </Card.Body>
          </Card>
        </View>
      </ScrollView>

      <View
        className="gap-3 border-t border-default-100 bg-background px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {nextAction ? (
          <Button
            size="lg"
            className="rounded-xl bg-brand dark:bg-brand-dark"
            onPress={() => {
              if (nextAction.run === 'train') {
                router.push(`/(app)/staff-support/train?requestId=${request.id}` as never);
                return;
              }
              transitionMutation.mutate(nextAction.run);
            }}
          >
            {nextAction.label}
          </Button>
        ) : null}
        <View className="flex-row gap-3">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 rounded-xl"
            onPress={() => router.back()}
          >
            목록으로
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1 rounded-xl"
            onPress={() => router.push(`/(app)/staff-support?requestId=${request.id}` as never)}
          >
            지도 보기
          </Button>
        </View>
      </View>
    </View>
  );
}
