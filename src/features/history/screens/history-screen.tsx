import { Text, View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';

const historyItems = [
  { id: 'REQ-2026-001', route: '시청역 -> 서울역', status: '완료' },
  { id: 'REQ-2026-002', route: '사당역 -> 고속터미널역', status: '취소' },
];

export function HistoryScreen() {
  return (
    <Screen
      title="이용 내역"
      subtitle="재이용률과 최근 요청 흐름을 고려해 내역 탭을 기본 탭으로 포함했습니다."
    >
      <SectionCard
        eyebrow="History"
        title="최근 요청"
        description="나중에 pagination, 상태 필터, 재요청 액션이 들어갈 자리입니다."
      >
        <View className="gap-3">
          {historyItems.map((item) => (
            <View
              key={item.id}
              className="rounded-2xl bg-surface-secondary px-4 py-4"
            >
              <Text className="text-base font-semibold text-surface-secondary-foreground">
                {item.route}
              </Text>
              <Text className="mt-1 text-sm text-muted">{item.id}</Text>
              <Text className="mt-2 text-sm text-accent">{item.status}</Text>
            </View>
          ))}
        </View>
      </SectionCard>
    </Screen>
  );
}
