/**
 * 교움 디자인 시안의 역무원 요청 상세 화면.
 *
 * 헤더(승객 이름 + 출발/도착) → 지원 유형 → 만남 위치 + 메모 → 요청 수락 CTA.
 * 요청 수락 후 staff-active 화면으로 이동.
 */
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowRightIcon,
  BottomBar,
  CheckIcon,
  Divider,
  ErrorView,
  GyoumAppBar,
  GyoumCTA,
  GyoumCard,
  LineBadge,
  LoadingView,
  PinIcon,
  Screen,
  SectionLabel,
  StatusChip,
  SUPPORT_TYPE_ICONS,
} from '@/components/ui';
import {
  BRAND_TOKENS,
  FONT_FAMILY,
  getStationLineMetas,
  type LineMeta,
} from '@/lib/design-tokens';
import { ApiError } from '@/lib/api/client';
import {
  cacheSupportRequestInList,
  useAssignSupportRequest,
  useSupportRequest,
} from '@/features/support-request/hooks/use-support-requests';
import {
  MEETING_POINT_LABELS,
  SUPPORT_TYPE_DESCRIPTIONS,
  SUPPORT_TYPE_LABELS,
} from '@/features/support-request/store/use-request-draft-store';
import {
  canStaffAssignSupportRequest,
  canStaffManageSupportRequest,
  canStaffViewSupportRequest,
  isDestinationHandoffStaff,
  type SupportRequestDetail,
} from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';
import { queryKeys } from '@/lib/query/query-keys';

export function RequestDetailScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const requestQuery = useSupportRequest(requestId);
  const assignMutation = useAssignSupportRequest();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (requestQuery.isLoading) return <LoadingView />;
  if (requestQuery.isError || !requestQuery.data) {
    return <ErrorView message={requestQuery.error?.message ?? '요청을 찾을 수 없습니다.'} />;
  }
  const request = requestQuery.data;

  // 패신저는 status 화면으로 보낸다.
  if (user?.role === 'passenger') {
    return <Redirect href={`/(app)/support/status/${request.id}`} />;
  }
  if (user?.role !== 'staff' || !canStaffViewSupportRequest(request, user)) {
    return <ErrorView message="이 요청을 볼 권한이 없습니다." />;
  }

  const canAssign = canStaffAssignSupportRequest(request, user);
  const canManage = canStaffManageSupportRequest(request, user);
  const canCompleteDropoff = isDestinationHandoffStaff(request, user);

  const handleAccept = async () => {
    setErrorMessage(null);
    try {
      await assignMutation.mutateAsync(request.id);
      router.replace(`/(app)/support/active/${request.id}`);
    } catch (error) {
      if (error instanceof ApiError) setErrorMessage(error.message);
      else setErrorMessage('요청 수락에 실패했습니다.');
    }
  };

  const handleBackToQueue = () => {
    cacheSupportRequestInList(queryClient, request);
    void queryClient.invalidateQueries({ queryKey: queryKeys.supportRequests.all });
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/(tabs)');
    }
  };

  return (
    <Screen background="bg" padded={false} edges={[]}>
      <StatusBar style="dark" />
      <GyoumAppBar
        title="요청 상세"
        topInset={insets.top}
        onBack={handleBackToQueue}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 140,
          gap: 12,
        }}
      >
        {/* 헤더 카드 */}
        <GyoumCard padding={18}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 12,
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 22,
                  fontWeight: '700',
                  color: BRAND_TOKENS.text,
                  letterSpacing: -0.4,
                }}
              >
                {request.passenger_name}
              </Text>
            </View>
            <StatusChip status={request.status} size="sm" />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 12 }}>
            <RoutePoint dir="출발" stationName={request.origin_station_name} stationId={request.origin_station_id} />
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRightIcon color={BRAND_TOKENS.textMuted} size={20} />
            </View>
            <RoutePoint dir="도착" stationName={request.destination_station_name} stationId={request.destination_station_id} />
          </View>
        </GyoumCard>

        {/* 지원 유형 */}
        <SectionLabel>요청한 지원 유형</SectionLabel>
        <GyoumCard padding={0}>
          {request.support_types.map((type, i) => {
            const Icon = SUPPORT_TYPE_ICONS[type];
            return (
              <View key={type}>
                {i > 0 ? <Divider inset={18} /> : null}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingHorizontal: 18,
                    paddingVertical: 14,
                  }}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: BRAND_TOKENS.brandLight,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon color={BRAND_TOKENS.brand} size={20} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: 15,
                        fontWeight: '600',
                        color: BRAND_TOKENS.text,
                      }}
                    >
                      {SUPPORT_TYPE_LABELS[type]}
                    </Text>
                    <Text
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: 12,
                        color: BRAND_TOKENS.textMuted,
                      }}
                    >
                      {SUPPORT_TYPE_DESCRIPTIONS[type]}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </GyoumCard>

        {/* 만남 위치 + 메모 */}
        <SectionLabel>만남 위치</SectionLabel>
        <GyoumCard padding={16}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginBottom: request.notes ? 12 : 0,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: BRAND_TOKENS.accentLight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PinIcon color={BRAND_TOKENS.accent} size={20} />
            </View>
            <View>
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 16,
                  fontWeight: '600',
                  color: BRAND_TOKENS.text,
                }}
              >
                {MEETING_POINT_LABELS[request.meeting_point]}
              </Text>
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 12,
                  color: BRAND_TOKENS.textMuted,
                }}
              >
                출발 역 내
              </Text>
            </View>
          </View>
          {request.notes ? (
            <View
              style={{
                padding: 12,
                backgroundColor: BRAND_TOKENS.surfaceAlt,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 11,
                  color: BRAND_TOKENS.textMuted,
                  marginBottom: 4,
                  fontWeight: '600',
                }}
              >
                인상착의 · 메모
              </Text>
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 14,
                  color: BRAND_TOKENS.text,
                  lineHeight: 21,
                }}
              >
                {request.notes}
              </Text>
            </View>
          ) : null}
        </GyoumCard>

        {errorMessage ? (
          <View
            style={{
              padding: 14,
              borderRadius: 14,
              backgroundColor: BRAND_TOKENS.dangerBg,
              borderWidth: 1,
              borderColor: BRAND_TOKENS.danger + '40',
            }}
          >
            <Text style={{ fontFamily: FONT_FAMILY, color: BRAND_TOKENS.danger, fontSize: 13 }}>
              {errorMessage}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <BottomBar style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        {canAssign ? (
          <GyoumCTA
            variant="primary"
            disabled={assignMutation.isPending}
            onPress={handleAccept}
            leadingIcon={<CheckIcon color={BRAND_TOKENS.onBrand100} size={20} />}
          >
            {assignMutation.isPending ? '수락 중...' : '요청 수락'}
          </GyoumCTA>
        ) : canCompleteDropoff ? (
          <GyoumCTA
            variant="success"
            onPress={() => router.push(`/(app)/support/complete/${request.id}`)}
          >
            하차 지원 처리하기
          </GyoumCTA>
        ) : canManage ? (
          <GyoumCTA
            variant="primary"
            onPress={() => router.push(`/(app)/support/active/${request.id}`)}
          >
            지원 진행하기
          </GyoumCTA>
        ) : (
          <GyoumCTA variant="ghost" onPress={handleBackToQueue}>
            돌아가기
          </GyoumCTA>
        )}
      </BottomBar>
    </Screen>
  );
}

function RoutePoint({
  dir,
  stationName,
  stationId,
}: {
  dir: '출발' | '도착';
  stationName: string;
  stationId: string;
}) {
  const lineMetas = getStationLineMetas(stationName, stationId);
  return (
    <View
      style={{
        flex: 1,
        padding: 12,
        borderRadius: 12,
        backgroundColor: BRAND_TOKENS.surfaceAlt,
      }}
    >
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 10,
          color: BRAND_TOKENS.textMuted,
          marginBottom: 4,
          fontWeight: '600',
          letterSpacing: 0.4,
        }}
      >
        {dir}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginBottom: 2,
        }}
      >
        <StationLineBadges lines={lineMetas} />
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 14,
            fontWeight: '700',
            color: BRAND_TOKENS.text,
            flexShrink: 1,
          }}
          numberOfLines={1}
        >
          {stationName}
        </Text>
      </View>
    </View>
  );
}

function StationLineBadges({ lines }: { lines: readonly LineMeta[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {lines.map((line, index) => (
        <LineBadge
          key={`${line.char}-${line.color}-${index}`}
          char={line.char}
          color={line.color}
          size={18}
        />
      ))}
    </View>
  );
}
