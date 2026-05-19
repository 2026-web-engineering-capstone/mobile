import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cancelSupportRequest, getSupportRequest } from '@/features/support-request/api';
import {
  MEETING_POINT_LABELS,
  SUPPORT_TYPE_LABELS,
} from '@/features/support-request/store/use-request-draft-store';
import {
  STATUS_COLOR,
  STATUS_LABELS,
  TERMINAL_STATUSES,
  type SupportRequestDetail,
  type SupportRequestStatus,
} from '@/features/support-request/types';
import { useSupportRequestsRealtime } from '@/features/support-request/hooks/use-support-requests-realtime';
import { queryClient } from '@/lib/query/query-client';
import { queryKeys } from '@/lib/query/query-keys';
import { formatKoreanTime } from '@/lib/date/format';

type TimelineStep = {
  status: SupportRequestStatus;
  label: string;
  guide: string;
};

const TIMELINE_STEPS: TimelineStep[] = [
  {
    status: 'submitted',
    label: '접수 완료',
    guide: '요청이 정상적으로 접수되었습니다.',
  },
  {
    status: 'assigned',
    label: '역무원 배정',
    guide: '담당 역무원이 요청을 확인하고 있습니다.',
  },
  {
    status: 'in_progress',
    label: '지원 중',
    guide: '역무원이 만남 장소로 이동하고 있습니다.',
  },
  {
    status: 'boarded',
    label: '승차 완료',
    guide: '승차 후 열차 정보가 공유됩니다.',
  },
  {
    status: 'awaiting_dropoff',
    label: '하차 대기',
    guide: '하차 역 역무원이 마중을 준비합니다.',
  },
  {
    status: 'completed',
    label: '지원 완료',
    guide: '안전하게 하차가 완료됩니다.',
  },
];

function getCurrentStepIndex(status: SupportRequestStatus) {
  if (status === 'cancelled' || status === 'unavailable') {
    return TIMELINE_STEPS.findIndex((step) => step.status === 'submitted');
  }

  return Math.max(
    TIMELINE_STEPS.findIndex((step) => step.status === status),
    0,
  );
}

function getEventForStatus(request: SupportRequestDetail, status: SupportRequestStatus) {
  return [...request.events]
    .reverse()
    .find((event) => event.to_status === status);
}

function getStepTime(request: SupportRequestDetail, status: SupportRequestStatus) {
  const event = getEventForStatus(request, status);
  const value = event?.created_at ?? (status === 'submitted' ? request.created_at : null);

  return value ? formatKoreanTime(value) : null;
}

export function RequestStatusScreen({ requestId }: { requestId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useSupportRequestsRealtime();

  const requestQuery = useQuery({
    queryKey: queryKeys.supportRequests.detail(requestId),
    queryFn: () => getSupportRequest(requestId),
    refetchInterval: 2000,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelSupportRequest(requestId, 'no_longer_needed'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.supportRequests.detail(requestId),
      });
    },
  });

  if (requestQuery.isLoading || !requestQuery.data) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-sm text-default-400">지원 상태를 불러오는 중...</Text>
      </View>
    );
  }

  const request = requestQuery.data;
  const currentStep = getCurrentStepIndex(request.status);
  const latestEvent = request.events[request.events.length - 1];
  const isTerminal = TERMINAL_STATUSES.includes(request.status);

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
                지원 상태
              </Text>
              <Text className="text-xs text-default-400">{request.id}</Text>
            </View>
            <Chip variant="soft" color={STATUS_COLOR[request.status]} size="sm">
              {STATUS_LABELS[request.status]}
            </Chip>
          </View>

          <Card className="rounded-2xl bg-brand-surface dark:bg-brand-surface-dark">
            <Card.Body className="gap-2 p-4">
              <Text className="text-base font-semibold text-foreground">
                {request.origin_station_name} → {request.destination_station_name}
              </Text>
              <Text className="text-sm text-default-500">
                {request.support_types
                  .map((supportType) => SUPPORT_TYPE_LABELS[supportType])
                  .join(' · ')}
                {' · '}
                {MEETING_POINT_LABELS[request.meeting_point]} 만남
              </Text>
              <Text className="text-xs text-default-400">
                담당 역무원: {request.assigned_staff_name ?? '배정 대기'}
              </Text>
            </Card.Body>
          </Card>

          <View>
            {TIMELINE_STEPS.map((step, index) => {
              const event = getEventForStatus(request, step.status);
              const isDone = index <= currentStep && request.status !== 'cancelled';
              const isCurrent =
                step.status === request.status ||
                (request.status === 'unavailable' && index === currentStep);
              const stepTime = getStepTime(request, step.status);

              return (
                <View key={step.status} className="flex-row">
                  <View className="mr-4 w-6 items-center">
                    <View
                      className={`h-6 w-6 items-center justify-center rounded-full ${
                        isCurrent
                          ? 'bg-brand dark:bg-brand-dark'
                          : isDone
                            ? 'bg-brand-soft dark:bg-brand-soft-dark'
                            : 'border-2 border-default-200 bg-background'
                      }`}
                    >
                      {isDone || isCurrent ? (
                        <Text className="text-xs font-bold text-white">
                          {isCurrent ? '●' : '✓'}
                        </Text>
                      ) : (
                        <Text className="text-[10px] text-default-300">
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    {index < TIMELINE_STEPS.length - 1 ? (
                      <View
                        className={`w-0.5 flex-1 ${
                          isDone ? 'bg-brand-soft dark:bg-brand-soft-dark' : 'bg-default-200'
                        }`}
                        style={{ minHeight: 40 }}
                      />
                    ) : null}
                  </View>

                  <View
                    className={`mb-4 flex-1 rounded-xl px-4 py-3 ${
                      isCurrent ? 'bg-brand-tint dark:bg-brand-tint-dark' : 'bg-default-50'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`text-sm font-semibold ${
                          isDone || isCurrent ? 'text-foreground' : 'text-default-300'
                        }`}
                      >
                        {step.label}
                      </Text>
                      {stepTime ? (
                        <Text className="text-xs text-default-400">{stepTime}</Text>
                      ) : null}
                    </View>
                    <Text
                      className={`mt-1 text-xs leading-4 ${
                        isDone || isCurrent ? 'text-default-500' : 'text-default-300'
                      }`}
                    >
                      {event?.message ?? step.guide}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Separator />

          <Card className="rounded-2xl">
            <Card.Body className="gap-2 p-4">
              <Text className="text-sm font-semibold text-foreground">
                다음 안내
              </Text>
              <Text className="text-sm leading-5 text-default-500">
                {latestEvent?.message ?? '요청 진행 상황이 여기에 표시됩니다.'}
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
          variant="danger-soft"
          className="flex-1 rounded-xl"
          isDisabled={isTerminal || cancelMutation.isPending}
          onPress={() => cancelMutation.mutate()}
        >
          {cancelMutation.isPending ? '취소 중...' : '요청 취소'}
        </Button>
        <Button
          size="lg"
          className="flex-1 rounded-xl bg-brand dark:bg-brand-dark"
          onPress={() => router.push(`/(app)/support/${request.id}` as never)}
        >
          상세 보기
        </Button>
      </View>
    </View>
  );
}
