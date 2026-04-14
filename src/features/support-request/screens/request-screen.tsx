import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'heroui-native/button';
import { Card } from 'heroui-native/card';
import { Chip } from 'heroui-native/chip';
import { Separator } from 'heroui-native/separator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MEETING_POINT_LABELS,
  SUPPORT_TYPE_LABELS,
  useRequestDraftStore,
} from '@/features/support-request/store/use-request-draft-store';
import type {
  MeetingPoint,
  SupportType,
} from '@/features/support-request/store/use-request-draft-store';
import {
  useCreateSupportRequest,
  useStations,
} from '@/features/support-request/hooks/use-support-requests';
import { useAuth } from '@/providers/auth-provider';

function getErrorMessage() {
  return '요청을 처리하지 못했습니다. 다시 시도해주세요.';
}

export function RequestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role } = useAuth();
  const {
    data: stations = [],
    error: stationsError,
    isLoading: isStationsLoading,
  } = useStations();
  const createRequestMutation = useCreateSupportRequest();
  const {
    destinationStationId,
    meetingPoint,
    notes,
    originStationId,
    supportTypes,
    setDestinationStationId,
    setMeetingPoint,
    setNotes,
    setOriginStationId,
    toggleSupportType,
    reset,
  } = useRequestDraftStore();

  const hasStations = stations.length > 0;
  const selectedOriginStation = stations.find((station) => station.id === originStationId);
  const selectedDestinationStation = stations.find(
    (station) => station.id === destinationStationId,
  );
  const originStation = selectedOriginStation?.name ?? '출발역 선택';
  const destinationStation = selectedDestinationStation?.name ?? '도착역 선택';
  const hasValidStationSelection = Boolean(
    selectedOriginStation && selectedDestinationStation,
  );
  const isSubmitDisabled =
    !hasStations ||
    !hasValidStationSelection ||
    originStationId === destinationStationId ||
    supportTypes.length === 0 ||
    createRequestMutation.isPending;

  if (role !== 'passenger') {
    return <Redirect href="/(app)/(tabs)" />;
  }

  const handleSubmit = () => {
    if (!hasValidStationSelection || supportTypes.length === 0) {
      return;
    }

    if (originStationId === destinationStationId) {
      return;
    }

    createRequestMutation.mutate(
      {
        origin_station_id: originStationId,
        destination_station_id: destinationStationId,
        meeting_point: meetingPoint,
        notes: notes.trim(),
        support_types: supportTypes,
      },
      {
        onSuccess: (created) => {
          reset();
          router.replace(`/(app)/support/status/${created.id}`);
        },
      },
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
        }}
      >
        <View className="gap-6 px-5">
          <View className="gap-1">
            <Text className="text-2xl font-bold tracking-tight text-foreground">
              지원 요청
            </Text>
            <Text className="text-sm text-default-400">
              출발역과 도착역을 선택하고 필요한 지원을 알려주세요
            </Text>
          </View>

          {isStationsLoading ? (
            <Card className="rounded-2xl border border-default-200">
              <Card.Body className="p-4">
                <Text className="text-sm text-default-500">
                  역 목록을 불러오는 중입니다.
                </Text>
              </Card.Body>
            </Card>
          ) : null}

          {stationsError ? (
            <Card className="rounded-2xl border border-warning/30">
              <Card.Body className="p-4">
                <Text className="text-sm text-warning">
                  역 목록을 불러오지 못해 요청 제출이 잠시 비활성화되었습니다.
                </Text>
              </Card.Body>
            </Card>
          ) : null}

          {!isStationsLoading && !stationsError && !hasStations ? (
            <Card className="rounded-2xl border border-warning/30">
              <Card.Body className="p-4">
                <Text className="text-sm text-warning">
                  현재 선택 가능한 역 정보가 없어 요청을 진행할 수 없습니다.
                </Text>
              </Card.Body>
            </Card>
          ) : null}

          {createRequestMutation.error ? (
            <Card className="rounded-2xl border border-danger/30">
              <Card.Body className="p-4">
                <Text className="text-sm text-danger">
                  {getErrorMessage()}
                </Text>
              </Card.Body>
            </Card>
          ) : null}

          <Card className="rounded-2xl">
            <Card.Body className="gap-4 p-4">
              <Text className="text-xs font-semibold tracking-wider text-default-400">
                경로
              </Text>
              <View className="gap-3">
                <View className="gap-1.5">
                  <Text className="text-xs font-medium text-default-500">
                    출발역
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="-mx-1"
                    contentContainerClassName="gap-2 px-1"
                  >
                    {stations.map((station) => (
                      <Chip
                        key={`origin-${station.id}`}
                        variant={originStationId === station.id ? 'primary' : 'soft'}
                        className={
                          originStationId === station.id
                            ? 'bg-brand dark:bg-brand-dark'
                            : ''
                        }
                        onPress={() => setOriginStationId(station.id)}
                      >
                        {station.name.replace('역', '')}
                      </Chip>
                    ))}
                  </ScrollView>
                </View>
                <Separator />
                <View className="gap-1.5">
                  <Text className="text-xs font-medium text-default-500">
                    도착역
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="-mx-1"
                    contentContainerClassName="gap-2 px-1"
                  >
                    {stations.map((station) => (
                      <Chip
                        key={`destination-${station.id}`}
                        variant={destinationStationId === station.id ? 'primary' : 'soft'}
                        className={
                          destinationStationId === station.id
                            ? 'bg-brand dark:bg-brand-dark'
                            : ''
                        }
                        onPress={() => setDestinationStationId(station.id)}
                      >
                        {station.name.replace('역', '')}
                      </Chip>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Card.Body>
          </Card>

          <Card className="rounded-2xl">
            <Card.Body className="gap-4 p-4">
              <Text className="text-xs font-semibold tracking-wider text-default-400">
                지원 유형
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(
                  Object.entries(SUPPORT_TYPE_LABELS) as [SupportType, string][]
                ).map(([key, label]) => {
                  const selected = supportTypes.includes(key);
                  return (
                    <Chip
                      key={key}
                      variant={selected ? 'primary' : 'soft'}
                      className={selected ? 'bg-brand dark:bg-brand-dark' : ''}
                      onPress={() => toggleSupportType(key)}
                    >
                      {label}
                    </Chip>
                  );
                })}
              </View>
            </Card.Body>
          </Card>

          <Card className="rounded-2xl">
            <Card.Body className="gap-4 p-4">
              <Text className="text-xs font-semibold tracking-wider text-default-400">
                만남 위치
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(
                  Object.entries(MEETING_POINT_LABELS) as [MeetingPoint, string][]
                ).map(([key, label]) => {
                  const selected = meetingPoint === key;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setMeetingPoint(key)}
                      className={`rounded-full border px-4 py-2 ${selected ? 'border-brand bg-brand-tint dark:border-brand-dark dark:bg-brand-tint-dark' : 'border-default-200 bg-background'}`}
                    >
                      <Text
                        className={`text-sm ${selected ? 'font-semibold text-brand dark:text-brand-dark' : 'text-default-600'}`}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card.Body>
          </Card>

          <Card className="rounded-2xl">
            <Card.Body className="gap-3 p-4">
              <Text className="text-xs font-semibold tracking-wider text-default-400">
                추가 메모 (선택)
              </Text>
              <TextInput
                className="min-h-[80px] rounded-xl bg-default-100 px-4 py-3 text-sm text-foreground"
                multiline
                maxLength={200}
                placeholder="예: 전동휠체어 사용, 동행자 1명 있음"
                placeholderTextColor={undefined}
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
              <Text className="text-right text-xs text-default-300">
                {notes.length}/200
              </Text>
            </Card.Body>
          </Card>

          <Card className="rounded-2xl border-brand bg-brand-surface dark:border-brand-dark dark:bg-brand-surface-dark">
            <Card.Body className="gap-2 p-4">
              <Text className="text-xs font-semibold tracking-wider text-brand dark:text-brand-dark">
                요청 요약
              </Text>
              <Text className="text-base font-semibold text-foreground">
                {originStation} → {destinationStation}
              </Text>
              <Text className="text-sm text-default-600">
                {supportTypes.map((type) => SUPPORT_TYPE_LABELS[type]).join(', ')} ·{' '}
                {MEETING_POINT_LABELS[meetingPoint]}
              </Text>
              {notes ? (
                <Text className="text-xs text-default-400">메모: {notes}</Text>
              ) : null}
            </Card.Body>
          </Card>
        </View>
      </ScrollView>

      <View
        className="border-t border-default-100 bg-background px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          size="lg"
          className="rounded-xl bg-brand dark:bg-brand-dark"
          isDisabled={isSubmitDisabled}
          onPress={handleSubmit}
        >
          지원 요청하기
        </Button>
      </View>
    </View>
  );
}
