import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'heroui-native/card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  EmptyView,
  ErrorView,
  LoadingView,
  StatusChip,
} from '@/components/ui';
import {
  MEETING_POINT_LABELS,
  SUPPORT_TYPE_LABELS,
} from '@/features/support-request/store/use-request-draft-store';
import { useSupportRequests } from '@/features/support-request/hooks/use-support-requests';
import {
  getStaffQueueItemClassification,
  type StaffQueueItemClassification,
  type StaffQueueItemKind,
} from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';

type FilterId = 'all' | StaffQueueItemKind;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'origin_processing', label: '출발역 처리' },
  { id: 'destination_handoff', label: '하차역 인계' },
  { id: 'origin_handoff_monitoring', label: '인계 모니터링' },
];

const SUPPORT_TYPE_EMOJI: Record<string, string> = {
  wheelchair: '🦽',
  'visual-guide': '🧑‍🦯',
  'boarding-ramp': '🪜',
};

function formatElapsed(createdAt: string): string {
  const ms = Date.now() - Date.parse(createdAt);
  if (Number.isNaN(ms) || ms < 0) return '방금';
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전 접수`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전 접수`;
  const days = Math.floor(hours / 24);
  return `${days}일 전 접수`;
}

function primaryActionLabel(
  status: string,
  classification: StaffQueueItemClassification,
): string {
  if (classification.kind === 'destination_handoff') {
    if (status === 'boarded') return '하차 대기 확인';
    if (status === 'awaiting_dropoff') return '하차 지원 완료';
    return '하차 인계 확인';
  }
  if (classification.kind === 'origin_handoff_monitoring') {
    return '진행 상황 보기';
  }
  switch (status) {
    case 'submitted':
      return '나에게 배정';
    case 'assigned':
      return '지원 시작';
    case 'in_progress':
      return '승차 완료 처리';
    case 'boarded':
      return '하차 역 인계';
    case 'awaiting_dropoff':
      return '하차 지원 완료';
    default:
      return '요청 확인';
  }
}

export function StaffQueueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role, user } = useAuth();
  const [filterId, setFilterId] = useState<FilterId>('all');

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useSupportRequests(role === 'staff');

  const queueItems = useMemo(() => {
    return data
      .reduce<
        Array<{
          item: (typeof data)[number];
          classification: StaffQueueItemClassification;
        }>
      >((items, item) => {
        const classification = getStaffQueueItemClassification(item, user);
        if (classification) {
          items.push({ item, classification });
        }
        return items;
      }, [])
      .sort((left, right) => {
        const priorityDiff =
          left.classification.sortPriority -
          right.classification.sortPriority;
        if (priorityDiff !== 0) return priorityDiff;
        return (
          Date.parse(right.item.created_at) -
          Date.parse(left.item.created_at)
        );
      });
  }, [data, user]);

  const filteredItems = useMemo(() => {
    if (filterId === 'all') return queueItems;
    return queueItems.filter(
      (entry) => entry.classification.kind === filterId,
    );
  }, [queueItems, filterId]);

  const counts = useMemo(() => {
    const result: Record<FilterId, number> = {
      all: queueItems.length,
      origin_processing: 0,
      destination_handoff: 0,
      origin_handoff_monitoring: 0,
    };
    for (const entry of queueItems) {
      result[entry.classification.kind] += 1;
    }
    return result;
  }, [queueItems]);

  if (role !== 'staff') {
    return <Redirect href="/(app)/(tabs)" />;
  }

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
        <View className="gap-4 px-5">
          {/* 헤더 */}
          <View className="gap-1">
            <Text className="text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-dark">
              STAFF QUEUE
            </Text>
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              지원 요청 큐
            </Text>
            <Text className="text-sm text-default-400">
              {user?.station_id
                ? `현재 역 기준으로 처리할 요청을 보여드려요`
                : '소속 역 정보가 없어 큐를 표시할 수 없어요'}
            </Text>
          </View>

          {/* 필터 탭 */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {FILTERS.map((filter) => {
              const active = filter.id === filterId;
              const count = counts[filter.id];
              return (
                <Pressable
                  key={filter.id}
                  onPress={() => setFilterId(filter.id)}
                  className={`flex-row items-center gap-1.5 rounded-full px-4 ${
                    active
                      ? 'bg-brand dark:bg-brand-dark'
                      : 'bg-default-100'
                  }`}
                  style={{ minHeight: 36 }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      active
                        ? 'text-white'
                        : 'text-default-500'
                    }`}
                  >
                    {filter.label}
                  </Text>
                  <View
                    className={`rounded-full px-1.5 ${
                      active ? 'bg-white/25' : 'bg-default-200'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        active ? 'text-white' : 'text-default-500'
                      }`}
                    >
                      {count}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* 상태별 분기 */}
          {isLoading ? <LoadingView label="요청 목록을 불러오고 있어요" /> : null}
          {error ? (
            <ErrorView
              title="요청 목록을 불러오지 못했어요"
              message="네트워크 상태를 확인하고 다시 시도해 주세요."
              onRetry={() => {
                void refetch();
              }}
            />
          ) : null}
          {!isLoading && !error && filteredItems.length === 0 ? (
            <EmptyView
              title={
                filterId === 'all'
                  ? '확인할 지원 요청이 없어요'
                  : '해당 분류에 요청이 없어요'
              }
              description="새 요청이 들어오면 자동으로 갱신돼요."
            />
          ) : null}

          {/* 요청 카드 */}
          <View className="gap-3">
            {filteredItems.map(({ item, classification }) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/(app)/support/${item.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${item.origin_station_name}에서 ${item.destination_station_name}으로 가는 요청, ${classification.label}`}
              >
                <Card
                  className={`rounded-2xl ${
                    classification.isActionable
                      ? 'border-l-4 border-brand dark:border-brand-dark'
                      : 'border border-default-200'
                  }`}
                >
                  <Card.Body className="gap-3 p-4">
                    {/* 상단: 상태 + 분류 + 경과시간 */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <StatusChip status={item.status} size="sm" />
                        <Text className="text-xs text-default-400">
                          {classification.label}
                        </Text>
                      </View>
                      <Text className="text-xs text-default-400">
                        {formatElapsed(item.created_at)}
                      </Text>
                    </View>

                    {/* 출발 → 도착 */}
                    <View className="gap-1">
                      <Text className="text-base font-bold text-foreground">
                        {item.origin_station_name}{' '}
                        <Text className="text-default-300">→</Text>{' '}
                        {item.destination_station_name}
                      </Text>
                      <Text className="text-xs text-default-400">
                        요청자 {item.passenger_name}
                        {item.assigned_staff_name
                          ? ` · 담당 ${item.assigned_staff_name}`
                          : ''}
                      </Text>
                    </View>

                    {/* 지원 유형 + 만남 위치 */}
                    <View className="flex-row flex-wrap items-center gap-2">
                      {item.support_types.map((type) => (
                        <View
                          key={type}
                          className="flex-row items-center gap-1 rounded-full bg-brand-tint px-2.5 py-1 dark:bg-brand-tint-dark"
                        >
                          <Text className="text-sm">
                            {SUPPORT_TYPE_EMOJI[type] ?? '·'}
                          </Text>
                          <Text className="text-xs font-medium text-brand dark:text-brand-dark">
                            {SUPPORT_TYPE_LABELS[type]}
                          </Text>
                        </View>
                      ))}
                      <View className="flex-row items-center gap-1 rounded-full bg-default-100 px-2.5 py-1">
                        <Text className="text-xs text-default-500">
                          📍 {MEETING_POINT_LABELS[item.meeting_point]}
                        </Text>
                      </View>
                    </View>

                    {/* 1차 액션 안내 */}
                    <View className="flex-row items-center justify-between border-t border-default-100 pt-3">
                      <Text className="text-xs text-default-400">
                        {classification.description}
                      </Text>
                      <View
                        className={`rounded-full px-3 py-1.5 ${
                          classification.isActionable
                            ? 'bg-brand dark:bg-brand-dark'
                            : 'bg-default-200'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            classification.isActionable
                              ? 'text-white'
                              : 'text-default-500'
                          }`}
                        >
                          {primaryActionLabel(item.status, classification)}
                        </Text>
                      </View>
                    </View>
                  </Card.Body>
                </Card>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
