import { Pressable, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
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
import { TERMINAL_REQUEST_STATUSES } from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistoryScreen() {
  const router = useRouter();
  const { role } = useAuth();
  const isPassenger = role === 'passenger';
  const { data = [], isLoading, error, refetch } = useSupportRequests(
    isPassenger,
    false,
  );
  const historyItems = data
    .filter((item) => TERMINAL_REQUEST_STATUSES.includes(item.status))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

  const completedCount = historyItems.filter(
    (item) => item.status === 'completed',
  ).length;
  const cancelledCount = historyItems.filter(
    (item) => item.status === 'cancelled',
  ).length;
  const unavailableCount = historyItems.filter(
    (item) => item.status === 'unavailable',
  ).length;

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
            완료된 이용 내역
          </Text>
          <Text style={{ fontSize: 14, color: BRAND_TOKENS.textMuted }}>
            종료된 요청 {historyItems.length}건
          </Text>
        </View>

        {!isLoading && !error && historyItems.length > 0 ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <SummaryCell
              count={completedCount}
              label="완료"
              fg={BRAND_TOKENS.success}
              bg={BRAND_TOKENS.successBg}
            />
            <SummaryCell
              count={cancelledCount}
              label="취소"
              fg={BRAND_TOKENS.danger}
              bg={BRAND_TOKENS.dangerBg}
            />
            <SummaryCell
              count={unavailableCount}
              label="지원 불가"
              fg={BRAND_TOKENS.warning}
              bg={BRAND_TOKENS.warningBg}
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
        {!isLoading && !error && historyItems.length === 0 ? (
          <EmptyView
            title="아직 종료된 요청이 없어요"
            description="진행 중인 요청은 홈 화면에서 확인할 수 있어요."
          />
        ) : null}

        <View style={{ gap: 12 }}>
          {historyItems.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/(app)/support/${item.id}`)}
              accessibilityRole="button"
              accessibilityLabel={`${item.origin_station_name}에서 ${item.destination_station_name}, ${formatDateTime(item.created_at)}`}
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
                        <Text style={{ color: BRAND_TOKENS.borderStrong }}>
                          →
                        </Text>{' '}
                        {item.destination_station_name}
                      </Text>
                      <Text
                        style={{ fontSize: 12, color: BRAND_TOKENS.textMuted }}
                      >
                        {formatDateTime(item.created_at)}
                      </Text>
                    </View>
                    <StatusChip status={item.status} size="sm" />
                  </View>
                  <View
                    style={{ height: 1, backgroundColor: BRAND_TOKENS.border }}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 12,
                        color: BRAND_TOKENS.textMuted,
                      }}
                    >
                      {item.support_types
                        .map((type) => SUPPORT_TYPE_LABELS[type])
                        .join(', ')}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: BRAND_TOKENS.borderStrong }}
                    >
                      {item.id}
                    </Text>
                  </View>
                </View>
              </GyoumCard>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

interface SummaryCellProps {
  count: number;
  label: string;
  fg: string;
  bg: string;
}

function SummaryCell({ count, label, fg, bg }: SummaryCellProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        gap: 4,
        borderRadius: RADIUS.card,
        backgroundColor: bg,
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
    </View>
  );
}
