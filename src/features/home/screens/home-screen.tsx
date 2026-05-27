/**
 * 교움 디자인 시안의 승객 홈 화면.
 *
 * 인사말 → 가까운 역 카드(네이버 지도 + 노선 뱃지) → 진행 중 요청 카드 → 코랄 CTA →
 * 즐겨찾기 경로 → 역 시설 안내 + 실시간 도착 정보.
 */
import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
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
import { useCurrentLocation } from '@/features/home/hooks/use-current-location';
import { useNearestStations } from '@/features/home/hooks/use-nearest-stations';
import { useSupportRequests } from '@/features/support-request/hooks/use-support-requests';
import { useStationPreferencesStore } from '@/features/stations/store/use-station-preferences-store';
import { LiveArrivalSection } from '@/features/transit/components/live-arrival-section';
import { LiveFacilitiesSection } from '@/features/transit/components/live-facilities-section';
import {
  SUPPORT_REQUEST_STATUS_LABELS,
  TERMINAL_REQUEST_STATUSES,
} from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';

function LocationPermissionCard() {
  const handleRequestPermission = async () => {
    await Location.requestForegroundPermissionsAsync();
  };

  return (
    <GyoumCard padding={24}>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: RADIUS.pill,
            backgroundColor: BRAND_TOKENS.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ fontSize: 22 }}>📍</Text>
        </View>
        <Text style={[typo('body-md'), { color: BRAND_TOKENS.text, textAlign: 'center' }]}>
          현재 위치를 확인할 수 없습니다
        </Text>
        <Text style={[typo('body-sm'), { color: BRAND_TOKENS.textMuted, textAlign: 'center' }]}>
          위치 권한을 허용하면 가장 가까운 역을 찾아드립니다
        </Text>
        <GyoumCTA variant="soft" onPress={handleRequestPermission}>
          위치 권한 허용하기
        </GyoumCTA>
      </View>
    </GyoumCard>
  );
}

function NearestStationErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <GyoumCard padding={24}>
      <View style={{ alignItems: 'center', gap: 12 }}>
        <Text style={[typo('body-md'), { color: BRAND_TOKENS.danger, textAlign: 'center' }]}>
          역 정보를 불러올 수 없습니다
        </Text>
        <Text style={[typo('body-sm'), { color: BRAND_TOKENS.textMuted, textAlign: 'center' }]}>
          네트워크 연결을 확인하고 다시 시도해주세요
        </Text>
        <GyoumCTA variant="soft" onPress={onRetry}>
          다시 시도
        </GyoumCTA>
      </View>
    </GyoumCard>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: requests = [] } = useSupportRequests(user?.role === 'passenger');
  const { currentLocation, errorMessage: locationError } = useCurrentLocation();
  const favoriteStations = useStationPreferencesStore((s) => s.favoriteStations);

  const {
    data: nearestStations,
    isLoading: stationsLoading,
    isError: stationsError,
    refetch: refetchStations,
  } = useNearestStations(
    currentLocation?.latitude ?? null,
    currentLocation?.longitude ?? null,
  );

  const station = nearestStations?.[0] ?? null;

  const activeRequest = requests.find(
    (request) =>
      request.passenger_name === user?.name &&
      !TERMINAL_REQUEST_STATUSES.includes(request.status),
  );

  const lineMeta = station ? getLineMeta(station.line) : null;
  const userName = user?.name ?? '승객';

  const hasLocation = currentLocation !== null;

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

        {/* 가까운 역 카드 — 상태별 분기 */}
        {!hasLocation && !locationError ? (
          <LocationPermissionCard />
        ) : locationError && !hasLocation ? (
          <LocationPermissionCard />
        ) : stationsError ? (
          <NearestStationErrorCard onRetry={refetchStations} />
        ) : stationsLoading || !station ? (
          <GyoumCard padding={24}>
            <View style={{ alignItems: 'center', gap: 12, paddingVertical: 20 }}>
              <ActivityIndicator size="large" color={BRAND_TOKENS.brand} />
              <Text style={[typo('body-sm'), { color: BRAND_TOKENS.textMuted }]}>
                가까운 역을 찾고 있습니다…
              </Text>
            </View>
          </GyoumCard>
        ) : (
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
                {lineMeta ? (
                  <LineBadge char={lineMeta.char} color="white" size={36} />
                ) : null}
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
                    {getOfficialLineName(station.line)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

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

        {/* 실시간 도착 + 역 시설 — station이 있을 때만 */}
        {station ? (
          <>
            <LiveArrivalSection stationName={station.name} />
            <View>
              <SectionLabel>역 시설 안내</SectionLabel>
              <LiveFacilitiesSection stationName={station.name} />
            </View>
          </>
        ) : null}
    </Screen>
  );
}
