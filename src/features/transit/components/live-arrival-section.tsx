import { Text, View } from 'react-native';
import { BRAND_TOKENS, RADIUS, pretendard } from '@/lib/design-tokens';
import { GyoumCard } from '@/components/ui/gyoum-primitives';
import { useStationArrivals } from '@/features/transit/hooks/use-station-arrivals';
import type { ArrivalTrain } from '@/features/transit/types';

interface LiveArrivalSectionProps {
  stationName: string;
}

function groupByDirection(trains: ArrivalTrain[]): Map<string, ArrivalTrain[]> {
  const groups = new Map<string, ArrivalTrain[]>();
  for (const train of trains) {
    const key = train.direction ?? '방면 미상';
    const existing = groups.get(key) ?? [];
    existing.push(train);
    groups.set(key, existing);
  }
  return groups;
}

export function LiveArrivalSection({ stationName }: LiveArrivalSectionProps) {
  const { data, isLoading, error, refetch, isFetching } =
    useStationArrivals(stationName);

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ gap: 2 }}>
          <Text
            style={{
              fontFamily: pretendard('600'),
              fontWeight: '600',
              fontSize: 12,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: BRAND_TOKENS.brand,
            }}
          >
            LIVE
          </Text>
          <Text
            style={{
              fontFamily: pretendard('700'),
              fontWeight: '700',
              fontSize: 20,
              letterSpacing: -0.2,
              color: BRAND_TOKENS.text,
            }}
          >
            도착 정보
          </Text>
        </View>
        <Text
          style={{
            fontFamily: pretendard('500'),
            fontSize: 12,
            color: BRAND_TOKENS.textMuted,
          }}
        >
          {stationName}
          {isFetching ? ' · 갱신 중' : ''}
        </Text>
      </View>

      {isLoading ? (
        <GyoumCard padding={16}>
          <Text style={{ fontSize: 14, color: BRAND_TOKENS.textMuted }}>
            실시간 도착 정보를 불러오고 있어요.
          </Text>
        </GyoumCard>
      ) : null}

      {error ? (
        <View
          style={{
            gap: 8,
            padding: 16,
            borderRadius: RADIUS.card,
            backgroundColor: BRAND_TOKENS.dangerBg,
            borderWidth: 1,
            borderColor: BRAND_TOKENS.danger,
          }}
        >
          <Text
            style={{
              fontFamily: pretendard('600'),
              fontWeight: '600',
              fontSize: 14,
              color: BRAND_TOKENS.danger,
            }}
          >
            실시간 도착 정보를 불러올 수 없어요
          </Text>
          <Text
            style={{
              fontSize: 12,
              lineHeight: 20,
              color: BRAND_TOKENS.danger,
            }}
          >
            {error instanceof Error
              ? error.message
              : '잠시 후 다시 시도해 주세요.'}
          </Text>
          <Text
            onPress={() => {
              void refetch();
            }}
            style={{
              marginTop: 4,
              fontFamily: pretendard('600'),
              fontWeight: '600',
              fontSize: 12,
              textDecorationLine: 'underline',
              color: BRAND_TOKENS.danger,
            }}
          >
            다시 시도
          </Text>
        </View>
      ) : null}

      {!isLoading && !error && data && data.trains.length === 0 ? (
        <GyoumCard padding={16}>
          <Text style={{ fontSize: 14, color: BRAND_TOKENS.textMuted }}>
            현재 도착 예정인 열차가 없거나 정보가 공개되지 않은 역입니다.
          </Text>
        </GyoumCard>
      ) : null}

      {!isLoading && !error && data && data.trains.length > 0 ? (
        <View style={{ gap: 12 }}>
          {Array.from(groupByDirection(data.trains).entries()).map(
            ([direction, trains]) => (
              <GyoumCard key={direction} padding={16}>
                <View style={{ gap: 8 }}>
                  <Text
                    style={{
                      fontFamily: pretendard('700'),
                      fontWeight: '700',
                      fontSize: 14,
                      color: BRAND_TOKENS.text,
                    }}
                  >
                    {direction}
                  </Text>
                  <View style={{ gap: 6 }}>
                    {trains.slice(0, 4).map((train, index) => (
                      <View
                        key={`${train.trainNumber ?? index}-${train.destination}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 14,
                            color: BRAND_TOKENS.textMid,
                          }}
                        >
                          {train.destination || train.trainNumber || '열차'}
                        </Text>
                        <Text
                          style={{
                            fontFamily: pretendard('600'),
                            fontWeight: '600',
                            fontSize: 14,
                            color: BRAND_TOKENS.brand,
                          }}
                        >
                          {train.etaMessage || '도착 정보 없음'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </GyoumCard>
            ),
          )}
        </View>
      ) : null}
    </View>
  );
}
