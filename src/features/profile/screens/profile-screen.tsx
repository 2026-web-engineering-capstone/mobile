import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BRAND_TOKENS, pretendard } from '@/lib/design-tokens';
import {
  GyoumCard,
  GyoumCTA,
} from '@/components/ui/gyoum-primitives';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/providers/auth-provider';

const ROLE_LABELS: Record<string, string> = {
  passenger: '교통약자',
  staff: '역무원',
};

export function ProfileScreen() {
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
                {ROLE_LABELS[role] ?? role} · {displayEmail}
              </Text>
              {user?.station_name ? (
                <Text style={{ fontSize: 12, color: BRAND_TOKENS.textMuted }}>
                  소속 역: {user.station_name}
                </Text>
              ) : null}
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
