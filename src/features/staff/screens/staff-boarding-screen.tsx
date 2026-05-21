/**
 * 교움 디자인 시안의 승차 완료 폼.
 *
 * 열차 번호 suggestion(4개) + 직접 입력 + 칸 번호(1~8) 선택 → 승차 완료 처리.
 */
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomBar,
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

const TRAIN_SUGGESTIONS = ['1146', '1140', '1142', '1148'];
const CAR_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

export function StaffBoardingScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const requestQuery = useSupportRequest(requestId);
  const statusMutation = useUpdateSupportRequestStatus(requestId);
  const [trainNumber, setTrainNumber] = useState('');
  const [customTrain, setCustomTrain] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (requestQuery.isLoading) return <LoadingView />;
  if (requestQuery.isError || !requestQuery.data) {
    return <ErrorView message={requestQuery.error?.message ?? '요청을 찾을 수 없습니다.'} />;
  }
  const request = requestQuery.data;

  if (!canStaffManageSupportRequest(request, user)) {
    return <ErrorView message="이 요청을 처리할 권한이 없습니다." />;
  }

  const effectiveTrain = trainNumber || customTrain.trim();
  const valid = !!effectiveTrain && !!carNumber;

  const handleSubmit = async () => {
    if (!valid) return;
    setErrorMessage(null);
    try {
      await statusMutation.mutateAsync({
        status: 'boarded',
        trainNumber: effectiveTrain,
        trainCarNumber: carNumber,
      });
      router.replace(`/(app)/support/complete/${request.id}`);
    } catch (error) {
      if (error instanceof ApiError) setErrorMessage(error.message);
      else setErrorMessage('승차 완료 처리에 실패했습니다.');
    }
  };

  return (
    <Screen background="bg" padded={false} edges={[]}>
      <StatusBar style="dark" />
      <GyoumAppBar
        title="승차 완료"
        topInset={insets.top}
        onBack={() => router.back()}
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
        <PageTitle sub="하차 역 역무원에게 자동으로 전달됩니다.">
          탑승 정보를 입력해주세요
        </PageTitle>

        <SectionLabel>열차 번호</SectionLabel>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 10,
          }}
        >
          {TRAIN_SUGGESTIONS.map((num) => {
            const selected = trainNumber === num;
            return (
              <Pressable
                key={num}
                onPress={() => {
                  setTrainNumber(num);
                  setCustomTrain('');
                }}
                style={{
                  flexBasis: '48%',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: selected ? BRAND_TOKENS.brandLight : BRAND_TOKENS.surface,
                  borderWidth: 2,
                  borderColor: selected ? BRAND_TOKENS.brand : BRAND_TOKENS.border,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 16,
                    fontWeight: '600',
                    color: BRAND_TOKENS.text,
                  }}
                >
                  {num}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          value={customTrain}
          onChangeText={(text) => {
            setCustomTrain(text);
            setTrainNumber('');
          }}
          placeholder="직접 입력"
          placeholderTextColor={BRAND_TOKENS.textMuted}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: customTrain ? BRAND_TOKENS.brand : BRAND_TOKENS.border,
            backgroundColor: customTrain ? BRAND_TOKENS.brandLight : BRAND_TOKENS.surface,
            fontFamily: FONT_FAMILY,
            fontSize: 16,
            color: BRAND_TOKENS.text,
            marginBottom: 24,
          }}
        />

        <SectionLabel>열차 칸 번호</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CAR_NUMBERS.map((n) => {
            const label = `${n}번`;
            const selected = carNumber === label;
            return (
              <Pressable
                key={n}
                onPress={() => setCarNumber(label)}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: RADIUS.chip,
                  backgroundColor: selected ? BRAND_TOKENS.brand : BRAND_TOKENS.surface,
                  borderWidth: 1.5,
                  borderColor: selected ? BRAND_TOKENS.brand : BRAND_TOKENS.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 18,
                    fontWeight: '700',
                    color: selected ? BRAND_TOKENS.onBrand100 : BRAND_TOKENS.text,
                  }}
                >
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 미리보기 */}
        {valid ? (
          <GyoumCard
            padding={14}
            style={{
              marginTop: 24,
              backgroundColor: BRAND_TOKENS.brandLight,
              borderColor: BRAND_TOKENS.brand,
            }}
          >
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 11,
                color: BRAND_TOKENS.brand,
                fontWeight: '700',
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              하차 역으로 전송될 정보
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <PreviewCell label="열차" value={effectiveTrain} />
              <PreviewCell label="칸" value={carNumber} />
            </View>
            <View
              style={{
                marginTop: 12,
                padding: 12,
                backgroundColor: 'rgba(44,95,207,0.08)',
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 12,
                  color: BRAND_TOKENS.brand,
                  fontWeight: '500',
                }}
              >
                ✓ 하차 역 역무원과 기관사에게 안전 알림이 자동 발송됩니다.
              </Text>
            </View>
          </GyoumCard>
        ) : null}

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
          variant="accent"
          disabled={!valid || statusMutation.isPending}
          onPress={handleSubmit}
        >
          {statusMutation.isPending ? '전송 중...' : '승차 완료 · 하차 역으로 전송'}
        </GyoumCTA>
      </BottomBar>
    </Screen>
  );
}

function PreviewCell({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: BRAND_TOKENS.surface,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
      }}
    >
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 10,
          color: BRAND_TOKENS.textMuted,
          marginBottom: 2,
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
        }}
      >
        {value}
      </Text>
    </View>
  );
}
