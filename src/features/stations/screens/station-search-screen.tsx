import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BRAND_TOKENS, RADIUS, pretendard } from '@/lib/design-tokens';
import {
  GyoumCard,
  GyoumSearchInput,
  LineBadge,
  PageTitle,
} from '@/components/ui/gyoum-primitives';
import { Screen } from '@/components/ui/screen';
import { EmptyView } from '@/components/ui';
import { useStations } from '@/features/support-request/hooks/use-support-requests';
import { useRequestDraftStore } from '@/features/support-request/store/use-request-draft-store';
import { useStationPreferencesStore } from '@/features/stations/store/use-station-preferences-store';
import { useDebounce } from '@/lib/hooks/use-debounce';
import type { Station } from '@/lib/api/types';

type StationSearchContext = 'origin' | 'destination';

function getSelectionContext(context?: string): StationSearchContext | null {
  if (context === 'origin' || context === 'destination') {
    return context;
  }

  return null;
}

export function StationSearchScreen() {
  const router = useRouter();
  const { context } = useLocalSearchParams<{ context?: string }>();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 200);
  const selectionContext = getSelectionContext(context);
  const { data: stations = [] } = useStations(debouncedQuery || undefined);
  const recentStations = useStationPreferencesStore(
    (state) => state.recentStations,
  );
  const recordRecentStation = useStationPreferencesStore(
    (state) => state.recordRecentStation,
  );
  const toggleFavoriteStation = useStationPreferencesStore(
    (state) => state.toggleFavoriteStation,
  );
  const isFavoriteStation = useStationPreferencesStore(
    (state) => state.isFavoriteStation,
  );
  const originStationId = useRequestDraftStore((state) => state.originStationId);
  const destinationStationId = useRequestDraftStore(
    (state) => state.destinationStationId,
  );
  const setOriginStationId = useRequestDraftStore(
    (state) => state.setOriginStationId,
  );
  const setDestinationStationId = useRequestDraftStore(
    (state) => state.setDestinationStationId,
  );

  const filtered = debouncedQuery
    ? stations.filter((station) => station.name.includes(debouncedQuery))
    : stations;
  const canSelectStation = selectionContext !== null;

  const selectStation = (station: Station) => {
    if (!selectionContext) {
      return;
    }

    if (selectionContext === 'origin') {
      setOriginStationId(station.id);
      if (destinationStationId === station.id) {
        setDestinationStationId('');
      }
    } else {
      setDestinationStationId(station.id);
      if (originStationId === station.id) {
        setOriginStationId('');
      }
    }

    recordRecentStation(station);
    router.back();
  };

  return (
    <Screen
      scrollable
      padded
      scrollProps={{ keyboardShouldPersistTaps: 'handled' }}
    >
      <StatusBar style="auto" />
      <View style={{ gap: 20 }}>
        <PageTitle sub="이름으로 역을 찾아보세요">역 검색</PageTitle>

        <GyoumSearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="역 이름 입력"
          onClear={() => setQuery('')}
        />

        {!canSelectStation ? (
          <GyoumCard padding={16}>
            <Text
              style={{
                fontSize: 14,
                color: BRAND_TOKENS.warning,
              }}
            >
              역 선택 맥락이 없어 요청 화면에서 다시 진입해주세요.
            </Text>
          </GyoumCard>
        ) : null}

        {!query && recentStations.length > 0 ? (
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
              최근 이용
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {recentStations.map((station) => (
                <Pressable
                  key={station.id}
                  disabled={!canSelectStation}
                  onPress={() => selectStation(station)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: RADIUS.chip,
                    backgroundColor: BRAND_TOKENS.brandLight,
                    opacity: canSelectStation ? 1 : 0.5,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`${station.name} 선택`}
                >
                  <Text
                    style={{
                      fontFamily: pretendard('500'),
                      fontWeight: '500',
                      fontSize: 13,
                      color: BRAND_TOKENS.brand,
                    }}
                  >
                    {station.name.replace('역', '')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View
          style={{ height: 1, backgroundColor: BRAND_TOKENS.border }}
        />

        <View style={{ gap: 4 }}>
          <Text
            style={{
              marginBottom: 8,
              fontFamily: pretendard('600'),
              fontWeight: '600',
              fontSize: 12,
              letterSpacing: 0.6,
              color: BRAND_TOKENS.textMuted,
            }}
          >
            {query ? `검색 결과 (${filtered.length})` : '전체 역'}
          </Text>
          {filtered.map((station) => {
            const favorite = isFavoriteStation(station.id);

            return (
              <View
                key={station.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 12,
                  borderRadius: RADIUS.chip,
                  minHeight: 44,
                }}
              >
                <Pressable
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                  disabled={!canSelectStation}
                  onPress={() => selectStation(station)}
                  accessibilityRole="button"
                  accessibilityLabel={`${station.name} ${station.line} 선택`}
                >
                  <LineBadge color={station.line_color} char="인" size={32} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: pretendard('600'),
                        fontWeight: '600',
                        fontSize: 16,
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
                </Pressable>
                <Pressable
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: RADIUS.sm,
                    paddingHorizontal: 12,
                    minHeight: 44,
                    minWidth: 64,
                    backgroundColor: favorite
                      ? BRAND_TOKENS.warningBg
                      : BRAND_TOKENS.surfaceAlt,
                  }}
                  onPress={() => toggleFavoriteStation(station)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'
                  }
                  accessibilityState={{ selected: favorite }}
                >
                  <Text
                    style={{
                      fontFamily: pretendard('500'),
                      fontWeight: '500',
                      fontSize: 12,
                      color: favorite
                        ? BRAND_TOKENS.warning
                        : BRAND_TOKENS.textMuted,
                    }}
                  >
                    {favorite ? '★ 저장됨' : '☆ 즐겨찾기'}
                  </Text>
                </Pressable>
              </View>
            );
          })}
          {filtered.length === 0 ? (
            <EmptyView
              title={
                debouncedQuery
                  ? `'${debouncedQuery}'에 해당하는 역이 없습니다`
                  : '표시할 역이 없습니다'
              }
              description={
                debouncedQuery
                  ? '다른 키워드로 다시 검색해 주세요.'
                  : '잠시 후 다시 시도해 주세요.'
              }
            />
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
