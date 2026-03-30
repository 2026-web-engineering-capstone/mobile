import { Text, View } from 'react-native';
import { Button } from 'heroui-native/button';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';
import { useRequestDraftStore } from '@/features/support-request/store/use-request-draft-store';

const supportLabels = {
  wheelchair: '휠체어 지원',
  'visual-guide': '시각 안내',
  'boarding-ramp': '발판 지원',
} as const;

export function RequestScreen() {
  const {
    destinationStation,
    meetingPoint,
    originStation,
    reset,
    supportTypes,
    toggleSupportType,
  } = useRequestDraftStore();

  return (
    <Screen
      title="지원 요청"
      subtitle="출발역, 도착역, 만남 위치, 지원 유형을 중심으로 최소한의 요청 플로우를 잡았습니다."
    >
      <SectionCard
        eyebrow="Draft"
        title={`${originStation} -> ${destinationStation}`}
        description={`만남 위치: ${meetingPoint}`}
      >
        <View className="gap-2">
          <Text className="text-sm text-muted">지원 유형 선택</Text>
          <View className="gap-3">
            {Object.entries(supportLabels).map(([key, label]) => (
              <Button key={key} onPress={() => toggleSupportType(key as keyof typeof supportLabels)}>
                {supportTypes.includes(key as keyof typeof supportLabels)
                  ? `선택됨 · ${label}`
                  : label}
              </Button>
            ))}
          </View>
        </View>
      </SectionCard>

      <SectionCard
        eyebrow="Next"
        title="실제 API 연결 전 상태"
        description="현재는 zustand 초안 저장소만 연결되어 있습니다. FastAPI 연동 시 TanStack Query mutation으로 바뀝니다."
      >
        <View className="gap-3">
          <Button onPress={reset}>초안 초기화</Button>
          <Button onPress={() => undefined}>지원 요청 제출</Button>
        </View>
      </SectionCard>
    </Screen>
  );
}
