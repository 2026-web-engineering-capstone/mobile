import { Text, View } from 'react-native';
import { Card } from 'heroui-native/card';
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

  const isFallback = data?.source === 'fallback';

  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between">
        <View className="gap-0.5">
          <Text className="text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-dark">
            LIVE
          </Text>
          <Text className="text-xl font-bold tracking-tight text-foreground">
            도착 정보
          </Text>
        </View>
        <Text className="text-xs text-default-400">
          {stationName}
          {isFetching ? ' · 갱신 중' : ''}
        </Text>
      </View>

      {data ? (
        <View
          className={`flex-row items-center gap-2 self-start rounded-full px-3 py-1 ${
            isFallback
              ? 'bg-warning/15 dark:bg-warning/20'
              : 'bg-success/15 dark:bg-success/20'
          }`}
        >
          <View
            className={`h-2 w-2 rounded-full ${
              isFallback ? 'bg-warning' : 'bg-success'
            }`}
          />
          <Text
            className={`text-[11px] font-semibold ${
              isFallback ? 'text-warning' : 'text-success'
            }`}
          >
            {isFallback ? '예시 데이터' : '실시간'}
          </Text>
          {isFallback && data.fallbackReason ? (
            <Text className="ml-1 text-[11px] text-default-500">
              {data.fallbackReason}
            </Text>
          ) : null}
        </View>
      ) : null}

      {isLoading ? (
        <Card className="rounded-2xl">
          <Card.Body className="p-4">
            <Text className="text-sm text-default-500">
              실시간 도착 정보를 불러오고 있어요.
            </Text>
          </Card.Body>
        </Card>
      ) : null}

      {error ? (
        <Card className="rounded-2xl border border-danger/30 bg-danger/5">
          <Card.Body className="gap-2 p-4">
            <Text className="text-sm font-semibold text-danger">
              실시간 도착 정보를 불러올 수 없어요
            </Text>
            <Text className="text-xs leading-5 text-danger">
              {error instanceof Error
                ? error.message
                : '잠시 후 다시 시도해 주세요.'}
            </Text>
            <Text
              className="mt-1 text-xs font-semibold text-danger underline"
              onPress={() => {
                void refetch();
              }}
            >
              다시 시도
            </Text>
          </Card.Body>
        </Card>
      ) : null}

      {!isLoading && !error && data && data.trains.length === 0 ? (
        <Card className="rounded-2xl">
          <Card.Body className="p-4">
            <Text className="text-sm text-default-500">
              현재 도착 예정인 열차가 없거나 정보가 공개되지 않은 역입니다.
            </Text>
          </Card.Body>
        </Card>
      ) : null}

      {!isLoading && !error && data && data.trains.length > 0 ? (
        <View className="gap-3">
          {Array.from(groupByDirection(data.trains).entries()).map(
            ([direction, trains]) => (
              <Card
                key={direction}
                className="rounded-2xl border border-default-200"
              >
                <Card.Body className="gap-2 p-4">
                  <Text className="text-sm font-bold text-foreground">
                    {direction}
                  </Text>
                  <View className="gap-1.5">
                    {trains.slice(0, 4).map((train, index) => (
                      <View
                        key={`${train.trainNumber ?? index}-${train.destination}`}
                        className="flex-row items-center justify-between"
                      >
                        <Text className="flex-1 text-sm text-default-600">
                          {train.destination || train.trainNumber || '열차'}
                        </Text>
                        <Text className="text-sm font-semibold text-brand dark:text-brand-dark">
                          {train.etaMessage || '도착 정보 없음'}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Card.Body>
              </Card>
            ),
          )}
        </View>
      ) : null}
    </View>
  );
}
