import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query.trim(), 200);
  const selectionContext = getSelectionContext(context);
  const { data: stations = [] } = useStations(debouncedQuery || undefined);
  const recentStations = useStationPreferencesStore((state) => state.recentStations);
  const recordRecentStation = useStationPreferencesStore((state) => state.recordRecentStation);
  const toggleFavoriteStation = useStationPreferencesStore((state) => state.toggleFavoriteStation);
  const isFavoriteStation = useStationPreferencesStore((state) => state.isFavoriteStation);
  const originStationId = useRequestDraftStore((state) => state.originStationId);
  const destinationStationId = useRequestDraftStore((state) => state.destinationStationId);
  const setOriginStationId = useRequestDraftStore((state) => state.setOriginStationId);
  const setDestinationStationId = useRequestDraftStore((state) => state.setDestinationStationId);

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
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-5 px-5">
          <View className="gap-1">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              역 검색
            </Text>
            <Text className="text-sm text-default-400">
              이름으로 역을 찾아보세요
            </Text>
          </View>

          {/* 검색 입력 */}
          <View className="flex-row items-center gap-2 rounded-xl bg-default-100 px-4 py-3">
            <Text className="text-default-400">🔍</Text>
            <TextInput
              className="flex-1 text-sm text-foreground"
              placeholder="역 이름 입력"
              placeholderTextColor={undefined}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
            />
            {query ? (
              <Pressable onPress={() => setQuery('')}>
                <Text className="text-xs text-default-400">✕</Text>
              </Pressable>
            ) : null}
          </View>

          {!canSelectStation ? (
            <Card className="rounded-2xl border border-warning/30">
              <Card.Body className="p-4">
                <Text className="text-sm text-warning">
                  역 선택 맥락이 없어 요청 화면에서 다시 진입해주세요.
                </Text>
              </Card.Body>
            </Card>
          ) : null}

          {/* 최근 이용 */}
          {!query && recentStations.length > 0 ? (
            <View className="gap-3">
              <Text className="text-xs font-semibold tracking-wider text-default-400">
                최근 이용
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {recentStations.map((station) => (
                  <Chip
                    key={station.id}
                    variant="soft"
                    disabled={!canSelectStation}
                    onPress={() => selectStation(station)}
                  >
                    {station.name.replace('역', '')}
                  </Chip>
                ))}
              </View>
            </View>
          ) : null}

          <Separator />

          {/* 역 목록 */}
          <View className="gap-1">
            <Text className="mb-2 text-xs font-semibold tracking-wider text-default-400">
              {query ? `검색 결과 (${filtered.length})` : '전체 역'}
            </Text>
            {filtered.map((station) => {
              const favorite = isFavoriteStation(station.id);

              return (
                <View
                  key={station.id}
                  className="flex-row items-center gap-3 rounded-xl px-2 py-3"
                  style={{ minHeight: 44 }}
                >
                  <Pressable
                    className="flex-1 flex-row items-center gap-3"
                    disabled={!canSelectStation}
                    onPress={() => selectStation(station)}
                    accessibilityRole="button"
                    accessibilityLabel={`${station.name} ${station.line} 선택`}
                  >
                    <View
                      className="h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: station.line_color }}
                    >
                      <Text className="text-[10px] font-bold text-white">인</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {station.name}
                      </Text>
                      <Text className="text-xs text-default-400">
                        {station.line}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    className={`items-center justify-center rounded-lg px-3 ${favorite ? 'bg-warning/15' : 'bg-default-100'}`}
                    style={{ minHeight: 44, minWidth: 64 }}
                    onPress={() => toggleFavoriteStation(station)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'
                    }
                    accessibilityState={{ selected: favorite }}
                  >
                    <Text
                      className={`text-xs font-medium ${favorite ? 'text-warning' : 'text-default-500'}`}
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
      </ScrollView>
    </View>
  );
}