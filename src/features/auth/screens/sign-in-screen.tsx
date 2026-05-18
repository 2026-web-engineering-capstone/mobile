import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApiError } from '@/lib/api/client';
import type { Role } from '@/lib/api/types';
import { useAuth } from '@/providers/auth-provider';
import { useAppStore } from '@/store/app-store';

type RoleOption = {
  role: Role;
  label: string;
  tagline: string;
  bullets: string[];
  emoji: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'passenger',
    label: '교통약자',
    tagline: '안전한 지하철 이용을 위해 지원을 요청합니다',
    bullets: [
      '출발·도착 역과 지원 유형 선택',
      '실시간 상태 타임라인 확인',
      '큰 글씨·고대비 접근성 지원',
    ],
    emoji: '🧑‍🦽',
  },
  {
    role: 'staff',
    label: '역무원',
    tagline: '들어온 지원 요청을 현장에서 처리합니다',
    bullets: [
      '미배정 요청 큐 확인 및 배정',
      '단계별 체크리스트 + 1클릭 상태 갱신',
      '하차 역 인계 정보 자동 공유',
    ],
    emoji: '👮',
  },
];

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return '로그인에 실패했습니다. 역할을 다시 선택한 뒤 시도해 주세요.';
    }
    return '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  }
  if (error instanceof Error) {
    return '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
  }
  return '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}

export function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const inFlightRef = useRef(false);
  const [selectedRole, setSelectedRole] = useState<Role>('passenger');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fontScale = useAppStore((state) => state.fontScale);
  const toggleFontScale = useAppStore((state) => state.toggleFontScale);
  const highContrast = useAppStore((state) => state.highContrast);
  const toggleHighContrast = useAppStore((state) => state.toggleHighContrast);

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

  const selectedOption = ROLE_OPTIONS.find((opt) => opt.role === selectedRole);

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="px-6">
          {/* 헤더: 접근성 토글 */}
          <View className="flex-row justify-end gap-2">
            <Pressable
              className={`rounded-full px-3 py-2 ${fontScale === 'lg' ? 'bg-brand/15' : 'bg-default-100'}`}
              style={{ minHeight: 36 }}
              onPress={toggleFontScale}
              accessibilityRole="switch"
              accessibilityState={{ checked: fontScale === 'lg' }}
              accessibilityLabel="큰 글씨 모드"
            >
              <Text
                className={`text-xs font-semibold ${fontScale === 'lg' ? 'text-brand dark:text-brand-dark' : 'text-default-500'}`}
              >
                가 {fontScale === 'lg' ? '큼' : '보통'}
              </Text>
            </Pressable>
            <Pressable
              className={`rounded-full px-3 py-2 ${highContrast ? 'bg-brand/15' : 'bg-default-100'}`}
              style={{ minHeight: 36 }}
              onPress={toggleHighContrast}
              accessibilityRole="switch"
              accessibilityState={{ checked: highContrast }}
              accessibilityLabel="고대비 모드"
            >
              <Text
                className={`text-xs font-semibold ${highContrast ? 'text-brand dark:text-brand-dark' : 'text-default-500'}`}
              >
                고대비 {highContrast ? 'ON' : 'OFF'}
              </Text>
            </Pressable>
          </View>

          {/* 브랜드 */}
          <View className="mt-8 items-center gap-4">
            <View className="h-20 w-20 items-center justify-center rounded-3xl bg-brand dark:bg-brand-dark">
              <Text className="text-3xl font-bold text-white">교</Text>
            </View>
            <View className="items-center gap-2">
              <Text className="text-3xl font-bold tracking-tight text-foreground">
                교움
              </Text>
              <Text className="text-center text-base leading-6 text-default-500">
                교통약자의 안전한 지하철 이동을{'\n'}역과 연결해 주는 지원 요청 서비스
              </Text>
            </View>
          </View>

          {/* 역할 선택 카드 */}
          <View className="mt-10 gap-3">
            <Text className="text-sm font-semibold text-foreground">
              어떤 역할로 시작하시겠어요?
            </Text>
            {ROLE_OPTIONS.map((option) => {
              const selected = option.role === selectedRole;
              return (
                <Pressable
                  key={option.role}
                  onPress={() => !isSubmitting && setSelectedRole(option.role)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={`${option.label} 역할 선택`}
                >
                  <Card
                    className={`rounded-2xl ${
                      selected
                        ? 'border-2 border-brand bg-brand-tint dark:border-brand-dark dark:bg-brand-tint-dark'
                        : 'border border-default-200'
                    }`}
                  >
                    <Card.Body className="flex-row items-start gap-3 p-4">
                      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-surface dark:bg-brand-surface-dark">
                        <Text className="text-2xl">{option.emoji}</Text>
                      </View>
                      <View className="flex-1 gap-1.5">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-lg font-bold text-foreground">
                            {option.label}
                          </Text>
                          <View
                            className={`h-5 w-5 items-center justify-center rounded-full ${
                              selected
                                ? 'bg-brand dark:bg-brand-dark'
                                : 'border-2 border-default-300'
                            }`}
                          >
                            {selected ? (
                              <Text className="text-xs font-bold text-white">
                                ✓
                              </Text>
                            ) : null}
                          </View>
                        </View>
                        <Text className="text-xs leading-5 text-default-500">
                          {option.tagline}
                        </Text>
                        <View className="mt-1 gap-0.5">
                          {option.bullets.map((bullet) => (
                            <Text
                              key={bullet}
                              className="text-xs leading-5 text-default-500"
                            >
                              · {bullet}
                            </Text>
                          ))}
                        </View>
                      </View>
                    </Card.Body>
                  </Card>
                </Pressable>
              );
            })}
          </View>

          {/* 에러 메시지 */}
          {errorMessage ? (
            <Card className="mt-4 rounded-2xl border border-danger/30 bg-danger/5">
              <Card.Body className="p-4">
                <Text className="text-sm leading-6 text-danger">
                  {errorMessage}
                </Text>
              </Card.Body>
            </Card>
          ) : null}

          {/* CTA */}
          <View className="mt-6 gap-3">
            <Button
              size="lg"
              className="rounded-2xl bg-brand dark:bg-brand-dark"
              onPress={handleSignIn}
              isDisabled={isSubmitting}
            >
              {isSubmitting
                ? '로그인 중...'
                : `${selectedOption?.label ?? ''}(으)로 시작하기`}
            </Button>
            <Text className="text-center text-xs text-default-400">
              데모 환경 · 역할은 언제든지 다시 로그인해 전환할 수 있어요
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
