import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TimelineStep = {
  label: string;
  time: string | null;
  guide: string;
};

const DUMMY_TIMELINE: TimelineStep[] = [
  {
    label: '접수 완료',
    time: '14:02',
    guide: '요청이 정상적으로 접수되었습니다.',
  },
  {
    label: '역무원 배정',
    time: '14:03',
    guide: '김민수 역무원이 배정되었습니다.',
  },
  {
    label: '지원 중',
    time: '14:07',
    guide: '역무원이 만남 장소로 이동하고 있습니다.',
  },
  {
    label: '승차 완료',
    time: null,
    guide: '승차 후 열차 칸 번호가 공유됩니다.',
  },
  {
    label: '하차 대기',
    time: null,
    guide: '하차 역 역무원이 마중 준비합니다.',
  },
  {
    label: '지원 완료',
    time: null,
    guide: '안전하게 하차가 완료됩니다.',
  },
];

const CURRENT_STEP = 2;

export function RequestStatusScreen({ requestId }: { requestId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
              <Text className="text-xs text-default-400">{requestId}</Text>
            </View>
            <Chip variant="soft" color="accent" size="sm">
              {DUMMY_TIMELINE[CURRENT_STEP].label}
            </Chip>
          </View>

          {/* 요청 요약 카드 */}
          <Card className="rounded-2xl bg-brand-surface dark:bg-brand-surface-dark">
            <Card.Body className="gap-2 p-4">
              <Text className="text-base font-semibold text-foreground">
                인천대입구역 → 센트럴파크역
              </Text>
              <Text className="text-sm text-default-500">
                휠체어 발판 · 엘리베이터 앞 만남
              </Text>
              <Text className="text-xs text-default-400">
                담당 역무원: 김민수
              </Text>
            </Card.Body>
          </Card>

          {/* 타임라인 */}
          <View className="gap-0">
            {DUMMY_TIMELINE.map((step, index) => {
              const isDone = index <= CURRENT_STEP;
              const isCurrent = index === CURRENT_STEP;

              return (
                <View key={step.label} className="flex-row">
                  {/* 좌측 타임라인 바 */}
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
                      {isDone ? (
                        <Text className="text-xs font-bold text-white">
                          {isCurrent ? '●' : '✓'}
                        </Text>
                      ) : (
                        <Text className="text-[10px] text-default-300">
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    {index < DUMMY_TIMELINE.length - 1 ? (
                      <View
                        className={`w-0.5 flex-1 ${isDone ? 'bg-brand-soft dark:bg-brand-soft-dark' : 'bg-default-200'}`}
                        style={{ minHeight: 40 }}
                      />
                    ) : null}
                  </View>

                  {/* 우측 콘텐츠 */}
                  <View
                    className={`mb-4 flex-1 rounded-xl px-4 py-3 ${
                      isCurrent ? 'bg-brand-tint dark:bg-brand-tint-dark' : 'bg-default-50'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text
                        className={`text-sm font-semibold ${
                          isDone ? 'text-foreground' : 'text-default-300'
                        }`}
                      >
                        {step.label}
                      </Text>
                      {step.time ? (
                        <Text className="text-xs text-default-400">
                          {step.time}
                        </Text>
                      ) : null}
                    </View>
                    <Text
                      className={`mt-1 text-xs leading-4 ${
                        isDone ? 'text-default-500' : 'text-default-300'
                      }`}
                    >
                      {step.guide}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Separator />

          {/* 안내 메시지 */}
          <Card className="rounded-2xl">
            <Card.Body className="gap-2 p-4">
              <Text className="text-sm font-semibold text-foreground">
                다음 안내
              </Text>
              <Text className="text-sm leading-5 text-default-500">
                역무원이 엘리베이터 앞에서 만남을 준비하고 있습니다.{'\n'}잠시만
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
          variant="danger-soft"
          className="flex-1 rounded-xl"
          onPress={() => router.back()}
        >
          요청 취소
        </Button>
        <Button
          size="lg"
          className="flex-1 rounded-xl bg-brand dark:bg-brand-dark"
          onPress={() => router.back()}
        >
          확인
        </Button>
      </View>
    </View>
  );
}