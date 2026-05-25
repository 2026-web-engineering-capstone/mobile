import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BRAND_TOKENS, RADIUS, pretendard } from '@/lib/design-tokens';
import {
  GyoumCard,
  GyoumCTA,
} from '@/components/ui/gyoum-primitives';
import { Screen } from '@/components/ui/screen';
import { useStations } from '@/features/support-request/hooks/use-support-requests';
import { useAuth } from '@/providers/auth-provider';

const ROLE_LABELS = {
  passenger: '교통약자',
  staff: '역무원',
} as const;

export function ProfileScreen() {
  const { role, user, signOut } = useAuth();
  const stationsQuery = useStations();
  const displayName = user?.name ?? '교움 사용자';
  const displayEmail = user?.email ?? 'demo@gyoum.kr';
  const avatarInitial = displayName.slice(0, 1);
  const stationName = stationsQuery.data?.find((station) => station.id === user?.station_id)?.name;

  return (
    <Screen scrollable padded>
      <StatusBar style="auto" />
      <View style={{ gap: 16 }}>
        <View style={{ gap: 6, marginBottom: 4 }}>
          <Text
            style={{
              fontFamily: pretendard('700'),
              fontWeight: '700',
              fontSize: 24,
              color: BRAND_TOKENS.text,
            }}
          >
            내 정보
          </Text>
          <Text style={{ fontSize: 14, color: BRAND_TOKENS.textMuted }}>
            로그인된 계정 정보를 확인합니다.
          </Text>
        </View>

        <GyoumCard padding={20}>
          <View
            style={{
              alignItems: 'center',
              gap: 14,
              paddingVertical: 6,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 36,
                backgroundColor: BRAND_TOKENS.brand,
              }}
            >
              <Text
                style={{
                  fontFamily: pretendard('700'),
                  fontWeight: '700',
                  fontSize: 28,
                  color: BRAND_TOKENS.onBrand100,
                }}
              >
                {avatarInitial}
              </Text>
            </View>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Text
                style={{
                  fontFamily: pretendard('700'),
                  fontWeight: '700',
                  fontSize: 22,
                  color: BRAND_TOKENS.text,
                }}
              >
                {displayName}
              </Text>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: RADIUS.chip,
                  backgroundColor: BRAND_TOKENS.brandLight,
                }}
              >
                <Text
                  style={{
                    fontFamily: pretendard('700'),
                    fontWeight: '700',
                    fontSize: 12,
                    color: BRAND_TOKENS.brand,
                  }}
                >
                  {ROLE_LABELS[role]}
                </Text>
              </View>
            </View>
          </View>
        </GyoumCard>

        <GyoumCard padding={0}>
          <InfoRow label="이메일" value={displayEmail} />
          {user?.station_id ? (
            <InfoRow label="소속 역" value={stationName ?? user.station_id} />
          ) : null}
        </GyoumCard>

        <View style={{ marginTop: 8, gap: 10 }}>
          <GyoumCTA variant="danger" size="lg" onPress={signOut}>
            로그아웃
          </GyoumCTA>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: BRAND_TOKENS.textMuted,
            }}
          >
            로그아웃 후 다시 로그인 화면으로 이동합니다.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderBottomWidth: label === '이메일' ? 1 : 0,
        borderBottomColor: BRAND_TOKENS.border,
      }}
    >
      <Text
        style={{
          fontFamily: pretendard('600'),
          fontWeight: '600',
          fontSize: 13,
          color: BRAND_TOKENS.textMuted,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          flex: 1,
          textAlign: 'right',
          fontFamily: pretendard('600'),
          fontWeight: '600',
          fontSize: 14,
          color: BRAND_TOKENS.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
