import { Text, View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';

const timeline = [
  '접수 완료',
  '역무원 배정 대기',
  '지원 중',
  '승차 완료',
  '하차 대기',
  '완료',
];

export function RequestStatusScreen({ requestId }: { requestId: string }) {
  return (
    <Screen
      title="지원 상태"
      subtitle="manyfast PRD에 정의된 상태 타임라인을 모바일에서 어떻게 보일지 먼저 고정한 화면입니다."
    >
      <SectionCard
        eyebrow="Timeline"
        title={`요청 번호 ${requestId}`}
        description="사용자 안내 문구와 상태별 액션은 이후 API 연결과 함께 구체화합니다."
      >
        <View className="gap-3">
          {timeline.map((item, index) => (
            <View
              key={item}
              className="rounded-2xl bg-surface-secondary px-4 py-3"
            >
              <Text className="text-xs font-semibold uppercase tracking-[2px] text-accent">
                Step {index + 1}
              </Text>
              <Text className="mt-1 text-base font-medium text-surface-secondary-foreground">
                {item}
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>
    </Screen>
  );
}
