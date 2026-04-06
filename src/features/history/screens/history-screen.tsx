import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HistoryItem = {
  id: string;
  origin: string;
  destination: string;
  status: '완료' | '취소' | '지원 불가';
  date: string;
  supportType: string;
};

const DUMMY_HISTORY: HistoryItem[] = [
  {
    id: 'REQ-2026-003',
    origin: '인천대입구역',
    destination: '센트럴파크역',
    status: '완료',
    date: '2026.03.30 14:02',
    supportType: '휠체어 발판',
  },
  {
    id: 'REQ-2026-002',
    origin: '지식정보단지역',
    destination: '계양역',
    status: '완료',
    date: '2026.03.28 09:15',
    supportType: '시각 안내 동행',
  },
  {
    id: 'REQ-2026-001',
    origin: '인천대입구역',
    destination: '송도달빛축제공원역',
    status: '취소',
    date: '2026.03.25 11:40',
    supportType: '휠체어 발판',
  },
];

const STATUS_CONFIG = {
  완료: { color: 'success' as const, label: '완료' },
  취소: { color: 'danger' as const, label: '취소' },
  '지원 불가': { color: 'warning' as const, label: '지원 불가' },
};

export function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
              이용 내역
            </Text>
            <Text className="text-sm text-default-400">
              총 {DUMMY_HISTORY.length}건의 지원 요청 기록
            </Text>
          </View>

          <View className="gap-3">
            {DUMMY_HISTORY.map((item) => {
              const config = STATUS_CONFIG[item.status];
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(`/(app)/support/${item.id}`)}
                >
                  <Card className="rounded-2xl">
                    <Card.Body className="gap-3 p-4">
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 gap-1">
                          <Text className="text-base font-semibold text-foreground">
                            {item.origin} → {item.destination}
                          </Text>
                          <Text className="text-xs text-default-400">
                            {item.date}
                          </Text>
                        </View>
                        <Chip
                          variant="soft"
                          color={config.color}
                          size="sm"
                        >
                          {config.label}
                        </Chip>
                      </View>
                      <Separator />
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs text-default-400">
                          {item.supportType}
                        </Text>
                        <Text className="text-xs text-default-300">
                          {item.id}
                        </Text>
                      </View>
                    </Card.Body>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}