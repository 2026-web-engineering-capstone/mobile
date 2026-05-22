import { Pressable, Switch, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BRAND_TOKENS, RADIUS, pretendard } from '@/lib/design-tokens';
import { GyoumCard, PageTitle } from '@/components/ui/gyoum-primitives';
import { Screen } from '@/components/ui/screen';
import { useAppStore } from '@/store/app-store';
import type { ThemePreference } from '@/store/app-store';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: string }[] =
  [
    { value: 'system', label: '시스템', icon: '📱' },
    { value: 'light', label: '라이트', icon: '☀️' },
    { value: 'dark', label: '다크', icon: '🌙' },
  ];

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
    <Screen scrollable padded>
      <StatusBar style="auto" />
      <View style={{ gap: 24 }}>
        <PageTitle sub="읽기 편한 환경을 설정하세요">접근성 설정</PageTitle>

        <GyoumCard padding={0}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 16,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  fontFamily: pretendard('600'),
                  fontWeight: '600',
                  fontSize: 14,
                  color: BRAND_TOKENS.text,
                }}
              >
                큰 글씨
              </Text>
              <Text style={{ fontSize: 12, color: BRAND_TOKENS.textMuted }}>
                현재: {fontScale === 'lg' ? '크게' : '기본'}
              </Text>
            </View>
            <Switch
              value={fontScale === 'lg'}
              onValueChange={toggleFontScale}
              trackColor={{
                false: BRAND_TOKENS.borderStrong,
                true: BRAND_TOKENS.brand,
              }}
              thumbColor={BRAND_TOKENS.onBrand100}
              ios_backgroundColor={BRAND_TOKENS.borderStrong}
            />
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: BRAND_TOKENS.border,
              marginHorizontal: 20,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 16,
            }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={{
                  fontFamily: pretendard('600'),
                  fontWeight: '600',
                  fontSize: 14,
                  color: BRAND_TOKENS.text,
                }}
              >
                고대비 모드
              </Text>
              <Text style={{ fontSize: 12, color: BRAND_TOKENS.textMuted }}>
                텍스트와 배경의 대비를 높입니다
              </Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={toggleHighContrast}
              trackColor={{
                false: BRAND_TOKENS.borderStrong,
                true: BRAND_TOKENS.brand,
              }}
              thumbColor={BRAND_TOKENS.onBrand100}
              ios_backgroundColor={BRAND_TOKENS.borderStrong}
            />
          </View>
        </GyoumCard>

        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily: pretendard('600'),
              fontWeight: '600',
              fontSize: 12,
              letterSpacing: 0.6,
              color: BRAND_TOKENS.textMuted,
            }}
          >
            테마
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {THEME_OPTIONS.map((option) => {
              const selected = themePreference === option.value;
              return (
                <Pressable
                  key={option.value}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    gap: 8,
                    borderRadius: RADIUS.card,
                    borderWidth: 2,
                    paddingVertical: 20,
                    borderColor: selected
                      ? BRAND_TOKENS.brand
                      : BRAND_TOKENS.border,
                    backgroundColor: selected
                      ? BRAND_TOKENS.brandSubtle
                      : BRAND_TOKENS.surface,
                  }}
                  onPress={() => setThemePreference(option.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${option.label} 테마 선택`}
                >
                  <Text style={{ fontSize: 24 }}>{option.icon}</Text>
                  <Text
                    style={{
                      fontFamily: pretendard(selected ? '600' : '500'),
                      fontWeight: selected ? '600' : '500',
                      fontSize: 14,
                      color: selected
                        ? BRAND_TOKENS.brand
                        : BRAND_TOKENS.textMid,
                    }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <GyoumCard
          padding={16}
          style={{ backgroundColor: BRAND_TOKENS.surfaceAlt }}
        >
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontFamily: pretendard('600'),
                fontWeight: '600',
                fontSize: 12,
                letterSpacing: 0.6,
                color: BRAND_TOKENS.textMuted,
              }}
            >
              미리보기
            </Text>
            <Text
              style={{
                fontFamily: pretendard('500'),
                fontWeight: '500',
                fontSize: fontScale === 'lg' ? 20 : 16,
                color: BRAND_TOKENS.text,
              }}
            >
              인천대입구역 → 센트럴파크역
            </Text>
            <Text
              style={{
                fontSize: fontScale === 'lg' ? 16 : 14,
                color: BRAND_TOKENS.textMid,
              }}
            >
              휠체어 발판 지원 · 엘리베이터 앞 만남
            </Text>
          </View>
        </GyoumCard>
      </View>
    </Screen>
  );
}
