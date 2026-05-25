import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { BRAND_TOKENS, RADIUS, getLineMeta, getOfficialLineName, pretendard } from '@/lib/design-tokens';
import { GyoumCard, LineBadge } from '@/components/ui/gyoum-primitives';
import { useStationArrivals } from '@/features/transit/hooks/use-station-arrivals';
import type { ArrivalTrain } from '@/features/transit/types';
import { getLiveEtaLabel } from '@/features/transit/utils/arrival-time';

interface LiveArrivalSectionProps {
  stationName: string;
}

function groupByLine(trains: ArrivalTrain[]): Map<string, ArrivalTrain[]> {
  const groups = new Map<string, ArrivalTrain[]>();
  for (const train of trains) {
    const key = train.line ?? '노선 미상';
    const existing = groups.get(key) ?? [];
    existing.push(train);
    groups.set(key, existing);
  }
  return groups;
}

function sortLineGroups(
  groups: Map<string, ArrivalTrain[]>,
): [string, ArrivalTrain[]][] {
  return Array.from(groups.entries()).sort(([lineA], [lineB]) =>
    lineA.localeCompare(lineB, 'ko-KR', { numeric: true }),
  );
}

function getArrivalSubLabel(train: ArrivalTrain) {
  const parts = [train.direction, train.routeLabel, train.trainStatus].filter(Boolean);
  return parts.join(' · ');
}

export function LiveArrivalSection({ stationName }: LiveArrivalSectionProps) {
  const { data, isLoading, error, refetch, isFetching } =
    useStationArrivals(stationName);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

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
          {sortLineGroups(groupByLine(data.trains)).map(([line, lineTrains]) => {
            const lineMeta = getLineMeta(line);
            const lineName = getOfficialLineName(line);

            return (
              <GyoumCard key={line} padding={16}>
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <LineBadge char={lineMeta.char} color={lineMeta.color} size={26} />
                    <Text
                      style={{
                        fontFamily: pretendard('700'),
                        fontWeight: '700',
                        fontSize: 14,
                        color: BRAND_TOKENS.text,
                      }}
                    >
                      {lineName}
                    </Text>
                  </View>
                  <View style={{ gap: 2 }}>
                    {lineTrains.slice(0, 6).map((train, index) => {
                      const subLabel = getArrivalSubLabel(train);

                      return (
                        <View
                          key={`${train.lineId ?? line}-${train.trainNumber ?? index}-${train.destination}-${train.direction}`}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            paddingVertical: 8,
                          }}
                        >
                          <View style={{ flex: 1, gap: 3 }}>
                            <Text
                              style={{
                                fontFamily: pretendard('700'),
                                fontWeight: '700',
                                fontSize: 15,
                                color: BRAND_TOKENS.text,
                              }}
                            >
                              {train.destinationLabel || train.destination || '행선지 미상'}
                            </Text>
                            {subLabel ? (
                              <Text
                                style={{
                                  fontFamily: pretendard('500'),
                                  fontWeight: '500',
                                  fontSize: 12,
                                  color: BRAND_TOKENS.textMuted,
                                }}
                              >
                                {subLabel}
                              </Text>
                            ) : null}
                          </View>
                          <Text
                            style={{
                              fontFamily: pretendard('600'),
                              fontWeight: '600',
                              fontSize: 14,
                              color: BRAND_TOKENS.brand,
                              textAlign: 'right',
                            }}
                          >
                            {getLiveEtaLabel(train, data.fetchedAt, nowMs)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </GyoumCard>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
