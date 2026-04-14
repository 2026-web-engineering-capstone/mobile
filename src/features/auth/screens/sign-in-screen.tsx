import { Text, View } from 'react-native';
import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '@/lib/api/client';
import type { Role } from '@/lib/api/types';
import { useAuth } from '@/providers/auth-provider';

const FEATURES = [
  { icon: '🚇', title: '빠른 지원 요청', desc: '출발역·도착역만 선택하면 끝' },
  { icon: '📍', title: '실시간 상태 확인', desc: '접수부터 하차까지 타임라인 안내' },
  { icon: '♿', title: '맞춤 접근성', desc: '큰 글씨·고대비 모드 지원' },
];

const ROLE_OPTIONS: { role: Role; label: string }[] = [
  { role: 'passenger', label: '교통약자' },
  { role: 'staff', label: '역무원' },
];

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return '로그인에 실패했습니다. 역할을 다시 선택한 뒤 시도해주세요.';
    }

    return '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  if (error instanceof Error) {
    return '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';
  }

  return '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';
}

export function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const inFlightRef = useRef(false);
  const [selectedRole, setSelectedRole] = useState<Role>('passenger');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await signIn(selectedRole);
      router.replace('/(app)/(tabs)');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
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

          <Card className="rounded-2xl">
            <Card.Body className="gap-3 p-4">
              <Text className="text-xs font-semibold tracking-wider text-default-400">
                로그인 역할 선택
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ROLE_OPTIONS.map((option) => {
                  const selected = option.role === selectedRole;
                  return (
                    <Chip
                      key={option.role}
                      variant={selected ? 'primary' : 'soft'}
                      className={selected ? 'bg-brand dark:bg-brand-dark' : ''}
                      onPress={isSubmitting ? undefined : () => setSelectedRole(option.role)}
                    >
                      {option.label}
                    </Chip>
                  );
                })}
              </View>
            </Card.Body>
          </Card>

          <View className="gap-3">
            {errorMessage ? (
              <Card className="rounded-2xl border border-danger/20 bg-danger/5">
                <Card.Body className="p-4">
                  <Text className="text-sm leading-6 text-danger">{errorMessage}</Text>
                </Card.Body>
              </Card>
            ) : null}
            <Button
              size="lg"
              className="rounded-xl bg-brand dark:bg-brand-dark"
              onPress={handleSignIn}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? '로그인 중...' : '시작하기'}
            </Button>
            <Text className="text-center text-xs text-default-300">
              데모 로그인 · 승객/역무원 역할 전환 가능
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}