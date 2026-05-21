import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BRAND_TOKENS, RADIUS, pretendard } from '@/lib/design-tokens';
import {
  GyoumCard,
  GyoumCTA,
  LineBadge,
  PageTitle,
} from '@/components/ui/gyoum-primitives';
import { Screen } from '@/components/ui/screen';
import { useStationPreferencesStore } from '@/features/stations/store/use-station-preferences-store';

export function FavoritesScreen() {
  const router = useRouter();
  const favoriteStations = useStationPreferencesStore(
    (state) => state.favoriteStations,
  );
  const removeFavoriteStation = useStationPreferencesStore(
    (state) => state.removeFavoriteStation,
  );

  return (
    <Screen scrollable padded>
      <StatusBar style="auto" />
      <View style={{ gap: 20 }}>
        <PageTitle sub="자주 이용하는 역을 빠르게 선택하세요">
          즐겨찾기 역
        </PageTitle>

        {favoriteStations.length > 0 ? (
          <GyoumCard padding={0}>
            {favoriteStations.map((station, index) => (
              <View key={station.name}>
                {index > 0 ? (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: BRAND_TOKENS.border,
                      marginHorizontal: 20,
                    }}
                  />
                ) : null}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                  }}
                >
                  <LineBadge color={station.line_color} char="인" size={32} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: pretendard('600'),
                        fontWeight: '600',
                        fontSize: 14,
                        color: BRAND_TOKENS.text,
                      }}
                    >
                      {station.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: BRAND_TOKENS.textMuted,
                      }}
                    >
                      {station.line}
                    </Text>
                  </View>
                  <Pressable
                    style={{
                      borderRadius: RADIUS.sm,
                      backgroundColor: BRAND_TOKENS.dangerBg,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                    onPress={() => removeFavoriteStation(station.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${station.name} 즐겨찾기 삭제`}
                  >
                    <Text
                      style={{
                        fontFamily: pretendard('500'),
                        fontWeight: '500',
                        fontSize: 12,
                        color: BRAND_TOKENS.danger,
                      }}
                    >
                      삭제
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </GyoumCard>
        ) : (
          <GyoumCard padding={32}>
            <View style={{ alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 32 }}>⭐</Text>
              <Text
                style={{
                  fontFamily: pretendard('500'),
                  fontSize: 14,
                  color: BRAND_TOKENS.textMuted,
                }}
              >
                즐겨찾기한 역이 없습니다
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 12,
                  lineHeight: 20,
                  color: BRAND_TOKENS.textMuted,
                }}
              >
                역 검색에서 자주 이용하는 역을 추가해보세요
              </Text>
            </View>
          </GyoumCard>
        )}

        <GyoumCTA
          variant="soft"
          size="md"
          onPress={() => router.push('/(app)/stations/search')}
        >
          역 추가하기
        </GyoumCTA>
      </View>
    </Screen>
  );
}
