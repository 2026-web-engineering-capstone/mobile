import { ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'heroui-native/card';
import { Separator } from 'heroui-native/separator';
import { Switch } from 'heroui-native/switch';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '@/store/app-store';
import type { ThemePreference } from '@/store/app-store';
import { Pressable } from 'react-native';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: string }[] =
  [
    { value: 'system', label: '시스템', icon: '📱' },
    { value: 'light', label: '라이트', icon: '☀️' },
    { value: 'dark', label: '다크', icon: '🌙' },
  ];

export function AccessibilityScreen() {
  const insets = useSafeAreaInsets();
  const {
    fontScale,
    highContrast,
    themePreference,
    toggleFontScale,
    toggleHighContrast,
    setThemePreference,
  } = useAppStore();

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
        <View className="gap-6 px-5">
          <View className="gap-1">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              접근성 설정
            </Text>
            <Text className="text-sm text-default-400">
              읽기 편한 환경을 설정하세요
            </Text>
          </View>

          {/* 디스플레이 */}
          <Card className="rounded-2xl">
            <Card.Body className="p-0">
              <View className="flex-row items-center justify-between px-5 py-4">
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-foreground">
                    큰 글씨
                  </Text>
                  <Text className="text-xs text-default-400">
                    현재: {fontScale === 'lg' ? '크게' : '기본'}
                  </Text>
                </View>
                <Switch
                  isSelected={fontScale === 'lg'}
                  onSelectedChange={toggleFontScale}
                />
              </View>
              <Separator />
              <View className="flex-row items-center justify-between px-5 py-4">
                <View className="flex-1 gap-0.5">
                  <Text className="text-sm font-semibold text-foreground">
                    고대비 모드
                  </Text>
                  <Text className="text-xs text-default-400">
                    텍스트와 배경의 대비를 높입니다
                  </Text>
                </View>
                <Switch
                  isSelected={highContrast}
                  onSelectedChange={toggleHighContrast}
                />
              </View>
            </Card.Body>
          </Card>

          {/* 테마 */}
          <View className="gap-3">
            <Text className="text-xs font-semibold tracking-wider text-default-400">
              테마
            </Text>
            <View className="flex-row gap-3">
              {THEME_OPTIONS.map((option) => {
                const selected = themePreference === option.value;
                return (
                  <Pressable
                    key={option.value}
                    className={`flex-1 items-center gap-2 rounded-2xl border-2 py-5 ${
                      selected
                        ? 'border-brand bg-brand-surface dark:border-brand-dark dark:bg-brand-surface-dark'
                        : 'border-default-200 bg-background'
                    }`}
                    onPress={() => setThemePreference(option.value)}
                  >
                    <Text className="text-2xl">{option.icon}</Text>
                    <Text
                      className={`text-sm ${
                        selected
                          ? 'font-semibold text-brand dark:text-brand-dark'
                          : 'text-default-600'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 미리보기 */}
          <Card className="rounded-2xl bg-default-50">
            <Card.Body className="gap-2 p-4">
              <Text className="text-xs font-semibold tracking-wider text-default-400">
                미리보기
              </Text>
              <Text
                className={`font-medium text-foreground ${fontScale === 'lg' ? 'text-xl' : 'text-base'}`}
              >
                인천대입구역 → 센트럴파크역
              </Text>
              <Text
                className={`text-default-500 ${fontScale === 'lg' ? 'text-base' : 'text-sm'}`}
              >
                휠체어 발판 지원 · 엘리베이터 앞 만남
              </Text>
            </Card.Body>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}