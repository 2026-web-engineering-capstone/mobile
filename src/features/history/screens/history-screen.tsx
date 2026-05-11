import { Pressable, ScrollView, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  SUPPORT_TYPE_LABELS,
} from '@/features/support-request/store/use-request-draft-store';
import { useSupportRequests } from '@/features/support-request/hooks/use-support-requests';
import {
  STATUS_CHIP_COLORS,
  SUPPORT_REQUEST_STATUS_LABELS,
  TERMINAL_REQUEST_STATUSES,
} from '@/features/support-request/types';
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
  const { data = [], isLoading, error } = useSupportRequests(isPassenger, false);
  const historyItems = data.filter((item) =>
    TERMINAL_REQUEST_STATUSES.includes(item.status),
  );

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
          <View className="gap-1">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              완료된 이용 내역
            </Text>
            <Text className="text-sm text-default-400">
              완료, 취소, 지원 불가로 종료된 요청 {historyItems.length}건
            </Text>
          </View>

          {isLoading ? (
            <Card className="rounded-2xl">
              <Card.Body className="p-4">
                <Text className="text-sm text-default-500">
                  이용 내역을 불러오는 중입니다.
                </Text>
              </Card.Body>
            </Card>
          ) : null}

          {error ? (
            <Card className="rounded-2xl">
              <Card.Body className="p-4">
                <Text className="text-sm text-danger">
                  이용 내역을 불러오지 못했습니다.
                </Text>
              </Card.Body>
            </Card>
          ) : null}

          {!isLoading && !error && historyItems.length === 0 ? (
            <Card className="rounded-2xl">
              <Card.Body className="p-4">
                <Text className="text-sm text-default-500">
                  아직 종료된 요청이 없습니다. 진행 중인 요청은 홈에서 확인해주세요.
                </Text>
              </Card.Body>
            </Card>
          ) : null}

          <View className="gap-3">
            {historyItems.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/(app)/support/${item.id}`)}
              >
                <Card className="rounded-2xl">
                  <Card.Body className="gap-3 p-4">
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 gap-1">
                        <Text className="text-base font-semibold text-foreground">
                          {item.origin_station_name} → {item.destination_station_name}
                        </Text>
                        <Text className="text-xs text-default-400">
                          {formatDateTime(item.created_at)}
                        </Text>
                      </View>
                      <Chip
                        variant="soft"
                        color={STATUS_CHIP_COLORS[item.status]}
                        size="sm"
                      >
                        {SUPPORT_REQUEST_STATUS_LABELS[item.status]}
                      </Chip>
                    </View>
                    <Separator />
                    <View className="flex-row items-center justify-between gap-3">
                      <Text className="flex-1 text-xs text-default-400">
                        {item.support_types
                          .map((type) => SUPPORT_TYPE_LABELS[type])
                          .join(', ')}
                      </Text>
                      <Text className="text-xs text-default-300">{item.id}</Text>
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
