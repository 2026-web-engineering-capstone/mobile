import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/auth-provider';

const FEATURES = [
  { icon: '🚇', title: '빠른 지원 요청', desc: '출발역·도착역만 선택하면 끝' },
  { icon: '📍', title: '실시간 상태 확인', desc: '접수부터 하차까지 타임라인 안내' },
  { icon: '♿', title: '맞춤 접근성', desc: '큰 글씨·고대비 모드 지원' },
];

export function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();

  const handleSignIn = () => {
    signIn();
    router.replace('/(app)/(tabs)');
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View
        className="flex-1 justify-between px-6"
        style={{
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 32,
        }}
      >
        <View className="items-center gap-6">
          <View className="h-20 w-20 items-center justify-center rounded-2xl bg-brand dark:bg-brand-dark">
            <Text className="text-3xl font-bold text-white">M</Text>
          </View>
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold tracking-tight text-foreground">
              교움
            </Text>
            <Text className="text-center text-base leading-6 text-default-500">
              교통약자의 안전한 지하철 이동을{'\n'}역과 연결해주는 지원 요청
              서비스
            </Text>
          </View>
        </View>

        <View className="gap-5">
          <Card className="rounded-2xl bg-default-50">
            <Card.Body className="gap-3 p-4">
              {FEATURES.map((f, i) => (
                <View key={f.title}>
                  {i > 0 ? <Separator /> : null}
                  <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-tint dark:bg-brand-tint-dark">
                      <Text className="text-base">{f.icon}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {f.title}
                      </Text>
                      <Text className="text-xs text-default-400">
                        {f.desc}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card.Body>
          </Card>

          <View className="gap-3">
            <Button
              size="lg"
              className="rounded-xl bg-brand dark:bg-brand-dark"
              onPress={handleSignIn}
            >
              시작하기
            </Button>
            <Text className="text-center text-xs text-default-300">
              데모 모드 · 실제 인증은 추후 연동됩니다
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}