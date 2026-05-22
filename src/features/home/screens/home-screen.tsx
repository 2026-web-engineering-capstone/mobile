/**
 * 교움 디자인 시안의 승객 홈 화면.
 *
 * 인사말 → 가까운 역 카드(네이버 지도 + 노선 뱃지) → 진행 중 요청 카드 → 코랄 CTA →
 * 즐겨찾기 경로 → 역 시설 안내 + 실시간 도착 정보.
 */
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  BellIcon,
  ChevronRightIcon,
  GyoumCTA,
  GyoumCard,
  LineBadge,
  PlusIcon,
  PulseDot,
  Screen,
  SectionLabel,
  StarIcon,
  StatusChip,
} from '@/components/ui';
import { BRAND_TOKENS, RADIUS, getLineMeta, getOfficialLineName, pretendard } from '@/lib/design-tokens';
import { typo } from '@/lib/typography';
import { MapSection } from '@/features/home/components/map-section';
import {
  DEFAULT_STATION,
  STATION_CATALOG,
} from '@/features/home/data/station-catalog';
import { useCurrentLocation } from '@/features/home/hooks/use-current-location';
import { findNearestStation } from '@/features/home/lib/find-nearest-station';
import { useSupportRequests } from '@/features/support-request/hooks/use-support-requests';
import { useStationPreferencesStore } from '@/features/stations/store/use-station-preferences-store';
import { LiveArrivalSection } from '@/features/transit/components/live-arrival-section';
import { LiveFacilitiesSection } from '@/features/transit/components/live-facilities-section';
import {
  SUPPORT_REQUEST_STATUS_LABELS,
  TERMINAL_REQUEST_STATUSES,
} from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';

export function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: requests = [] } = useSupportRequests(user?.role === 'passenger');
  const { currentLocation } = useCurrentLocation();
  const favoriteStations = useStationPreferencesStore((s) => s.favoriteStations);

  const station = useMemo(() => {
    if (!currentLocation) return DEFAULT_STATION;
    return findNearestStation(currentLocation, STATION_CATALOG) ?? DEFAULT_STATION;
  }, [currentLocation]);

  const activeRequest = requests.find(
    (request) =>
      request.passenger_name === user?.name &&
      !TERMINAL_REQUEST_STATUSES.includes(request.status),
  );

  const lineMeta = getLineMeta(station.line.label);
  const userName = user?.name ?? '승객';

  return (
    <Screen
      background="bg"
      scrollable
      padded={false}
      contentStyle={{ paddingTop: 12, paddingHorizontal: 20, gap: 16 }}
    >
      <StatusBar style="dark" />
        {/* 상단 바 */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: RADIUS.sm,
              backgroundColor: BRAND_TOKENS.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: BRAND_TOKENS.textOnDark,
                fontFamily: pretendard('700'),
                fontWeight: '700',
                fontSize: 16,
              }}
            >
              교
            </Text>
          </View>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: RADIUS.pill,
              backgroundColor: BRAND_TOKENS.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BellIcon color={BRAND_TOKENS.text} size={20} />
          </View>
        </View>

        {/* 인사말 */}
        <View>
          <Text style={[typo('body-sm'), { color: BRAND_TOKENS.textMuted, marginBottom: 4 }]}>
            안녕하세요, {userName}님
          </Text>
          <Text style={[typo('title'), { color: BRAND_TOKENS.text }]}>
            지하철 이용에 도움이{'\n'}필요하신가요?
          </Text>
        </View>

        {/* 가까운 역 카드 — 인디고 배경 + 네이버 지도 */}
        <View
          style={{
            backgroundColor: BRAND_TOKENS.brand,
            borderRadius: RADIUS.card,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: BRAND_TOKENS.brand,
          }}
        >
          <MapSection station={station} />
          <View style={{ padding: 18 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: BRAND_TOKENS.success,
                }}
              />
              <Text
                style={[
                  typo('meta'),
                  { color: BRAND_TOKENS.textOnDark, opacity: 0.85 },
                ]}
              >
                가장 가까운 역 · 지원 가능
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <LineBadge char={lineMeta.char} color="white" size={36} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    typo('number-lg'),
                    { color: BRAND_TOKENS.textOnDark },
                  ]}
                >
                  {station.name}
                </Text>
                <Text
                  style={[
                    typo('body-sm'),
                    { color: BRAND_TOKENS.textOnDark, opacity: 0.75 },
                  ]}
                >
                  {getOfficialLineName(station.line.label)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 진행 중 요청 */}
        {activeRequest ? (
          <GyoumCard
            padding={18}
            accent
            onPress={() =>
              router.push(`/(app)/support/status/${activeRequest.id}`)
            }
            accessibilityLabel="진행 중인 지원 요청 보기"
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <PulseDot color={BRAND_TOKENS.accent} />
                <Text style={[typo('meta'), { color: BRAND_TOKENS.textMuted }]}>
                  진행 중인 요청
                </Text>
              </View>
              <StatusChip status={activeRequest.status} size="sm" />
            </View>
            <Text style={[typo('body-md'), { color: BRAND_TOKENS.text }]}>
              {activeRequest.origin_station_name} → {activeRequest.destination_station_name}
            </Text>
            <Text style={[typo('meta'), { color: BRAND_TOKENS.textMuted, marginTop: 4 }]}>
              {SUPPORT_REQUEST_STATUS_LABELS[activeRequest.status]} · 자세히 보기
            </Text>
          </GyoumCard>
        ) : null}

        {/* CTA */}
        <View style={{ marginTop: 8 }}>
          <GyoumCTA
            variant="accent"
            onPress={() => router.push('/(app)/support/new')}
            leadingIcon={<PlusIcon color={BRAND_TOKENS.textOnDark} size={20} />}
          >
            교통지원 요청하기
          </GyoumCTA>
        </View>

        {/* 즐겨찾는 경로 */}
        {favoriteStations.length > 0 ? (
          <View>
            <SectionLabel>즐겨찾는 역</SectionLabel>
            <View style={{ gap: 8 }}>
              {favoriteStations.slice(0, 3).map((fav) => (
                <GyoumCard
                  key={fav.id}
                  padding={14}
                  onPress={() => router.push('/(app)/stations/favorites')}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: RADIUS.sm,
                        backgroundColor: BRAND_TOKENS.accentLight,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <StarIcon color={BRAND_TOKENS.accent} filled size={20} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[typo('body-md'), { color: BRAND_TOKENS.text }]}>
                        {fav.name}
                      </Text>
                      <Text style={[typo('meta'), { color: BRAND_TOKENS.textMuted }]}>
                        {getOfficialLineName(fav.line)}
                      </Text>
                    </View>
                    <ChevronRightIcon color={BRAND_TOKENS.textMuted} size={20} />
                  </View>
                </GyoumCard>
              ))}
            </View>
          </View>
        ) : null}

        {/* 실시간 도착 */}
        <LiveArrivalSection stationName={station.name} />

        {/* 역 시설 */}
        <View>
          <SectionLabel>역 시설 안내</SectionLabel>
          <LiveFacilitiesSection stationName={station.name} />
        </View>
    </Screen>
  );
}
