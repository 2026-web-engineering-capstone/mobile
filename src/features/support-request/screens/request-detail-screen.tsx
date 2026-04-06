import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DUMMY_REQUEST = {
  id: 'REQ-2026-003',
  status: '지원 중' as const,
  origin: '인천대입구역',
  destination: '센트럴파크역',
  supportTypes: ['휠체어 발판'],
  meetingPoint: '엘리베이터 앞',
  staff: '김민수',
  createdAt: '2026-03-30 14:02',
  trainCar: null as string | null,
  notes: '전동휠체어 사용',
};

const STATUS_COLOR: Record<string, 'accent' | 'success' | 'warning' | 'danger' | 'default'> = {
  접수: 'default',
  배정: 'warning',
  '지원 중': 'accent',
  '승차 완료': 'accent',
  '하차 대기': 'warning',
  완료: 'success',
  취소: 'danger',
};

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
  const req = DUMMY_REQUEST;

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
              <Text className="text-xs text-default-400">{requestId}</Text>
            </View>
            <Chip
              variant="soft"
              color={STATUS_COLOR[req.status] ?? 'default'}
              size="sm"
            >
              {req.status}
            </Chip>
          </View>

          {/* 경로 카드 */}
          <Card className="rounded-2xl bg-brand-surface dark:bg-brand-surface-dark">
            <Card.Body className="items-center gap-2 p-5">
              <Text className="text-lg font-bold text-brand dark:text-brand-dark">
                {req.origin}
              </Text>
              <Text className="text-default-400">↓</Text>
              <Text className="text-lg font-bold text-brand dark:text-brand-dark">
                {req.destination}
              </Text>
            </Card.Body>
          </Card>

          {/* 상세 정보 */}
          <Card className="rounded-2xl">
            <Card.Body className="p-4">
              <Text className="mb-2 text-xs font-semibold tracking-wider text-default-400">
                요청 정보
              </Text>
              <InfoRow label="지원 유형" value={req.supportTypes.join(', ')} />
              <Separator />
              <InfoRow label="만남 위치" value={req.meetingPoint} />
              <Separator />
              <InfoRow label="담당 역무원" value={req.staff} />
              <Separator />
              <InfoRow label="요청 시간" value={req.createdAt} />
              {req.trainCar ? (
                <>
                  <Separator />
                  <InfoRow label="탑승 칸" value={`${req.trainCar}번 칸`} />
                </>
              ) : null}
              {req.notes ? (
                <>
                  <Separator />
                  <InfoRow label="메모" value={req.notes} />
                </>
              ) : null}
            </Card.Body>
          </Card>

          {/* 안내 */}
          <Card className="rounded-2xl border border-brand/20 dark:border-brand-dark/20">
            <Card.Body className="gap-2 p-4">
              <Text className="text-sm font-semibold text-brand dark:text-brand-dark">
                현재 안내
              </Text>
              <Text className="text-sm leading-5 text-default-600">
                역무원이 엘리베이터 앞으로 이동 중입니다.{'\n'}잠시만
                기다려주세요.
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
          onPress={() =>
            router.push(`/(app)/support/status/${requestId}`)
          }
        >
          상태 타임라인
        </Button>
      </View>
    </View>
  );
}