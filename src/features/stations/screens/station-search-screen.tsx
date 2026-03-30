import { Text, View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';

const stations = ['시청역', '서울역', '충무로역', '왕십리역'];

export function StationSearchScreen() {
  return (
    <Screen
      title="역 검색"
      subtitle="PRD의 빠른 요청 요구사항에 맞춰 검색, 최근, 즐겨찾기를 분리할 준비를 한 화면입니다."
    >
      <SectionCard
        eyebrow="Search"
        title="추천 역"
        description="초성 검색과 자동완성은 실제 데이터 소스 연결 후 붙입니다."
      >
        <View className="gap-3">
          {stations.map((station) => (
            <View
              key={station}
              className="rounded-2xl bg-surface-secondary px-4 py-4"
            >
              <Text className="text-base font-medium text-surface-secondary-foreground">
                {station}
              </Text>
            </View>
          ))}
        </View>
      </SectionCard>
    </Screen>
  );
}
