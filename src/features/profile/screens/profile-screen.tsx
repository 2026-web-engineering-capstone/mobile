import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BRAND_TOKENS, RADIUS, pretendard } from '@/lib/design-tokens';
import {
  GyoumCard,
  GyoumCTA,
} from '@/components/ui/gyoum-primitives';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/providers/auth-provider';

type MenuItem = {
  icon: string;
  title: string;
  desc: string;
  route: string;
};

const MENU_ITEMS: MenuItem[] = [
  {
    icon: '⭐',
    title: '즐겨찾기 역',
    desc: '자주 이용하는 역을 관리합니다',
    route: '/(app)/stations/favorites',
  },
  {
    icon: '♿',
    title: '접근성 설정',
    desc: '글씨 크기, 고대비, 테마 변경',
    route: '/(app)/settings/accessibility',
  },
  {
    icon: '🔍',
    title: '역 검색',
    desc: '전체 역 목록에서 검색합니다',
    route: '/(app)/stations/search',
  },
];

const ROLE_LABELS = {
  passenger: '교통약자',
  staff: '역무원',
  driver: '기관사',
  admin: '관리자',
} as const;

export function ProfileScreen() {
  const router = useRouter();
  const { role, user, signOut } = useAuth();
  const displayName = user?.name ?? '교움 사용자';
  const displayEmail = user?.email ?? 'demo@gyoum.kr';
  const avatarInitial = displayName.slice(0, 1);

  return (
    <Screen scrollable padded>
      <StatusBar style="auto" />
      <View style={{ gap: 24 }}>
        <GyoumCard padding={20} style={{ backgroundColor: BRAND_TOKENS.brandSubtle }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 32,
                backgroundColor: BRAND_TOKENS.brand,
              }}
            >
              <Text
                style={{
                  fontFamily: pretendard('700'),
                  fontWeight: '700',
                  fontSize: 24,
                  color: BRAND_TOKENS.onBrand100,
                }}
              >
                {avatarInitial}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  fontFamily: pretendard('700'),
                  fontWeight: '700',
                  fontSize: 20,
                  color: BRAND_TOKENS.text,
                }}
              >
                {displayName}
              </Text>
              <Text style={{ fontSize: 14, color: BRAND_TOKENS.textMid }}>
                {ROLE_LABELS[role]} · {displayEmail}
              </Text>
              {user?.station_id ? (
                <Text style={{ fontSize: 12, color: BRAND_TOKENS.textMuted }}>
                  소속 역: {user.station_id}
                </Text>
              ) : null}
            </View>
          </View>
        </GyoumCard>

        <GyoumCard padding={0}>
          {MENU_ITEMS.map((item, index) => (
            <View key={item.title}>
              {index > 0 ? (
                <View
                  style={{
                    height: 1,
                    backgroundColor: BRAND_TOKENS.border,
                    marginHorizontal: 20,
                  }}
                />
              ) : null}
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                }}
                onPress={() => router.push(item.route as never)}
                accessibilityRole="button"
                accessibilityLabel={item.title}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: RADIUS.sm,
                    backgroundColor: BRAND_TOKENS.surfaceAlt,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: pretendard('600'),
                      fontWeight: '600',
                      fontSize: 14,
                      color: BRAND_TOKENS.text,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: BRAND_TOKENS.textMuted }}
                  >
                    {item.desc}
                  </Text>
                </View>
                <Text style={{ color: BRAND_TOKENS.borderStrong }}>›</Text>
              </Pressable>
            </View>
          ))}
        </GyoumCard>

        <GyoumCard padding={16}>
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
              앱 정보
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontSize: 14, color: BRAND_TOKENS.textMid }}>
                버전
              </Text>
              <Text style={{ fontSize: 14, color: BRAND_TOKENS.textMuted }}>
                0.1.0
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontSize: 14, color: BRAND_TOKENS.textMid }}>
                환경
              </Text>
              <Text style={{ fontSize: 14, color: BRAND_TOKENS.textMuted }}>
                데모 (API 미연동)
              </Text>
            </View>
          </View>
        </GyoumCard>

        <GyoumCTA variant="danger" size="lg" onPress={signOut}>
          로그아웃
        </GyoumCTA>
      </View>
    </Screen>
  );
}
