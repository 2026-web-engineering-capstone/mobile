import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native/button';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';
import { useAuth } from '@/providers/auth-provider';

export function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSignIn = () => {
    signIn();
    router.replace('/(app)/(tabs)');
  };

  return (
    <Screen
      title="교움"
      subtitle="교통약자의 지하철 이동을 역과 연결해 주는 지원 요청 앱"
    >
      <View className="gap-4">
        <SectionCard
          eyebrow="Access"
          title="빠르게 요청하고, 기다림은 짧게"
          description="지원 요청, 상태 확인, 역무원 연결 흐름을 Expo Router 기준으로 먼저 잡아둔 초기 앱 구조입니다."
        >
          <View className="gap-3">
            <Text className="text-sm leading-6 text-muted">
              이후 실제 로그인 API와 쿠키 기반 세션이 연결되면 이 화면은 인증 진입점으로 교체됩니다.
            </Text>
            <Button onPress={handleSignIn}>데모 로그인</Button>
          </View>
        </SectionCard>
      </View>
    </Screen>
  );
}
