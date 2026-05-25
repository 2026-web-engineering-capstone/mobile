import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BRAND_TOKENS, RADIUS, pretendard } from '@/lib/design-tokens';
import { GyoumCard } from '@/components/ui/gyoum-primitives';
import {
  EmptyView,
  ErrorView,
  LoadingView,
  Screen,
  StatusChip,
} from '@/components/ui';
import { SUPPORT_TYPE_LABELS } from '@/features/support-request/store/use-request-draft-store';
import { useSupportRequests } from '@/features/support-request/hooks/use-support-requests';
import { formatKoreanDateTime, parseApiDate } from '@/lib/datetime';
import { TERMINAL_REQUEST_STATUSES } from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';

type HistoryFilter = 'active' | 'completed' | 'cancelled';

function isHistoryFilter(value: unknown): value is HistoryFilter {
  return value === 'active' || value === 'completed' || value === 'cancelled';
}

export function HistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const { role } = useAuth();
  const initialFilter = isHistoryFilter(params.filter) ? params.filter : 'active';
  const [selectedFilter, setSelectedFilter] = useState<HistoryFilter>(initialFilter);
  const isPassenger = role === 'passenger';
  const { data = [], isLoading, error, refetch } = useSupportRequests(
    isPassenger,
    isPassenger ? 10_000 : false,
  );
  useFocusEffect(
    useCallback(() => {
      if (isPassenger) {
        void refetch();
      }
    }, [isPassenger, refetch]),
  );
  const activeItems = data
    .filter((item) => !TERMINAL_REQUEST_STATUSES.includes(item.status))
    .sort((a, b) => parseApiDate(b.created_at).getTime() - parseApiDate(a.created_at).getTime());
  const historyItems = data
    .filter((item) => TERMINAL_REQUEST_STATUSES.includes(item.status))
    .sort((a, b) => parseApiDate(b.created_at).getTime() - parseApiDate(a.created_at).getTime());
  const completedItems = historyItems.filter(
    (item) => item.status === 'completed' || item.status === 'unavailable',
  );
  const cancelledItems = historyItems.filter((item) => item.status === 'cancelled');
  const filteredItems =
    selectedFilter === 'active'
      ? activeItems
      : selectedFilter === 'completed'
        ? completedItems
        : cancelledItems;
  const selectedEmptyMessage =
    selectedFilter === 'active'
      ? '진행 중인 요청이 없습니다'
      : selectedFilter === 'completed'
        ? '완료된 이용 내역이 없습니다'
        : '취소된 이용 내역이 없습니다';
  const selectedSectionTitle =
    selectedFilter === 'active'
      ? '현재 진행 상황'
      : selectedFilter === 'completed'
        ? '완료 내역'
        : '취소 내역';

  if (!isPassenger) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <Screen scrollable padded>
      <StatusBar style="auto" />
      <View style={{ gap: 20 }}>
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontFamily: pretendard('600'),
              fontWeight: '600',
              fontSize: 12,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: BRAND_TOKENS.brand,
            }}
          >
            HISTORY
          </Text>
          <Text
            style={{
              fontFamily: pretendard('700'),
              fontWeight: '700',
              fontSize: 24,
              letterSpacing: -0.4,
              color: BRAND_TOKENS.text,
            }}
          >
            이용 내역
          </Text>
          <Text style={{ fontSize: 14, color: BRAND_TOKENS.textMuted }}>
            진행 중 {activeItems.length}건 · 완료 {completedItems.length}건
          </Text>
        </View>

        {!isLoading && !error && (activeItems.length > 0 || historyItems.length > 0) ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <SummaryCell
              count={activeItems.length}
              label="진행 중"
              fg={BRAND_TOKENS.brand}
              bg={BRAND_TOKENS.brandLight}
              selected={selectedFilter === 'active'}
              onPress={() => setSelectedFilter('active')}
            />
            <SummaryCell
              count={completedItems.length}
              label="완료"
              fg={BRAND_TOKENS.success}
              bg={BRAND_TOKENS.successBg}
              selected={selectedFilter === 'completed'}
              onPress={() => setSelectedFilter('completed')}
            />
            <SummaryCell
              count={cancelledItems.length}
              label="취소"
              fg={BRAND_TOKENS.danger}
              bg={BRAND_TOKENS.dangerBg}
              selected={selectedFilter === 'cancelled'}
              onPress={() => setSelectedFilter('cancelled')}
            />
          </View>
        ) : null}

        {isLoading ? <LoadingView label="이용 내역을 불러오고 있어요" /> : null}
        {error ? (
          <ErrorView
            title="이용 내역을 불러오지 못했어요"
            onRetry={() => {
              void refetch();
            }}
          />
        ) : null}
        {!isLoading && !error && activeItems.length === 0 && historyItems.length === 0 ? (
          <EmptyView
            title="아직 이용 내역이 없어요"
            description="지원 요청을 시작하면 이곳에서 진행 상황과 완료 내역을 확인할 수 있어요."
          />
        ) : null}

        {!isLoading && !error && (activeItems.length > 0 || historyItems.length > 0) ? (
          <View style={{ gap: 12 }}>
            <Text
              style={{
                fontFamily: pretendard('700'),
                fontWeight: '700',
                fontSize: 18,
                color: BRAND_TOKENS.text,
              }}
            >
              {selectedSectionTitle}
            </Text>
            {filteredItems.length === 0 ? (
              <View
                style={{
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: BRAND_TOKENS.border,
                  borderRadius: RADIUS.card,
                  paddingVertical: 28,
                  paddingHorizontal: 16,
                  alignItems: 'center',
                  backgroundColor: BRAND_TOKENS.surface,
                }}
              >
                <Text style={{ fontSize: 14, color: BRAND_TOKENS.textMuted }}>
                  {selectedEmptyMessage}
                </Text>
              </View>
            ) : (
              filteredItems.map((item) => (
                <RequestHistoryCard
                  key={item.id}
                  item={item}
                  onPress={() =>
                    router.push(
                      selectedFilter === 'active'
                        ? `/(app)/support/status/${item.id}`
                        : `/(app)/support/${item.id}`,
                    )
                  }
                  subtitle={formatKoreanDateTime(item.created_at)}
                />
              ))
            )}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

function RequestHistoryCard({
  item,
  subtitle,
  onPress,
}: {
  item: NonNullable<ReturnType<typeof useSupportRequests>['data']>[number];
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.origin_station_name}에서 ${item.destination_station_name}, ${subtitle}`}
    >
      <GyoumCard padding={16}>
        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  fontFamily: pretendard('600'),
                  fontWeight: '600',
                  fontSize: 16,
                  color: BRAND_TOKENS.text,
                }}
              >
                {item.origin_station_name}{' '}
                <Text style={{ color: BRAND_TOKENS.borderStrong }}>→</Text>{' '}
                {item.destination_station_name}
              </Text>
              <Text style={{ fontSize: 12, color: BRAND_TOKENS.textMuted }}>
                {subtitle}
              </Text>
            </View>
            <StatusChip status={item.status} size="sm" />
          </View>
          <View style={{ height: 1, backgroundColor: BRAND_TOKENS.border }} />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                flex: 1,
                fontSize: 12,
                color: BRAND_TOKENS.textMuted,
              }}
            >
              {item.support_types.map((type) => SUPPORT_TYPE_LABELS[type]).join(', ')}
            </Text>
          </View>
        </View>
      </GyoumCard>
    </Pressable>
  );
}

interface SummaryCellProps {
  count: number;
  label: string;
  fg: string;
  bg: string;
  selected: boolean;
  onPress: () => void;
}

function SummaryCell({ count, label, fg, bg, selected, onPress }: SummaryCellProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={{
        flex: 1,
        alignItems: 'center',
        gap: 4,
        borderRadius: RADIUS.card,
        backgroundColor: bg,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? fg : 'transparent',
        padding: 12,
      }}
    >
      <Text
        style={{
          fontFamily: pretendard('700'),
          fontWeight: '700',
          fontSize: 18,
          color: fg,
        }}
      >
        {count}
      </Text>
      <Text style={{ fontSize: 12, color: fg }}>{label}</Text>
    </Pressable>
  );
}
