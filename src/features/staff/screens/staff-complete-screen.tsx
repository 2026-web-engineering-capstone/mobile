/**
 * 교움 디자인 시안의 하차 완료 처리 화면.
 *
 * 하차 확인 + 결과 메모 + 처리 시간 요약 → completed 상태로 전이.
 * 백엔드는 BOARDED → AWAITING_DROPOFF → COMPLETED 전이 규칙이라, 이 화면에서는
 * 먼저 AWAITING_DROPOFF로 보낸 뒤 COMPLETED로 전이한다.
 */
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomBar,
  CheckIcon,
  ErrorView,
  GyoumAppBar,
  GyoumCTA,
  GyoumCard,
  LoadingView,
  PageTitle,
  Screen,
  SectionLabel,
} from '@/components/ui';
import { BRAND_TOKENS, FONT_FAMILY, RADIUS } from '@/lib/design-tokens';
import { parseApiDate } from '@/lib/datetime';
import { ApiError } from '@/lib/api/client';
import {
  useSupportRequest,
  useUpdateSupportRequestStatus,
} from '@/features/support-request/hooks/use-support-requests';
import { canStaffManageSupportRequest } from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';

function formatDuration(startIso: string | null, endIso: string | null) {
  if (!startIso || !endIso) return '-';
  const start = parseApiDate(startIso).getTime();
  const end = parseApiDate(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '-';
  const mins = Math.round((end - start) / 60000);
  return `${mins}분`;
}

export function StaffCompleteScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const requestQuery = useSupportRequest(requestId);
  const statusMutation = useUpdateSupportRequestStatus(requestId);
  const [memo, setMemo] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (requestQuery.isLoading) return <LoadingView />;
  if (requestQuery.isError || !requestQuery.data) {
    return <ErrorView message={requestQuery.error?.message ?? '요청을 찾을 수 없습니다.'} />;
  }
  const request = requestQuery.data;

  if (!isCompleting && !canStaffManageSupportRequest(request, user)) {
    return <ErrorView message="이 요청을 처리할 권한이 없습니다." />;
  }

  const durations = useMemo(() => {
    const findEventAt = (toStatus: string) =>
      request.events.find((ev) => ev.to_status === toStatus)?.created_at ?? null;
    return {
      submittedToAssigned: formatDuration(request.created_at, findEventAt('assigned')),
      assignedToInProgress: formatDuration(findEventAt('assigned'), findEventAt('in_progress')),
      inProgressToBoarded: formatDuration(findEventAt('in_progress'), findEventAt('boarded')),
      boardedToDropoff: formatDuration(findEventAt('boarded'), new Date(nowMs).toISOString()),
      total: formatDuration(request.created_at, new Date(nowMs).toISOString()),
    };
  }, [nowMs, request]);

  const handleComplete = async () => {
    setErrorMessage(null);
    setIsCompleting(true);
    const note = memo.trim() || '하차 지원 완료';
    try {
      // BOARDED 상태라면 먼저 AWAITING_DROPOFF로 전이.
      if (request.status === 'boarded') {
        await statusMutation.mutateAsync({ status: 'awaiting_dropoff' });
      }
      await statusMutation.mutateAsync({
        status: 'completed',
        completionNote: note,
      });
      router.replace('/(app)/(tabs)');
    } catch (error) {
      if (error instanceof ApiError) setErrorMessage(error.message);
      else setErrorMessage('하차 완료 처리에 실패했습니다.');
      setIsCompleting(false);
    }
  };

  return (
    <Screen background="bg" padded={false} edges={[]}>
      <StatusBar style="dark" />
      <GyoumAppBar
        title="하차 완료 처리"
        topInset={insets.top}
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(app)/(tabs)');
          }
        }}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 140,
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <PageTitle sub="도착역 하차 지원 결과를 기록하고 마무리합니다.">
          하차가 완료되었나요?
        </PageTitle>

        <GyoumCard
          padding={16}
          style={{ backgroundColor: BRAND_TOKENS.brandLight, borderColor: BRAND_TOKENS.brand }}
        >
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 12,
              fontWeight: '700',
              color: BRAND_TOKENS.brand,
              marginBottom: 8,
            }}
          >
            하차 처리 대기
          </Text>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 18,
              fontWeight: '700',
              color: BRAND_TOKENS.text,
              marginBottom: 6,
            }}
          >
            {request.passenger_name}
          </Text>
          <Text style={{ fontFamily: FONT_FAMILY, fontSize: 14, color: BRAND_TOKENS.textMid }}>
            {request.origin_station_name} → {request.destination_station_name}
          </Text>
          {request.train_number || request.train_car_number ? (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              {request.train_number ? <InfoPill label="열차" value={request.train_number} /> : null}
              {request.train_car_number ? <InfoPill label="칸" value={request.train_car_number} /> : null}
            </View>
          ) : null}
        </GyoumCard>

        <SectionLabel>하차 처리 확인</SectionLabel>
        <GyoumCard padding={0}>
          <DropoffCheckRow text="인계받은 열차 번호와 칸 번호를 확인했습니다." />
          <DropoffCheckRow text="승객을 확인하고 열차에서 안전하게 내릴 수 있도록 지원했습니다." />
          <DropoffCheckRow text="승강장 이동 동선과 다음 이동 방향을 함께 확인했습니다." last />
        </GyoumCard>

        <SectionLabel>결과 메모 (선택)</SectionLabel>
        <TextInput
          value={memo}
          onChangeText={setMemo}
          placeholder="특이사항이 있다면 기록해주세요"
          placeholderTextColor={BRAND_TOKENS.textMuted}
          multiline
          style={{
            minHeight: 100,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: RADIUS.chip,
            backgroundColor: BRAND_TOKENS.surface,
            borderWidth: 1.5,
            borderColor: BRAND_TOKENS.border,
            fontFamily: FONT_FAMILY,
            fontSize: 15,
            color: BRAND_TOKENS.text,
            textAlignVertical: 'top',
            lineHeight: 22,
          }}
        />

        {/* 처리 시간 요약 */}
        <GyoumCard
          padding={16}
          style={{
            marginTop: 24,
            backgroundColor: BRAND_TOKENS.surfaceAlt,
            borderColor: BRAND_TOKENS.border,
          }}
        >
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 12,
              color: BRAND_TOKENS.textMuted,
              fontWeight: '600',
              marginBottom: 10,
              letterSpacing: 0.4,
            }}
          >
            처리 시간 요약
          </Text>
          <TimeRow label="요청 → 배정" value={durations.submittedToAssigned} />
          <TimeRow label="배정 → 현장 도착" value={durations.assignedToInProgress} />
          <TimeRow label="현장 → 승차" value={durations.inProgressToBoarded} />
          <TimeRow label="승차 완료 → 하차 처리" value={durations.boardedToDropoff} />
          <TimeRow label="총 지원 시간" value={durations.total} bold />
        </GyoumCard>

        {errorMessage ? (
          <View
            style={{
              marginTop: 16,
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
        <GyoumCTA
          variant="success"
          onPress={handleComplete}
          disabled={statusMutation.isPending}
          leadingIcon={<CheckIcon color={BRAND_TOKENS.onBrand100} size={20} />}
        >
          {isCompleting || statusMutation.isPending ? '처리 중...' : '하차 완료 처리'}
        </GyoumCTA>
      </BottomBar>
    </Screen>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        minWidth: 56,
        minHeight: 56,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: RADIUS.pill,
        backgroundColor: BRAND_TOKENS.surface,
        borderWidth: 1,
        borderColor: BRAND_TOKENS.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 11,
          color: BRAND_TOKENS.textMuted,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 14,
          fontWeight: '700',
          color: BRAND_TOKENS.text,
          textAlign: 'center',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function DropoffCheckRow({ text, last }: { text: string; last?: boolean }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: BRAND_TOKENS.border,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: BRAND_TOKENS.success,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CheckIcon color={BRAND_TOKENS.onBrand100} size={13} />
      </View>
      <Text
        style={{
          flex: 1,
          fontFamily: FONT_FAMILY,
          fontSize: 14,
          color: BRAND_TOKENS.text,
          lineHeight: 20,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function TimeRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
      }}
    >
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 13,
          color: bold ? BRAND_TOKENS.text : BRAND_TOKENS.textMid,
          fontWeight: bold ? '700' : '500',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 13,
          fontWeight: bold ? '700' : '600',
          color: bold ? BRAND_TOKENS.brand : BRAND_TOKENS.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
