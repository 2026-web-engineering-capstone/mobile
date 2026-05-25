/**
 * 교움 디자인 시안의 탑승 정보 입력 폼.
 *
 * 출발 역 실시간 열차 번호 suggestion + 직접 입력 + 칸 번호 선택 → 승차 확인 처리.
 */
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
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
  cacheSupportRequestInList,
  useAssignSupportRequest,
  useSupportRequest,
  useUpdateSupportRequestStatus,
} from '@/features/support-request/hooks/use-support-requests';
import { useStationArrivals } from '@/features/transit/hooks/use-station-arrivals';
import { canStaffManageSupportRequest } from '@/features/support-request/types';
import type { ArrivalTrain } from '@/features/transit/types';
import { useAuth } from '@/providers/auth-provider';
import { queryKeys } from '@/lib/query/query-keys';

const CAR_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

function normalizeStationName(name: string) {
  return name.replace(/\s+/g, '').replace(/역$/, '');
}

function getTrainDirectionLabel(train: ArrivalTrain) {
  const destination = normalizeStationName(train.destination ?? '');
  const direction = normalizeStationName(train.direction ?? '');

  if (destination) return destination.endsWith('행') ? destination : `${destination}행`;
  if (direction) return `${direction} 방향`;
  return '방향 정보 없음';
}

function getTrainSuggestionKey(train: ArrivalTrain, index: number) {
  return `${train.trainNumber ?? 'unknown'}-${train.destination}-${train.direction}-${index}`;
}

export function StaffBoardingScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const requestQuery = useSupportRequest(requestId);
  const assignMutation = useAssignSupportRequest();
  const statusMutation = useUpdateSupportRequestStatus(requestId);
  const request = requestQuery.data;
  const arrivalsQuery = useStationArrivals(request?.origin_station_name ?? null);
  const [trainNumber, setTrainNumber] = useState('');
  const [customTrain, setCustomTrain] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldReturnToQueueAfterBoarding = Boolean(
    request?.status === 'boarded' && request.assigned_staff_id === user?.id,
  );

  useEffect(() => {
    if (shouldReturnToQueueAfterBoarding) {
      router.replace('/(app)/(tabs)');
    }
  }, [router, shouldReturnToQueueAfterBoarding]);

  const trainSuggestions = useMemo(() => {
    const trains = arrivalsQuery.data?.trains ?? [];
    const seenTrainNumbers = new Set<string>();
    const deduped = trains.filter((train) => {
      const number = train.trainNumber?.trim();
      if (!number || seenTrainNumbers.has(number)) return false;
      seenTrainNumbers.add(number);
      return true;
    });

    return deduped.slice(0, 4);
  }, [arrivalsQuery.data?.trains]);

  if (requestQuery.isLoading) return <LoadingView />;
  if (requestQuery.isError || !requestQuery.data) {
    return <ErrorView message={requestQuery.error?.message ?? '요청을 찾을 수 없습니다.'} />;
  }
  const loadedRequest = requestQuery.data;

  if (shouldReturnToQueueAfterBoarding) {
    return <LoadingView />;
  }

  if (!canStaffManageSupportRequest(loadedRequest, user)) {
    return <ErrorView message="이 요청을 처리할 권한이 없습니다." />;
  }

  const effectiveTrain = trainNumber || customTrain.trim();
  const valid = !!effectiveTrain && !!carNumber;
  const showTrainHelp = !isSubmitting && !effectiveTrain;

  const handleSubmit = async () => {
    if (!valid || isSubmitting) return;
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      if (loadedRequest.status === 'boarded') {
        router.replace('/(app)/(tabs)');
        return;
      }

      if (loadedRequest.status === 'submitted') {
        await assignMutation.mutateAsync(loadedRequest.id);
      }
      if (loadedRequest.status === 'submitted' || loadedRequest.status === 'assigned') {
        await statusMutation.mutateAsync({ status: 'in_progress' });
      }
      await statusMutation.mutateAsync({
        status: 'boarded',
        trainNumber: effectiveTrain,
        trainCarNumber: carNumber,
      });
      router.replace('/(app)/(tabs)');
    } catch (error) {
      if (error instanceof ApiError) setErrorMessage(error.message);
      else setErrorMessage('승차 완료 처리에 실패했습니다.');
      setIsSubmitting(false);
    }
  };

  const handleBackToQueue = () => {
    cacheSupportRequestInList(queryClient, loadedRequest);
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
        title="탑승 정보 입력"
        topInset={insets.top}
        onBack={handleBackToQueue}
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
        <PageTitle sub="확인 후 하차 역 역무원에게 자동으로 전달됩니다.">
          승차할 열차 정보를 확인해주세요
        </PageTitle>

        <SectionLabel>열차 번호</SectionLabel>
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 12,
            color: BRAND_TOKENS.textMuted,
            marginTop: -4,
            marginBottom: 10,
          }}
        >
          {isSubmitting
            ? '하차 역으로 전송하고 있습니다.'
            : arrivalsQuery.isLoading
            ? '실시간 열차 정보를 불러오는 중입니다.'
            : trainSuggestions.length
              ? '탑승 역 실시간 열차 정보에서 열차 번호를 가져왔습니다.'
              : showTrainHelp
                ? '탑승 역에 표시할 실시간 열차 번호가 없습니다. 직접 입력해주세요.'
                : '입력한 열차 번호를 하차 역으로 전송합니다.'}
        </Text>
        {trainSuggestions.length ? (
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
              marginBottom: 10,
            }}
          >
            {trainSuggestions.map((train, index) => {
              const num = train.trainNumber?.trim();
              if (!num) return null;
              const selected = trainNumber === num;
              return (
                <Pressable
                  key={getTrainSuggestionKey(train, index)}
                  onPress={() => {
                    setTrainNumber(num);
                    setCustomTrain('');
                  }}
                  style={{
                    flexBasis: '48%',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: selected ? BRAND_TOKENS.brandLight : BRAND_TOKENS.surface,
                    borderWidth: 2,
                    borderColor: selected ? BRAND_TOKENS.brand : BRAND_TOKENS.border,
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
                  <Text
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 12,
                      color: BRAND_TOKENS.textMid,
                      marginTop: 4,
                    }}
                    numberOfLines={1}
                  >
                    {loadedRequest.origin_station_name} · {getTrainDirectionLabel(train)}
                  </Text>
                  {train.etaMessage ? (
                    <Text
                      style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: 11,
                        color: BRAND_TOKENS.textMuted,
                        marginTop: 2,
                      }}
                      numberOfLines={1}
                    >
                      {train.etaMessage}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
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
                하차 역 역무원과 기관사에게 안전 알림이 자동 발송됩니다.
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
          disabled={!valid || statusMutation.isPending || isSubmitting}
          onPress={handleSubmit}
        >
          {statusMutation.isPending || isSubmitting
            ? '전송 중...'
            : '승차 확인 · 하차 역으로 전송'}
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
