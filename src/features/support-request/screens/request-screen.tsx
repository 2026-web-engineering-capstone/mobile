/**
 * 교움 디자인 시안의 승객 지원 요청 4단계 플로우.
 *
 * 단계: stationPick(출발/도착) → supportTypes(다중 선택) → meeting(만남위치+메모) → review(확인).
 * 제출 후 라우터로 `/support/status/[requestId]`로 이동.
 */
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomBar,
  CheckIcon,
  Divider,
  GyoumAppBar,
  GyoumCTA,
  GyoumCard,
  GyoumSearchInput,
  LineBadge,
  PageTitle,
  PinIcon,
  Screen,
  SectionLabel,
  StationChipDS,
  ToggleChip,
  SUPPORT_TYPE_ICONS,
} from '@/components/ui';
import {
  BRAND_TOKENS,
  FONT_FAMILY,
  RADIUS,
  getStationLineMetas,
  getOfficialLineName,
} from '@/lib/design-tokens';
import {
  useCreateSupportRequest,
  useStations,
} from '@/features/support-request/hooks/use-support-requests';
import {
  MEETING_POINT_LABELS,
  MEETING_POINT_ORDER,
  SUPPORT_TYPE_DESCRIPTIONS,
  SUPPORT_TYPE_LABELS,
  SUPPORT_TYPE_ORDER,
  useRequestDraftStore,
  type MeetingPoint,
} from '@/features/support-request/store/use-request-draft-store';
import { ApiError } from '@/lib/api/client';
import type { Station } from '@/lib/api/types';
import { STATION_CATALOG } from '@/features/home/data/station-catalog';
import { useCurrentLocation } from '@/features/home/hooks/use-current-location';
import { findNearestStation } from '@/features/home/lib/find-nearest-station';

type Step = 'stationPick' | 'supportTypes' | 'meeting' | 'review';

function normalizeStationName(name: string) {
  return name.replace(/\s+/g, '').replace(/역$/, '');
}

function normalizeStationLine(line: string) {
  return getOfficialLineName(line).replace(/\s+/g, '');
}

export function RequestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const draft = useRequestDraftStore();
  const createMutation = useCreateSupportRequest();
  const [step, setStep] = useState<Step>('stationPick');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBackOrPrevStep = () => {
    if (step === 'stationPick') {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(app)/(tabs)');
      }
      return;
    }
    if (step === 'supportTypes') setStep('stationPick');
    else if (step === 'meeting') setStep('supportTypes');
    else if (step === 'review') setStep('meeting');
  };

  const onSubmit = async () => {
    if (!draft.originStationId || !draft.destinationStationId) return;
    if (draft.originStationId === draft.destinationStationId) {
      setErrorMessage('출발 역과 도착 역이 같을 수 없습니다.');
      return;
    }
    if (draft.supportTypes.length === 0) {
      setErrorMessage('지원 유형을 1개 이상 선택해주세요.');
      return;
    }
    setErrorMessage(null);
    try {
      const created = await createMutation.mutateAsync({
        origin_station_id: draft.originStationId,
        destination_station_id: draft.destinationStationId,
        meeting_point: draft.meetingPoint,
        notes: draft.notes,
        support_types: draft.supportTypes,
      });
      draft.reset();
      router.replace(`/(app)/support/status/${created.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message || '요청 제출 중 문제가 발생했습니다.');
      } else {
        setErrorMessage('요청 제출 중 문제가 발생했습니다.');
      }
    }
  };

  return (
    <Screen background="bg" padded={false} edges={[]}>
      <StatusBar style="dark" />
      <GyoumAppBar
        title={
          step === 'stationPick'
            ? '역 선택'
            : step === 'supportTypes'
              ? '지원 유형'
              : step === 'meeting'
                ? '만남 위치'
                : '요청 확인'
        }
        topInset={insets.top}
        onBack={handleBackOrPrevStep}
      />
      {step === 'stationPick' ? (
        <StationPickStep
          insets={insets}
          onNext={() => setStep('supportTypes')}
        />
      ) : step === 'supportTypes' ? (
        <SupportTypesStep insets={insets} onNext={() => setStep('meeting')} />
      ) : step === 'meeting' ? (
        <MeetingStep insets={insets} onNext={() => setStep('review')} />
      ) : (
        <ReviewStep
          insets={insets}
          isSubmitting={createMutation.isPending}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
          onEdit={(target) => {
            if (target === 'station') setStep('stationPick');
            else if (target === 'support') setStep('supportTypes');
            else setStep('meeting');
          }}
        />
      )}
    </Screen>
  );
}

// ─── Step 1: 출발/도착 역 선택 ──────────────────────────
function StationPickStep({
  insets,
  onNext,
}: {
  insets: ReturnType<typeof useSafeAreaInsets>;
  onNext: () => void;
}) {
  const {
    originStationId,
    destinationStationId,
    setOriginStationId,
    setDestinationStationId,
  } = useRequestDraftStore();
  const [focus, setFocus] = useState<'depart' | 'arrive'>(
    originStationId ? 'arrive' : 'depart',
  );
  const [query, setQuery] = useState('');
  const [hasEditedOriginManually, setHasEditedOriginManually] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const stationLayouts = useRef<Record<string, { height: number; y: number }>>({});
  const stationListOffsetY = useRef(0);
  const [pendingScrollStationId, setPendingScrollStationId] = useState('');
  const [scrollViewportHeight, setScrollViewportHeight] = useState(0);
  const listTopPadding = 16;
  const bottomActionHeight = 140;
  const selectedCardTopOffsetCards = 1;
  const stationsQuery = useStations(query.trim() || undefined);
  const stations = stationsQuery.data ?? [];
  const allStationsQuery = useStations();
  const allStations = allStationsQuery.data ?? [];
  const { currentLocation } = useCurrentLocation(!hasEditedOriginManually);

  const depart = allStations.find((s) => s.id === originStationId);
  const arrive = allStations.find((s) => s.id === destinationStationId);

  useEffect(() => {
    if (!originStationId && !destinationStationId && focus !== 'depart') {
      setFocus('depart');
    }
  }, [destinationStationId, focus, originStationId]);

  useEffect(() => {
    if (!pendingScrollStationId) return;
    scrollToMeasuredStation(pendingScrollStationId);
  }, [pendingScrollStationId, scrollViewportHeight, stations]);

  useEffect(() => {
    if (
      hasEditedOriginManually ||
      !currentLocation ||
      allStations.length === 0
    ) return;
    const nearest = findNearestStation(currentLocation, STATION_CATALOG);
    if (!nearest) return;
    const nearestName = normalizeStationName(nearest.name);
    const nearestLine = normalizeStationLine(nearest.line.label);
    const station =
      allStations.find(
        (item) =>
          normalizeStationName(item.name) === nearestName &&
          normalizeStationLine(item.line) === nearestLine,
      ) ??
      allStations.find((item) => normalizeStationName(item.name) === nearestName);
    if (!station || station.id === destinationStationId) return;
    if (originStationId === station.id) return;
    if (originStationId && destinationStationId) return;
    setOriginStationId(station.id);
    setFocus('arrive');
  }, [
    allStations,
    currentLocation,
    destinationStationId,
    hasEditedOriginManually,
    originStationId,
    setOriginStationId,
  ]);

  const setStation = (station: Station) => {
    if (station.id === originStationId) {
      setHasEditedOriginManually(true);
      setOriginStationId('');
      setFocus('depart');
      setQuery('');
      return;
    }
    if (station.id === destinationStationId) {
      setDestinationStationId('');
      setFocus('arrive');
      setQuery('');
      return;
    }
    if (focus === 'depart') {
      setHasEditedOriginManually(true);
      setOriginStationId(station.id);
      setFocus('arrive');
    } else {
      setDestinationStationId(station.id);
      if (!originStationId) setFocus('depart');
    }
    setQuery('');
  };

  const swap = () => {
    setOriginStationId(destinationStationId);
    setDestinationStationId(originStationId);
  };

  const scrollToStationCard = (station?: Station) => {
    if (!station) return;
    setQuery('');
    setPendingScrollStationId(station.id);
  };

  const handleSlotPress = (nextFocus: 'depart' | 'arrive', station?: Station) => {
    setFocus(nextFocus);
    scrollToStationCard(station);
  };

  const scrollToMeasuredStation = (stationId: string) => {
    const layout = stationLayouts.current[stationId];
    if (!layout || scrollViewportHeight <= 0) return;
    const selectedTopOffset = layout.height * selectedCardTopOffsetCards + 12;
    const scrollY = stationListOffsetY.current + layout.y - listTopPadding - selectedTopOffset;
    scrollRef.current?.scrollTo({ y: Math.max(0, scrollY), animated: true });
    setPendingScrollStationId('');
  };

  const handleStationLayout = (stationId: string, y: number, height: number) => {
    stationLayouts.current[stationId] = { height, y };
    if (pendingScrollStationId === stationId) {
      scrollToMeasuredStation(stationId);
    }
  };

  const canNext =
    !!originStationId &&
    !!destinationStationId &&
    originStationId !== destinationStationId;

  return (
    <>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 14,
          backgroundColor: BRAND_TOKENS.bg,
          borderBottomWidth: 1,
          borderBottomColor: BRAND_TOKENS.border,
        }}
      >
        <View style={{ position: 'relative', marginBottom: 14 }}>
          <SlotRow
            label="출발"
            station={depart}
            focused={focus === 'depart'}
            onPress={() => handleSlotPress('depart', depart)}
            placeholder="출발 역 선택"
          />
          <View style={{ height: 8 }} />
          <SlotRow
            label="도착"
            station={arrive}
            focused={focus === 'arrive'}
            onPress={() => handleSlotPress('arrive', arrive)}
            placeholder="도착 역 선택"
          />
          <Pressable
            onPress={swap}
            accessibilityRole="button"
            accessibilityLabel="출발 도착 바꾸기"
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              marginTop: -16,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: BRAND_TOKENS.surface,
              borderWidth: 1.5,
              borderColor: BRAND_TOKENS.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: BRAND_TOKENS.textMid, fontSize: 16, fontWeight: '600' }}>
              ⇅
            </Text>
          </Pressable>
        </View>

        <GyoumSearchInput
          value={query}
          onChangeText={setQuery}
          placeholder="역 이름 검색"
          onClear={() => setQuery('')}
        />
      </View>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        onLayout={(event) => setScrollViewportHeight(event.nativeEvent.layout.height)}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: listTopPadding,
          paddingBottom: bottomActionHeight,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <PageTitle sub="출발할 역과 도착할 역을 선택해주세요.">
          어디로 이동하시나요?
        </PageTitle>
        <SectionLabel>
          {query ? `검색 결과 (${stations.length})` : '전체 역'}
        </SectionLabel>
        <View
          style={{ gap: 8 }}
          onLayout={(event) => {
            stationListOffsetY.current = event.nativeEvent.layout.y;
          }}
        >
          {stationsQuery.isLoading ? (
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                color: BRAND_TOKENS.textMuted,
                textAlign: 'center',
                paddingVertical: 24,
              }}
            >
              불러오는 중...
            </Text>
          ) : null}
          {stations.map((s) => {
            const isOrigin = s.id === originStationId;
            const isDestination = s.id === destinationStationId;
            return (
              <View
                key={s.id}
                onLayout={(event) =>
                  handleStationLayout(
                    s.id,
                    event.nativeEvent.layout.y,
                    event.nativeEvent.layout.height,
                  )
                }
              >
                <StationChipDS
                  station={s}
                  selected={isOrigin || isDestination}
                  label={
                    isOrigin
                      ? '출발역'
                      : isDestination
                        ? '도착역'
                        : undefined
                  }
                  onPress={() => setStation(s)}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>

      <BottomBar style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <GyoumCTA variant="primary" disabled={!canNext} onPress={onNext}>
          다음
        </GyoumCTA>
      </BottomBar>
    </>
  );
}

function SlotRow({
  label,
  station,
  focused,
  onPress,
  placeholder,
}: {
  label: string;
  station?: Station;
  focused: boolean;
  onPress: () => void;
  placeholder: string;
}) {
  const lineMeta = station ? getStationLineMetas(station.line, station.id)[0] : null;
  const lineName = station ? getOfficialLineName(station.line) : '';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label} 역 선택`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: RADIUS.chip,
        backgroundColor: focused ? BRAND_TOKENS.brandLight : BRAND_TOKENS.surface,
        borderWidth: 2,
        borderColor: focused ? BRAND_TOKENS.brand : BRAND_TOKENS.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: label === '출발' ? BRAND_TOKENS.brand : BRAND_TOKENS.accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: BRAND_TOKENS.textOnDark,
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            fontWeight: '700',
          }}
        >
          {label}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        {station && lineMeta ? (
          <>
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 16,
                fontWeight: '600',
                color: BRAND_TOKENS.text,
              }}
            >
              {station.name}
            </Text>
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 12,
                color: BRAND_TOKENS.textMuted,
              }}
            >
              {lineName}
            </Text>
          </>
        ) : (
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 15,
              color: BRAND_TOKENS.textMuted,
            }}
          >
            {placeholder}
          </Text>
        )}
      </View>
      {station && lineMeta ? (
        <LineBadge char={lineMeta.char} color={lineMeta.color} size={24} />
      ) : null}
    </Pressable>
  );
}

// ─── Step 2: 지원 유형 ──────────────────────────────────
function SupportTypesStep({
  insets,
  onNext,
}: {
  insets: ReturnType<typeof useSafeAreaInsets>;
  onNext: () => void;
}) {
  const { supportTypes, toggleSupportType } = useRequestDraftStore();
  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 140,
        }}
      >
        <PageTitle sub="필요한 지원을 모두 선택해주세요. (다중 선택 가능)">
          어떤 지원이 필요하신가요?
        </PageTitle>
        <View style={{ gap: 10 }}>
          {SUPPORT_TYPE_ORDER.map((type) => {
            const Icon = SUPPORT_TYPE_ICONS[type];
            const selected = supportTypes.includes(type);
            return (
              <ToggleChip
                key={type}
                icon={<Icon color={selected ? BRAND_TOKENS.textOnDark : BRAND_TOKENS.text} size={22} />}
                label={SUPPORT_TYPE_LABELS[type]}
                sub={SUPPORT_TYPE_DESCRIPTIONS[type]}
                selected={selected}
                onPress={() => toggleSupportType(type)}
              />
            );
          })}
        </View>
      </ScrollView>
      <BottomBar style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <GyoumCTA
          variant="primary"
          disabled={supportTypes.length === 0}
          onPress={onNext}
        >
          {supportTypes.length > 0 ? `${supportTypes.length}개 선택 · 다음` : '다음'}
        </GyoumCTA>
      </BottomBar>
    </>
  );
}

// ─── Step 3: 만남 위치 + 메모 ──────────────────────────
function MeetingStep({
  insets,
  onNext,
}: {
  insets: ReturnType<typeof useSafeAreaInsets>;
  onNext: () => void;
}) {
  const { meetingPoint, notes, setMeetingPoint, setNotes } = useRequestDraftStore();
  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 140,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <PageTitle sub="역무원이 찾기 쉬운 위치를 선택해주세요.">
          어디서 만날까요?
        </PageTitle>
        <SectionLabel>역 내 위치</SectionLabel>
        <View style={{ gap: 8 }}>
          {MEETING_POINT_ORDER.map((point) => (
            <MeetingRow
              key={point}
              point={point}
              selected={meetingPoint === point}
              onPress={() => setMeetingPoint(point)}
            />
          ))}
        </View>
        <View style={{ marginTop: 24 }}>
          <SectionLabel>추가 메모 (선택)</SectionLabel>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="예: 빨간 패딩에 휠체어를 이용하고 있어요"
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
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 12,
              color: BRAND_TOKENS.textMuted,
              marginTop: 8,
            }}
          >
            인상착의나 동행자 정보가 있으면 역무원이 더 빨리 찾을 수 있어요.
          </Text>
        </View>
      </ScrollView>
      <BottomBar style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <GyoumCTA variant="primary" disabled={!meetingPoint} onPress={onNext}>
          다음
        </GyoumCTA>
      </BottomBar>
    </>
  );
}

function MeetingRow({
  point,
  selected,
  onPress,
}: {
  point: MeetingPoint;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={MEETING_POINT_LABELS[point]}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: RADIUS.chip,
        backgroundColor: selected ? BRAND_TOKENS.brandLight : BRAND_TOKENS.surface,
        borderWidth: 1.5,
        borderColor: selected ? BRAND_TOKENS.brand : BRAND_TOKENS.border,
      }}
    >
      <PinIcon color={selected ? BRAND_TOKENS.brand : BRAND_TOKENS.textMuted} size={20} />
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 15,
          fontWeight: selected ? '600' : '500',
          color: BRAND_TOKENS.text,
          flex: 1,
        }}
      >
        {MEETING_POINT_LABELS[point]}
      </Text>
      {selected ? <CheckIcon color={BRAND_TOKENS.brand} size={20} /> : null}
    </Pressable>
  );
}

// ─── Step 4: 확인 ──────────────────────────────────────
function ReviewStep({
  insets,
  isSubmitting,
  errorMessage,
  onSubmit,
  onEdit,
}: {
  insets: ReturnType<typeof useSafeAreaInsets>;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: () => void;
  onEdit: (target: 'station' | 'support' | 'meeting') => void;
}) {
  const draft = useRequestDraftStore();
  const stationsQuery = useStations();
  const stations = stationsQuery.data ?? [];
  const depart = stations.find((s) => s.id === draft.originStationId);
  const arrive = stations.find((s) => s.id === draft.destinationStationId);

  if (!depart || !arrive) {
    return (
      <View style={{ padding: 24 }}>
        <Text style={{ fontFamily: FONT_FAMILY, color: BRAND_TOKENS.textMuted }}>
          역 정보를 불러오는 중...
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 140,
        }}
      >
        <PageTitle sub="아래 내용으로 출발 역 역무원에게 전달됩니다.">
          요청 내용을 확인해주세요
        </PageTitle>

        <GyoumCard padding={0} style={{ marginBottom: 12, overflow: 'hidden' }}>
          <ReviewRow label="경로" onEdit={() => onEdit('station')}>
            <View style={{ gap: 10 }}>
              <RouteEnd type="출발" station={depart} />
              <View
                style={{
                  height: 18,
                  width: 2,
                  marginLeft: 13,
                  backgroundColor: BRAND_TOKENS.borderStrong,
                }}
              />
              <RouteEnd type="도착" station={arrive} />
            </View>
          </ReviewRow>
        </GyoumCard>

        <GyoumCard padding={0}>
          <ReviewRow label="지원 유형" onEdit={() => onEdit('support')}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {draft.supportTypes.map((type) => (
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
          </ReviewRow>
          <Divider />
          <ReviewRow label="만남 위치" onEdit={() => onEdit('meeting')}>
            <View>
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 15,
                  color: BRAND_TOKENS.text,
                  fontWeight: '500',
                }}
              >
                {MEETING_POINT_LABELS[draft.meetingPoint]}
              </Text>
              {draft.notes ? (
                <View
                  style={{
                    marginTop: 6,
                    padding: 10,
                    backgroundColor: BRAND_TOKENS.surfaceAlt,
                    borderRadius: RADIUS.xs,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 13,
                      color: BRAND_TOKENS.textMid,
                    }}
                  >
                    “{draft.notes}”
                  </Text>
                </View>
              ) : null}
            </View>
          </ReviewRow>
        </GyoumCard>

        <View
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: RADIUS.chip,
            backgroundColor: BRAND_TOKENS.warningBg,
            borderWidth: 1,
            borderColor: BRAND_TOKENS.warning + '40',
          }}
        >
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 13,
              fontWeight: '600',
              color: BRAND_TOKENS.warning,
              marginBottom: 4,
            }}
          >
            요청 전 안내
          </Text>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 13,
              color: BRAND_TOKENS.textMid,
              lineHeight: 19,
            }}
          >
            요청을 제출하면 출발 역 역무원이 즉시 알림을 받습니다. 만남 위치에서 5분 이내에 만나뵐 수 있어요.
          </Text>
        </View>

        {errorMessage ? (
          <View
            style={{
              marginTop: 16,
              padding: 14,
              borderRadius: RADIUS.chip,
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
        <GyoumCTA variant="accent" disabled={isSubmitting} onPress={onSubmit}>
          {isSubmitting ? '요청 보내는 중...' : '교통지원 요청하기'}
        </GyoumCTA>
      </BottomBar>
    </>
  );
}

function ReviewRow({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={{ padding: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 12,
            color: BRAND_TOKENS.textMuted,
            fontWeight: '600',
            letterSpacing: 0.4,
          }}
        >
          {label.toUpperCase()}
        </Text>
        {onEdit ? (
          <Pressable onPress={onEdit} hitSlop={8} accessibilityRole="button">
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 13,
                color: BRAND_TOKENS.brand,
                fontWeight: '600',
              }}
            >
              수정
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function RouteEnd({ type, station }: { type: '출발' | '도착'; station: Station }) {
  const lineMeta = getStationLineMetas(station.line, station.id)[0];
  const lineName = getOfficialLineName(station.line);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: type === '출발' ? BRAND_TOKENS.brand : BRAND_TOKENS.accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{ color: BRAND_TOKENS.textOnDark, fontSize: 11, fontWeight: '700', fontFamily: FONT_FAMILY }}
        >
          {type}
        </Text>
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
          {station.name}
        </Text>
        <Text
          style={{ fontFamily: FONT_FAMILY, fontSize: 12, color: BRAND_TOKENS.textMuted }}
        >
          {lineName}
        </Text>
      </View>
      <LineBadge char={lineMeta.char} color={lineMeta.color} size={22} />
    </View>
  );
}
