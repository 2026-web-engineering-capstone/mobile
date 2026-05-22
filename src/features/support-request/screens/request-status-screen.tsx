/**
 * 교움 디자인 시안의 승객 요청 상태 화면.
 *
 * 어두운 요약 카드 + 현재 단계 펄스 카드 + 타임라인 + 취소 CTA.
 * Staff 액션(수락/체크리스트/승차완료/완료)은 별도 staff 화면들로 분리.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  PageTitle,
  Screen,
  SectionLabel,
  StatusChip,
} from '@/components/ui';
import { BRAND_TOKENS, FONT_FAMILY, RADIUS, getLineMeta } from '@/lib/design-tokens';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/providers/auth-provider';
import {
  useCancelSupportRequest,
  useSupportRequest,
  useUploadSupportRequestCurrentLocation,
} from '@/features/support-request/hooks/use-support-requests';
import { useCurrentLocation } from '@/features/home/hooks/use-current-location';
import {
  canPassengerUploadCurrentLocation,
  canStaffViewSupportRequest,
  CANCEL_REASON_LABELS,
  CANCELLABLE_REQUEST_STATUSES,
  getCancelReasonLabel,
  getSupportRequestStatusGuide,
  SUPPORT_REQUEST_FLOW,
  SUPPORT_REQUEST_STATUS_GUIDES,
  SUPPORT_REQUEST_STATUS_LABELS,
  TERMINAL_REQUEST_STATUSES,
  type CancelReasonCode,
  type SupportRequestDetail,
  type SupportRequestStatus,
} from '@/features/support-request/types';
import { MEETING_POINT_LABELS, SUPPORT_TYPE_LABELS } from '@/features/support-request/store/use-request-draft-store';

function formatTime(iso: string | null | undefined) {
  if (!iso) return '';
  const date = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const PROGRESS_DESCRIPTIONS: Record<SupportRequestStatus, string> = {
  submitted: '출발 역 역무원이 요청을 확인하고 있어요.',
  assigned: '담당 역무원이 만남 위치로 이동 중입니다.',
  in_progress: '역무원이 도착해 승강장 이동과 탑승 지원을 진행하고 있어요.',
  boarded: '승차가 완료되었어요.',
  awaiting_dropoff: '도착 역에서 하차 지원을 처리하고 있어요.',
  completed: '하차가 완료되었어요. 좋은 하루 되세요!',
  cancelled: '요청이 취소되었습니다.',
  unavailable: '현재 요청을 지원할 수 없는 상태입니다.',
};

export function RequestStatusScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const requestQuery = useSupportRequest(requestId);

  if (requestQuery.isLoading) {
    return <LoadingView />;
  }
  if (requestQuery.isError || !requestQuery.data) {
    return <ErrorView message={requestQuery.error?.message ?? '요청을 찾을 수 없습니다.'} />;
  }

  const request = requestQuery.data;
  const isPassenger = user?.role === 'passenger' && request.passenger_id === user.id;
  const isStaffWithAccess = user?.role === 'staff' && canStaffViewSupportRequest(request, user);

  // staff는 요청 상세를 staff-detail로 보낸다.
  if (user?.role === 'staff' && isStaffWithAccess) {
    return (
      <Screen background="bg" padded={false} edges={[]}>
        <GyoumAppBar
          title="요청 상세"
          topInset={insets.top}
          onBack={() => router.back()}
        />
        <PassengerLikeBody insets={insets} request={request} hideCancel />
      </Screen>
    );
  }

  if (!isPassenger) {
    return <ErrorView message="요청을 볼 권한이 없습니다." />;
  }

  return (
    <Screen background="bg" padded={false} edges={[]}>
      <StatusBar style="dark" />
      <GyoumAppBar
        title="진행 상황"
        topInset={insets.top}
        onBack={() => router.replace('/(app)/(tabs)/history')}
        trailing={<StatusChip status={request.status} size="sm" />}
      />
      <PassengerLikeBody insets={insets} request={request} />
    </Screen>
  );
}

function PassengerLikeBody({
  insets,
  request,
  hideCancel,
}: {
  insets: ReturnType<typeof useSafeAreaInsets>;
  request: SupportRequestDetail;
  hideCancel?: boolean;
}) {
  const router = useRouter();
  const cancelMutation = useCancelSupportRequest(request.id);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showCancel =
    !hideCancel && CANCELLABLE_REQUEST_STATUSES.includes(request.status);
  const showCompletedAction =
    !hideCancel && request.status === 'completed';

  const handleCancel = async (reason: CancelReasonCode) => {
    setErrorMessage(null);
    try {
      await cancelMutation.mutateAsync(reason);
      setCancelOpen(false);
    } catch (error) {
      if (error instanceof ApiError) setErrorMessage(error.message);
      else setErrorMessage('취소에 실패했습니다.');
    }
  };

  // 패신저: 현재 위치 자동 업로드 (단순화)
  usePassengerLocationUpload(request);

  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: showCancel || showCompletedAction ? 140 : insets.bottom + 32,
          gap: 16,
        }}
      >
        <SummaryCard request={request} />
        <CurrentPhaseCard request={request} />
        <TimelineCard request={request} />
        <DetailsCard request={request} />

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

        {cancelOpen ? (
          <GyoumCard padding={16}>
            <SectionLabel>취소 사유</SectionLabel>
            <View style={{ gap: 8 }}>
              {(Object.entries(CANCEL_REASON_LABELS) as [CancelReasonCode, string][]).map(
                ([code, label]) => (
                  <Pressable
                    key={code}
                    onPress={() => handleCancel(code)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: BRAND_TOKENS.surfaceAlt,
                      borderWidth: 1,
                      borderColor: BRAND_TOKENS.border,
                    }}
                  >
                    <Text
                      style={{ fontFamily: FONT_FAMILY, fontSize: 14, color: BRAND_TOKENS.text }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>
          </GyoumCard>
        ) : null}
      </ScrollView>

      {(showCancel || showCompletedAction) && !hideCancel ? (
        <BottomBar style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          {showCancel ? (
            <GyoumCTA
              variant="ghost"
              onPress={() => setCancelOpen((open) => !open)}
              disabled={cancelMutation.isPending}
            >
              {cancelOpen ? '닫기' : '요청 취소하기'}
            </GyoumCTA>
          ) : (
            <GyoumCTA
              variant="primary"
              onPress={() => router.replace('/(app)/(tabs)')}
            >
              완료
            </GyoumCTA>
          )}
        </BottomBar>
      ) : null}
    </>
  );
}

function SummaryCard({ request }: { request: SupportRequestDetail }) {
  const showTrainInfo = ['boarded', 'awaiting_dropoff', 'completed'].includes(
    request.status,
  );
  return (
    <GyoumCard
      padding={18}
      style={{
        backgroundColor: BRAND_TOKENS.text,
        borderColor: BRAND_TOKENS.text,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 12,
            color: BRAND_TOKENS.onBrand60,
          }}
        >
          지원 요청
        </Text>
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 12,
            color: BRAND_TOKENS.onBrand60,
          }}
        >
          {formatTime(request.created_at)}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 11,
              color: BRAND_TOKENS.onBrand60,
              marginBottom: 2,
            }}
          >
            출발
          </Text>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 16,
              color: BRAND_TOKENS.textOnDark,
              fontWeight: '600',
            }}
          >
            {request.origin_station_name}
          </Text>
        </View>
        <ArrowRightIcon color={BRAND_TOKENS.onBrand70} size={20} />
        <View>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 11,
              color: BRAND_TOKENS.onBrand60,
              marginBottom: 2,
            }}
          >
            도착
          </Text>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 16,
              color: BRAND_TOKENS.textOnDark,
              fontWeight: '600',
            }}
          >
            {request.destination_station_name}
          </Text>
        </View>
      </View>
      {showTrainInfo && request.train_number ? (
        <View
          style={{
            marginTop: 14,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: BRAND_TOKENS.onBrand15,
            flexDirection: 'row',
            gap: 16,
          }}
        >
          <Stat label="열차 번호" value={request.train_number} />
          {request.train_car_number ? (
            <Stat label="칸 번호" value={request.train_car_number} />
          ) : null}
        </View>
      ) : null}
    </GyoumCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 10,
          color: BRAND_TOKENS.onBrand55,
          marginBottom: 2,
        }}
      >
        {label}
      </Text>
      <Text
        style={{ fontFamily: FONT_FAMILY, fontSize: 16, color: BRAND_TOKENS.textOnDark, fontWeight: '700' }}
      >
        {value}
      </Text>
    </View>
  );
}

function CurrentPhaseCard({ request }: { request: SupportRequestDetail }) {
  if (request.status === 'completed') {
    return (
      <GyoumCard
        padding={18}
        style={{
          backgroundColor: BRAND_TOKENS.successBg,
          borderColor: BRAND_TOKENS.success,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 6,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: BRAND_TOKENS.success,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckIcon color={BRAND_TOKENS.textOnDark} size={18} />
          </View>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 17,
              fontWeight: '700',
              color: BRAND_TOKENS.success,
            }}
          >
            하차 완료
          </Text>
        </View>
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 14,
            color: BRAND_TOKENS.textMid,
            lineHeight: 21,
          }}
        >
          {request.completion_note ?? PROGRESS_DESCRIPTIONS.completed}
        </Text>
      </GyoumCard>
    );
  }
  if (request.status === 'cancelled') {
    return (
      <GyoumCard
        padding={18}
        style={{ backgroundColor: BRAND_TOKENS.dangerBg, borderColor: BRAND_TOKENS.danger }}
      >
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 16,
            fontWeight: '700',
            color: BRAND_TOKENS.danger,
            marginBottom: 4,
          }}
        >
          요청이 취소되었습니다
        </Text>
        <Text style={{ fontFamily: FONT_FAMILY, fontSize: 13, color: BRAND_TOKENS.textMid }}>
          {getCancelReasonLabel(request.cancel_reason) ?? '취소 사유가 기록되었습니다.'}
        </Text>
      </GyoumCard>
    );
  }
  if (request.status === 'unavailable') {
    return (
      <GyoumCard
        padding={18}
        style={{ backgroundColor: BRAND_TOKENS.warningBg, borderColor: BRAND_TOKENS.warning }}
      >
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 16,
            fontWeight: '700',
            color: BRAND_TOKENS.warning,
            marginBottom: 4,
          }}
        >
          현재 지원이 어렵습니다
        </Text>
        <Text style={{ fontFamily: FONT_FAMILY, fontSize: 13, color: BRAND_TOKENS.textMid }}>
          {getSupportRequestStatusGuide(request)}
        </Text>
      </GyoumCard>
    );
  }

  return (
    <GyoumCard
      padding={18}
      style={{ backgroundColor: BRAND_TOKENS.successBg, borderColor: BRAND_TOKENS.success }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 6,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: BRAND_TOKENS.success,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckIcon color={BRAND_TOKENS.textOnDark} size={14} />
        </View>
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 12,
            color: BRAND_TOKENS.success,
            fontWeight: '700',
            letterSpacing: 0.4,
          }}
        >
          현재 단계
        </Text>
      </View>
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 17,
          fontWeight: '700',
          color: BRAND_TOKENS.text,
          marginBottom: 4,
        }}
      >
        {SUPPORT_REQUEST_STATUS_LABELS[request.status]}
      </Text>
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 14,
          color: BRAND_TOKENS.textMid,
          lineHeight: 21,
        }}
      >
        {PROGRESS_DESCRIPTIONS[request.status]}
      </Text>
    </GyoumCard>
  );
}

function TimelineCard({ request }: { request: SupportRequestDetail }) {
  const currentIdx = SUPPORT_REQUEST_FLOW.indexOf(request.status);
  const [stepCenters, setStepCenters] = useState<Record<number, number>>({});
  const eventByStatus = useMemo(() => {
    const map = new Map<SupportRequestStatus, string>();
    for (const ev of request.events) {
      if (ev.to_status && !map.has(ev.to_status)) map.set(ev.to_status, ev.created_at);
    }
    return map;
  }, [request.events]);
  const firstCenter = stepCenters[0];
  const progressTargetIndex =
    currentIdx >= 0
      ? Math.min(currentIdx + 1, SUPPORT_REQUEST_FLOW.length - 1)
      : -1;
  const progressTargetCenter =
    progressTargetIndex >= 0 ? stepCenters[progressTargetIndex] : undefined;
  const lastCenter = stepCenters[SUPPORT_REQUEST_FLOW.length - 1];
  const hasBaseRail = firstCenter !== undefined && lastCenter !== undefined;
  const hasProgressRail =
    firstCenter !== undefined &&
    progressTargetCenter !== undefined &&
    progressTargetCenter > firstCenter;

  const handleStepLayout = (index: number, event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    const center = y + height / 2;
    setStepCenters((prev) => {
      if (prev[index] === center) return prev;
      return { ...prev, [index]: center };
    });
  };

  return (
    <View>
      <SectionLabel>진행 이력</SectionLabel>
      <GyoumCard padding={0} style={{ position: 'relative' }}>
        {hasBaseRail ? (
          <View
            style={{
              position: 'absolute',
              left: 31,
              top: firstCenter,
              height: lastCenter - firstCenter,
              width: 3,
              borderRadius: 2,
              backgroundColor: BRAND_TOKENS.border,
            }}
          />
        ) : null}
        {hasProgressRail ? (
          <View
            style={{
              position: 'absolute',
              left: 31,
              top: firstCenter,
              height: progressTargetCenter - firstCenter,
              width: 3,
              borderRadius: 2,
              backgroundColor: BRAND_TOKENS.success,
            }}
          />
        ) : null}
        {SUPPORT_REQUEST_FLOW.map((status, i) => {
          const activeIndex =
            currentIdx >= 0 && currentIdx < SUPPORT_REQUEST_FLOW.length - 1
              ? currentIdx + 1
              : -1;
          const state: 'done' | 'active' | 'pending' =
            i <= currentIdx ? 'done' : i === activeIndex ? 'active' : 'pending';
          return (
            <TimelineStep
              key={status}
              status={status}
              state={state}
              time={formatTime(eventByStatus.get(status) ?? null)}
              onLayout={(event) => handleStepLayout(i, event)}
            />
          );
        })}
      </GyoumCard>
    </View>
  );
}

function TimelineStep({
  status,
  state,
  time,
  onLayout,
}: {
  status: SupportRequestStatus;
  state: 'done' | 'active' | 'pending';
  time: string;
  onLayout: (event: LayoutChangeEvent) => void;
}) {
  const color =
    state === 'done'
      ? BRAND_TOKENS.success
      : state === 'active'
        ? BRAND_TOKENS.brand
        : BRAND_TOKENS.borderStrong;
  return (
    <View
      style={{
        position: 'relative',
        flexDirection: 'row',
        gap: 14,
        paddingHorizontal: 20,
        paddingVertical: 14,
      }}
      onLayout={onLayout}
    >
      <View style={{ alignItems: 'center', position: 'relative' }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: state === 'pending' ? BRAND_TOKENS.surface : color,
            borderWidth: 2,
            borderColor: color,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          {state === 'done' ? <CheckIcon color={BRAND_TOKENS.textOnDark} size={12} /> : null}
          {state === 'active' ? (
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: BRAND_TOKENS.textOnDark,
              }}
            />
          ) : null}
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 15,
              fontWeight: state === 'pending' ? '500' : '700',
              color:
                state === 'pending'
                  ? BRAND_TOKENS.textMuted
                  : state === 'active'
                    ? BRAND_TOKENS.brand
                    : BRAND_TOKENS.text,
            }}
          >
            {SUPPORT_REQUEST_STATUS_LABELS[status]}
          </Text>
          {time ? (
            <Text
              style={{ fontFamily: FONT_FAMILY, fontSize: 12, color: BRAND_TOKENS.textMuted }}
            >
              {time}
            </Text>
          ) : null}
        </View>
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            color: BRAND_TOKENS.textMid,
            marginTop: 2,
            opacity: state === 'pending' ? 0.5 : 1,
          }}
        >
          {SUPPORT_REQUEST_STATUS_GUIDES[status]}
        </Text>
      </View>
    </View>
  );
}

function DetailsCard({ request }: { request: SupportRequestDetail }) {
  const originLine = getLineMeta(request.origin_station_id);
  const destLine = getLineMeta(request.destination_station_id);
  return (
    <View>
      <SectionLabel>요청 정보</SectionLabel>
      <GyoumCard padding={0}>
        <View style={{ padding: 18 }}>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 12,
              color: BRAND_TOKENS.textMuted,
              fontWeight: '600',
              letterSpacing: 0.4,
              marginBottom: 8,
            }}
          >
            지원 유형
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {request.support_types.map((type) => (
              <View
                key={type}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: RADIUS.pill,
                  backgroundColor: BRAND_TOKENS.brandLight,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 13,
                    color: BRAND_TOKENS.brand,
                    fontWeight: '500',
                  }}
                >
                  {SUPPORT_TYPE_LABELS[type]}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <Divider />
        <View style={{ padding: 18 }}>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 12,
              color: BRAND_TOKENS.textMuted,
              fontWeight: '600',
              letterSpacing: 0.4,
              marginBottom: 8,
            }}
          >
            만남 위치
          </Text>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 15,
              color: BRAND_TOKENS.text,
              fontWeight: '500',
            }}
          >
            {MEETING_POINT_LABELS[request.meeting_point]}
          </Text>
          {request.notes ? (
            <View
              style={{
                marginTop: 8,
                padding: 10,
                backgroundColor: BRAND_TOKENS.surfaceAlt,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontFamily: FONT_FAMILY, fontSize: 13, color: BRAND_TOKENS.textMid }}>
                “{request.notes}”
              </Text>
            </View>
          ) : null}
        </View>
        {request.assigned_staff_name ? (
          <>
            <Divider />
            <View style={{ padding: 18 }}>
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 12,
                  color: BRAND_TOKENS.textMuted,
                  fontWeight: '600',
                  letterSpacing: 0.4,
                  marginBottom: 8,
                }}
              >
                담당 역무원
              </Text>
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 15,
                  color: BRAND_TOKENS.text,
                  fontWeight: '500',
                }}
              >
                {request.assigned_staff_name}
              </Text>
            </View>
          </>
        ) : null}
      </GyoumCard>
    </View>
  );
}

// ─── 패신저 GPS 위치 자동 업로드 (단순 폴링) ─────────────
function usePassengerLocationUpload(request: SupportRequestDetail) {
  const { user } = useAuth();
  const { currentLocation } = useCurrentLocation();
  const uploadMutation = useUploadSupportRequestCurrentLocation(request.id);
  const lastUploadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!canPassengerUploadCurrentLocation(request, user)) return;
    if (!currentLocation) return;
    const signature = `${currentLocation.latitude.toFixed(5)},${currentLocation.longitude.toFixed(5)}`;
    if (lastUploadRef.current === signature) return;
    lastUploadRef.current = signature;
    void uploadMutation.mutateAsync({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      accuracy_meters: null,
    });
  }, [currentLocation, request, uploadMutation, user]);
}
