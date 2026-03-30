import { Text, View } from 'react-native';
import { Button } from 'heroui-native/button';
import { Screen } from '@/components/ui/screen';
import { SectionCard } from '@/components/ui/section-card';
import { useAppStore } from '@/store/app-store';

export function AccessibilityScreen() {
  const {
    fontScale,
    highContrast,
    themePreference,
    toggleFontScale,
    toggleHighContrast,
    setThemePreference,
  } = useAppStore();

  return (
    <Screen
      title="접근성 설정"
      subtitle="큰 글씨, 고대비, 테마 전환을 zustand 전역 상태로 먼저 구성했습니다."
    >
      <SectionCard
        eyebrow="Accessibility"
        title="읽기 편한 설정"
        description="사용자 앱의 핵심 품질은 기능 수보다 읽기 쉬움과 실수 방지입니다."
      >
        <View className="gap-3">
          <Text className="text-sm text-muted">
            고대비: {highContrast ? '켜짐' : '꺼짐'}
          </Text>
          <Text className="text-sm text-muted">글자 크기: {fontScale}</Text>
          <Text className="text-sm text-muted">테마: {themePreference}</Text>
          <Button onPress={toggleHighContrast}>고대비 전환</Button>
          <Button onPress={toggleFontScale}>글자 크기 전환</Button>
          <Button onPress={() => setThemePreference('light')}>라이트</Button>
          <Button onPress={() => setThemePreference('dark')}>다크</Button>
          <Button onPress={() => setThemePreference('system')}>시스템</Button>
        </View>
      </SectionCard>
    </Screen>
  );
}
