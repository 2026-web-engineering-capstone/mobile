import { Pressable, ScrollView, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'heroui-native/card';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  EmptyView,
  ErrorView,
  LoadingView,
  StatusChip,
} from '@/components/ui';
import {
  SUPPORT_TYPE_LABELS,
} from '@/features/support-request/store/use-request-draft-store';
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
  const insets = useSafeAreaInsets();
  const { role } = useAuth();
  const isPassenger = role === 'passenger';
  const { data = [], isLoading, error, refetch } = useSupportRequests(
    isPassenger,
    false,
  );
  const historyItems = data
    .filter((item) => TERMINAL_REQUEST_STATUSES.includes(item.status))
    .sort(
      (a, b) =>
        Date.parse(b.created_at) - Date.parse(a.created_at),
    );

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
          <View className="gap-2">
            <Text className="text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-dark">
              HISTORY
            </Text>
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              완료된 이용 내역
            </Text>
            <Text className="text-sm text-default-400">
              종료된 요청 {historyItems.length}건
            </Text>
          </View>

          {!isLoading && !error && historyItems.length > 0 ? (
            <View className="flex-row gap-2">
              <View className="flex-1 items-center gap-1 rounded-2xl bg-status-completed-bg p-3 dark:bg-status-completed-bg-dark">
                <Text className="text-lg font-bold text-status-completed dark:text-status-completed-dark">
                  {completedCount}
                </Text>
                <Text className="text-xs text-status-completed dark:text-status-completed-dark">
                  완료
                </Text>
              </View>
              <View className="flex-1 items-center gap-1 rounded-2xl bg-status-cancelled-bg p-3 dark:bg-status-cancelled-bg-dark">
                <Text className="text-lg font-bold text-status-cancelled dark:text-status-cancelled-dark">
                  {cancelledCount}
                </Text>
                <Text className="text-xs text-status-cancelled dark:text-status-cancelled-dark">
                  취소
                </Text>
              </View>
              <View className="flex-1 items-center gap-1 rounded-2xl bg-status-unavailable-bg p-3 dark:bg-status-unavailable-bg-dark">
                <Text className="text-lg font-bold text-status-unavailable dark:text-status-unavailable-dark">
                  {unavailableCount}
                </Text>
                <Text className="text-xs text-status-unavailable dark:text-status-unavailable-dark">
                  지원 불가
                </Text>
              </View>
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

          <View className="gap-3">
            {historyItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/(app)/support/${item.id}`)}
                accessibilityRole="button"
                accessibilityLabel={`${item.origin_station_name}에서 ${item.destination_station_name}, ${formatDateTime(item.created_at)}`}
              >
                <Card className="rounded-2xl">
                  <Card.Body className="gap-3 p-4">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 gap-1">
                        <Text className="text-base font-semibold text-foreground">
                          {item.origin_station_name}{' '}
                          <Text className="text-default-300">→</Text>{' '}
                          {item.destination_station_name}
                        </Text>
                        <Text className="text-xs text-default-400">
                          {formatDateTime(item.created_at)}
                        </Text>
                      </View>
                      <StatusChip status={item.status} size="sm" />
                    </View>
                    <Separator />
                    <View className="flex-row items-center justify-between gap-3">
                      <Text className="flex-1 text-xs text-default-400">
                        {item.support_types
                          .map((type) => SUPPORT_TYPE_LABELS[type])
                          .join(', ')}
                      </Text>
                      <Text className="text-xs text-default-300">
                        {item.id}
                      </Text>
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
