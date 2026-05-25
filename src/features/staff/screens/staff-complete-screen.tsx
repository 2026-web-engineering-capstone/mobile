/**
 * 교움 디자인 시안의 완료 처리 화면.
 *
 * 안내한 출구 chip + 결과 메모 + 처리 시간 요약 → completed 상태로 전이.
 * 백엔드는 BOARDED → AWAITING_DROPOFF → COMPLETED 전이 규칙이라, 이 화면에서는
 * 먼저 AWAITING_DROPOFF로 보낸 뒤 COMPLETED로 전이한다.
 */
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
import { ApiError } from '@/lib/api/client';
import {
  useSupportRequest,
  useUpdateSupportRequestStatus,
} from '@/features/support-request/hooks/use-support-requests';
import { canStaffManageSupportRequest } from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';

const EXIT_OPTIONS = ['1번', '2번', '3번', '4번', '5번'];

function formatDuration(startIso: string | null, endIso: string | null) {
  if (!startIso || !endIso) return '-';
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
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
  const [exitNum, setExitNum] = useState('4번');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (requestQuery.isLoading) return <LoadingView />;
  if (requestQuery.isError || !requestQuery.data) {
    return <ErrorView message={requestQuery.error?.message ?? '요청을 찾을 수 없습니다.'} />;
  }
  const request = requestQuery.data;

  if (!canStaffManageSupportRequest(request, user)) {
    return <ErrorView message="이 요청을 처리할 권한이 없습니다." />;
  }

  const durations = useMemo(() => {
    const findEventAt = (toStatus: string) =>
      request.events.find((ev) => ev.to_status === toStatus)?.created_at ?? null;
    return {
      submittedToAssigned: formatDuration(request.created_at, findEventAt('assigned')),
      assignedToInProgress: formatDuration(findEventAt('assigned'), findEventAt('in_progress')),
      inProgressToBoarded: formatDuration(findEventAt('in_progress'), findEventAt('boarded')),
      total: formatDuration(request.created_at, new Date().toISOString()),
    };
  }, [request]);

  const handleComplete = async () => {
    setErrorMessage(null);
    const note = [memo.trim(), `${exitNum} 출구 안내`].filter(Boolean).join(' · ');
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
      else setErrorMessage('완료 처리에 실패했습니다.');
    }
  };

  return (
    <Screen background="bg" padded={false} edges={[]}>
      <StatusBar style="dark" />
      <GyoumAppBar
        title="지원 완료 처리"
        topInset={insets.top}
        onBack={() => (router.canGoBack() ? router.back() : router.replace("/(app)/(tabs)"))}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 140,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <PageTitle sub="지원 결과를 기록하고 마무리합니다.">
          지원이 완료되었나요?
        </PageTitle>

        <SectionLabel>안내한 출구</SectionLabel>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          {EXIT_OPTIONS.map((n) => {
            const selected = exitNum === n;
            return (
              <Pressable
                key={n}
                onPress={() => setExitNum(n)}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: RADIUS.chip,
                  backgroundColor: selected ? BRAND_TOKENS.accent : BRAND_TOKENS.surface,
                  borderWidth: 1.5,
                  borderColor: selected ? BRAND_TOKENS.accent : BRAND_TOKENS.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 15,
                    fontWeight: '600',
                    color: selected ? BRAND_TOKENS.onBrand100 : BRAND_TOKENS.text,
                  }}
                >
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </View>

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
          {statusMutation.isPending ? '처리 중...' : '완료 처리'}
        </GyoumCTA>
      </BottomBar>
    </Screen>
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
