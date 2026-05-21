/**
 * 교움 디자인 시안의 역무원 지원 진행(체크리스트) 화면.
 *
 * 인디고 헤더 카드 + 체크리스트 + 메모 + 모두 체크 시 "승차 완료 처리하기" CTA.
 */
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomBar,
  CheckIcon,
  Divider,
  ErrorView,
  Screen,
  GyoumAppBar,
  GyoumCTA,
  GyoumCard,
  LoadingView,
  PinIcon,
  PulseDot,
  SectionLabel,
} from '@/components/ui';
import { BRAND_TOKENS, FONT_FAMILY } from '@/lib/design-tokens';
import { ApiError } from '@/lib/api/client';
import {
  useSupportRequest,
  useUpdateSupportRequestChecklist,
} from '@/features/support-request/hooks/use-support-requests';
import {
  canStaffManageSupportRequest,
  type SupportRequestChecklistItem,
} from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';

export function StaffActiveScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const requestQuery = useSupportRequest(requestId);
  const checklistMutation = useUpdateSupportRequestChecklist(requestId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (requestQuery.isLoading) return <LoadingView />;
  if (requestQuery.isError || !requestQuery.data) {
    return <ErrorView message={requestQuery.error?.message ?? '요청을 찾을 수 없습니다.'} />;
  }
  const request = requestQuery.data;

  if (!canStaffManageSupportRequest(request, user)) {
    return <ErrorView message="이 요청을 진행할 권한이 없습니다." />;
  }

  const items = request.checklist_items;
  const allDone = items.length > 0 && items.every((item) => item.checked);

  const toggle = async (item: SupportRequestChecklistItem) => {
    setErrorMessage(null);
    const next = items.map((existing) =>
      existing.code === item.code ? { ...existing, checked: !existing.checked } : existing,
    );
    try {
      await checklistMutation.mutateAsync(
        next.map(({ code, label, checked }) => ({ code, label, checked })),
      );
    } catch (error) {
      if (error instanceof ApiError) setErrorMessage(error.message);
      else setErrorMessage('체크리스트 업데이트에 실패했습니다.');
    }
  };

  const checkedCount = items.filter((item) => item.checked).length;
  const remaining = items.length - checkedCount;

  return (
    <Screen background="bg" padded={false} edges={[]}>
      <StatusBar style="dark" />
      <GyoumAppBar
        title="지원 진행 중"
        topInset={insets.top}
        onBack={() => router.back()}
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 140,
          gap: 16,
        }}
      >
        {/* 사용자 헤더 (인디고) */}
        <GyoumCard
          padding={14}
          style={{ backgroundColor: BRAND_TOKENS.brand, borderColor: BRAND_TOKENS.brand }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              marginBottom: 10,
            }}
          >
            <PulseDot color={BRAND_TOKENS.success} />
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 12,
                color: BRAND_TOKENS.onBrand85,
                fontWeight: '600',
              }}
            >
              지원 중
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 20,
                  fontWeight: '700',
                  color: BRAND_TOKENS.onBrand100,
                }}
              >
                {request.passenger_name}
              </Text>
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 12,
                  color: BRAND_TOKENS.onBrand70,
                  marginTop: 2,
                }}
              >
                {request.origin_station_name} → {request.destination_station_name}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: BRAND_TOKENS.onBrand15,
              }}
            >
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 12,
                  color: BRAND_TOKENS.onBrand100,
                  fontWeight: '600',
                }}
              >
                {checkedCount}/{items.length} 단계
              </Text>
            </View>
          </View>
        </GyoumCard>

        {/* 체크리스트 */}
        <SectionLabel>지원 체크리스트</SectionLabel>
        <GyoumCard padding={0}>
          {items.map((item, i) => (
            <View key={item.code}>
              {i > 0 ? <Divider inset={18} /> : null}
              <ChecklistRow
                item={item}
                disabled={checklistMutation.isPending}
                onPress={() => toggle(item)}
              />
            </View>
          ))}
        </GyoumCard>

        {/* 요청 메모 */}
        <SectionLabel>요청 메모</SectionLabel>
        <GyoumCard padding={14}>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 14,
              color: BRAND_TOKENS.textMid,
              lineHeight: 21,
            }}
          >
            {request.notes ? `“${request.notes}”` : '메모가 없습니다.'}
          </Text>
          <View
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: BRAND_TOKENS.border,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <PinIcon color={BRAND_TOKENS.accent} size={14} />
            <Text
              style={{ fontFamily: FONT_FAMILY, fontSize: 13, color: BRAND_TOKENS.textMid }}
            >
              {request.meeting_point}
            </Text>
          </View>
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
        <GyoumCTA
          variant="accent"
          disabled={!allDone}
          onPress={() => router.push(`/(app)/support/boarding/${request.id}`)}
        >
          {allDone
            ? '승차 완료 처리하기'
            : `체크리스트 완료 시 활성화 (${remaining}개 남음)`}
        </GyoumCTA>
      </BottomBar>
    </Screen>
  );
}

function ChecklistRow({
  item,
  onPress,
  disabled,
}: {
  item: SupportRequestChecklistItem;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.checked, disabled }}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          backgroundColor: item.checked ? BRAND_TOKENS.success : 'transparent',
          borderWidth: 2,
          borderColor: item.checked ? BRAND_TOKENS.success : BRAND_TOKENS.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        {item.checked ? <CheckIcon color={BRAND_TOKENS.onBrand100} size={16} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 15,
            fontWeight: '600',
            color: item.checked ? BRAND_TOKENS.textMuted : BRAND_TOKENS.text,
            textDecorationLine: item.checked ? 'line-through' : 'none',
          }}
        >
          {item.label}
        </Text>
      </View>
    </Pressable>
  );
}
