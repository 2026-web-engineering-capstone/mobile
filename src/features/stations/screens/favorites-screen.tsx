import { Text, View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';

export function FavoritesScreen() {
  return (
    <Screen
      title="즐겨찾기 역"
      subtitle="최근 이용/즐겨찾기 기반 빠른 선택 요구사항을 위한 보조 화면입니다."
    >
      <SectionCard
        eyebrow="Favorites"
        title="아직 비어 있습니다"
        description="실제 사용자 프로필 API가 연결되면 즐겨찾기 역 목록이 채워집니다."
      >
        <View className="rounded-2xl bg-surface-secondary px-4 py-4">
          <Text className="text-sm leading-6 text-muted">
            첫 번째 구현에서는 추가/삭제와 재선택 액션만 제공하면 충분합니다.
          </Text>
        </View>
      </SectionCard>
    </Screen>
  );
}
