import { Text, View } from 'react-native';
import { Button } from 'heroui-native/button';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';
import { useAuth } from '@/providers/auth-provider';

export function ProfileScreen() {
  const { role, signOut } = useAuth();

  return (
    <Screen
      title="내 정보"
      subtitle="인증/권한, 접근성, 자주 쓰는 역 같은 개인 설정 진입점을 모읍니다."
    >
      <SectionCard
        eyebrow="Account"
        title="현재 세션"
        description="실제 인증 연결 전까지는 데모 세션을 유지합니다."
      >
        <View className="gap-3">
          <Text className="text-sm text-muted">역할: {role}</Text>
          <Button onPress={signOut}>로그아웃</Button>
        </View>
      </SectionCard>
    </Screen>
  );
}
