import { Pressable, ScrollView, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MEETING_POINT_LABELS,
  SUPPORT_TYPE_LABELS,
} from '@/features/support-request/store/use-request-draft-store';
import { useSupportRequests } from '@/features/support-request/hooks/use-support-requests';
import {
  canStaffViewSupportRequest,
  STATUS_CHIP_COLORS,
  SUPPORT_REQUEST_STATUS_LABELS,
  TERMINAL_REQUEST_STATUSES,
} from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';

export function StaffQueueScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role, user } = useAuth();
  const { data = [], isLoading, error } = useSupportRequests(role === 'staff');
  const queueItems = data.filter(
    (item) =>
      !TERMINAL_REQUEST_STATUSES.includes(item.status) &&
      canStaffViewSupportRequest(item, user),
  );

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
        <View className="gap-5 px-5">
          <View className="gap-1">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              역무원 요청 큐
            </Text>
            <Text className="text-sm text-default-400">
              현재 처리해야 할 지원 요청을 확인하세요
            </Text>
          </View>

          {isLoading ? (
            <Card className="rounded-2xl">
              <Card.Body className="p-4">
                <Text className="text-sm text-default-500">
                  요청 목록을 불러오는 중입니다.
                </Text>
              </Card.Body>
            </Card>
          ) : null}

          {error ? (
            <Card className="rounded-2xl">
              <Card.Body className="p-4">
                <Text className="text-sm text-danger">
                  요청 목록을 불러오지 못했습니다.
                </Text>
              </Card.Body>
            </Card>
          ) : null}

          {!isLoading && !error && queueItems.length === 0 ? (
            <Card className="rounded-2xl">
              <Card.Body className="p-4">
                <Text className="text-sm text-default-500">
                  현재 확인할 지원 요청이 없습니다.
                </Text>
              </Card.Body>
            </Card>
          ) : null}

          <View className="gap-3">
            {queueItems.map((item) => (
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
                          요청자 {item.passenger_name}
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
                          .join(', ')}{' '}
                        · {MEETING_POINT_LABELS[item.meeting_point]}
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
