import { Text, View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';

export function RequestDetailScreen({ requestId }: { requestId: string }) {
  return (
    <Screen
      title="요청 상세"
      subtitle="요청 단건 화면입니다. 이후 지원 이력, 메모, 칸 번호 공유 정보가 여기로 모입니다."
    >
      <SectionCard
        eyebrow="Request"
        title={requestId}
        description="상세 API가 연결되면 support_requests detail query를 붙일 자리입니다."
      >
        <View className="gap-2">
          <Text className="text-sm text-muted">현재 상태: 접수</Text>
          <Text className="text-sm text-muted">출발역: 시청역</Text>
          <Text className="text-sm text-muted">도착역: 서울역</Text>
        </View>
      </SectionCard>
    </Screen>
  );
}
