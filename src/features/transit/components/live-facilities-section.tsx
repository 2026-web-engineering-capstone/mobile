import { Text, View } from 'react-native';
import { Card } from 'heroui-native/card';
import { useStationFacilities } from '@/features/transit/hooks/use-station-facilities';
import {
  getFacilityEmoji,
  getFacilityLabel,
  OPERATIONAL_STATUS_LABEL,
} from '@/features/transit/types';

interface LiveFacilitiesSectionProps {
  stationName: string;
}

export function LiveFacilitiesSection({
  stationName,
}: LiveFacilitiesSectionProps) {
  const { data, isLoading, error, refetch } = useStationFacilities(stationName);

  return (
    <View className="gap-3">
      <View className="gap-0.5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-brand dark:text-brand-dark">
          FACILITIES
        </Text>
        <Text className="text-xl font-bold tracking-tight text-foreground">
          교통약자 시설
        </Text>
      </View>

      {isLoading ? (
        <Card className="rounded-2xl">
          <Card.Body className="p-4">
            <Text className="text-sm text-default-500">
              시설 정보를 불러오고 있어요.
            </Text>
          </Card.Body>
        </Card>
      ) : null}

      {error ? (
        <Card className="rounded-2xl border border-danger/30 bg-danger/5">
          <Card.Body className="gap-2 p-4">
            <Text className="text-sm font-semibold text-danger">
              시설 정보를 불러올 수 없어요
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

      {!isLoading && !error && data && data.facilities.length === 0 ? (
        <Card className="rounded-2xl">
          <Card.Body className="p-4">
            <Text className="text-sm text-default-500">
              공개된 편의시설 정보가 없습니다.
            </Text>
          </Card.Body>
        </Card>
      ) : null}

      {!isLoading && !error && data && data.facilities.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {data.facilities.map((facility, index) => {
            const operational =
              facility.operationalStatus === 'operational';
            const outOfService =
              facility.operationalStatus === 'out_of_service';
            return (
              <Card
                key={`${facility.facilityType}-${index}`}
                className={`min-w-[48%] flex-1 rounded-2xl ${
                  outOfService
                    ? 'border border-danger/30'
                    : 'border border-default-200'
                }`}
              >
                <Card.Body className="gap-1 p-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xl">
                      {getFacilityEmoji(facility.facilityType)}
                    </Text>
                    <View
                      className={`rounded-full px-2 py-0.5 ${
                        operational
                          ? 'bg-status-completed-bg dark:bg-status-completed-bg-dark'
                          : outOfService
                            ? 'bg-status-unavailable-bg dark:bg-status-unavailable-bg-dark'
                            : 'bg-default-100'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-semibold ${
                          operational
                            ? 'text-status-completed dark:text-status-completed-dark'
                            : outOfService
                              ? 'text-status-unavailable dark:text-status-unavailable-dark'
                              : 'text-default-500'
                        }`}
                      >
                        {
                          OPERATIONAL_STATUS_LABEL[
                            facility.operationalStatus
                          ]
                        }
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm font-semibold text-foreground">
                    {getFacilityLabel(facility.facilityType)}
                  </Text>
                  {facility.locationNote ? (
                    <Text className="text-xs text-default-400">
                      {facility.locationNote}
                    </Text>
                  ) : null}
                </Card.Body>
              </Card>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
