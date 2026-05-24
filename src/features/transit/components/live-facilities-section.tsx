import type { ComponentType } from 'react';
import { Text, View } from 'react-native';
import { BRAND_TOKENS, RADIUS, pretendard } from '@/lib/design-tokens';
import { GyoumCard } from '@/components/ui/gyoum-primitives';
import {
  AccessibleToiletIcon,
  ElevatorIcon,
  EscalatorIcon,
  WheelchairIcon,
} from '@/components/ui/icons';
import { useStationFacilities } from '@/features/transit/hooks/use-station-facilities';
import {
  getFacilityLabel,
  OPERATIONAL_STATUS_LABEL,
} from '@/features/transit/types';

type IconProps = { color?: string; size?: number };

const FACILITY_ICON_MAP: Record<string, ComponentType<IconProps>> = {
  elevator: ElevatorIcon,
  escalator: EscalatorIcon,
  accessible_toilet: AccessibleToiletIcon,
  wheelchair_lift: WheelchairIcon,
};

interface LiveFacilitiesSectionProps {
  stationName: string;
}

export function LiveFacilitiesSection({
  stationName,
}: LiveFacilitiesSectionProps) {
  const { data, isLoading, error, refetch } = useStationFacilities(stationName);

  return (
    <View style={{ gap: 12 }}>
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
          FACILITIES
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
          교통약자 시설
        </Text>
      </View>

      {isLoading ? (
        <GyoumCard padding={16}>
          <Text style={{ fontSize: 14, color: BRAND_TOKENS.textMuted }}>
            시설 정보를 불러오고 있어요.
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
            시설 정보를 불러올 수 없어요
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

      {!isLoading && !error && data && data.facilities.length === 0 ? (
        <GyoumCard padding={16}>
          <Text style={{ fontSize: 14, color: BRAND_TOKENS.textMuted }}>
            공개된 편의시설 정보가 없습니다.
          </Text>
        </GyoumCard>
      ) : null}

      {!isLoading && !error && data && data.facilities.length > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {data.facilities.map((facility, index) => {
            const operational = facility.operationalStatus === 'operational';
            const badgeBg = operational
              ? BRAND_TOKENS.successBg
              : BRAND_TOKENS.surfaceAlt;
            const badgeFg = operational
              ? BRAND_TOKENS.success
              : BRAND_TOKENS.textMuted;
            return (
              <View
                key={`${facility.facilityType}-${index}`}
                style={{ flex: 1, minWidth: '48%' }}
              >
                <GyoumCard padding={12}>
                  <View style={{ gap: 4 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {(() => {
                        const Icon = FACILITY_ICON_MAP[facility.facilityType];
                        return Icon ? (
                          <Icon color={BRAND_TOKENS.brand} size={22} />
                        ) : null;
                      })()}
                      <View
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: RADIUS.pill,
                          backgroundColor: badgeBg,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: pretendard('600'),
                            fontWeight: '600',
                            fontSize: 10,
                            color: badgeFg,
                          }}
                        >
                          {OPERATIONAL_STATUS_LABEL[facility.operationalStatus]}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={{
                        fontFamily: pretendard('600'),
                        fontWeight: '600',
                        fontSize: 14,
                        color: BRAND_TOKENS.text,
                      }}
                    >
                      {getFacilityLabel(facility.facilityType)}
                    </Text>
                    {facility.locationNote ? (
                      <Text
                        style={{
                          fontSize: 12,
                          color: BRAND_TOKENS.textMuted,
                        }}
                      >
                        {facility.locationNote}
                      </Text>
                    ) : null}
                  </View>
                </GyoumCard>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
