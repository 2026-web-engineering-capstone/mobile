import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMutation } from '@tanstack/react-query';
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
import { createSupportRequest } from '@/features/support-request/api';
import type { SupportRequestDetail } from '@/features/support-request/types';
import { queryClient } from '@/lib/query/query-client';
import { queryKeys } from '@/lib/query/query-keys';

const INCHEON_LINE_STATIONS = [
  { id: 'STN-GY', name: '계양역' },
  { id: 'STN-GH', name: '귤현역' },
  { id: 'STN-BC', name: '박촌역' },
  { id: 'STN-IH', name: '임학역' },
  { id: 'STN-JJ', name: '작전역' },
  { id: 'STN-GS', name: '갈산역' },
  { id: 'STN-JI', name: '지식정보단지역' },
  { id: 'STN-ICU', name: '인천대입구역' },
  { id: 'STN-CP', name: '센트럴파크역' },
  { id: 'STN-IBD', name: '국제업무지구역' },
  { id: 'STN-SD', name: '송도달빛축제공원역' },
  { id: 'STN-HSU', name: '한성대입구역' },
  { id: 'STN-HYE', name: '혜화역' },
  { id: 'STN-SSW', name: '성신여대입구역' },
];

const STATION_ID_BY_NAME = Object.fromEntries(
  INCHEON_LINE_STATIONS.map((station) => [station.name, station.id]),
);

export function RequestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [submittedRequest, setSubmittedRequest] =
    useState<SupportRequestDetail | null>(null);

  const {
    destinationStation,
    meetingPoint,
    notes,
    originStation,
    supportTypes,
    setDestinationStation,
    setMeetingPoint,
    setNotes,
    setOriginStation,
    toggleSupportType,
    reset,
  } = useRequestDraftStore();

  const createRequestMutation = useMutation({
    mutationFn: () =>
      createSupportRequest({
        origin_station_id: STATION_ID_BY_NAME[originStation],
        destination_station_id: STATION_ID_BY_NAME[destinationStation],
        meeting_point: meetingPoint,
        notes,
        support_types: supportTypes,
      }),
    onSuccess: async (request) => {
      setSubmittedRequest(request);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.supportRequests.all,
      });
    },
  });

  const handleSubmit = () => {
    if (!STATION_ID_BY_NAME[originStation] || !STATION_ID_BY_NAME[destinationStation]) {
      return;
    }

    createRequestMutation.mutate();
  };

  const handleNewRequest = () => {
    reset();
    setSubmittedRequest(null);
  };

  if (submittedRequest) {
    return (
      <View className="flex-1 bg-background">
        <StatusBar style="auto" />
        <View
          className="flex-1 items-center justify-center gap-6 px-6"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-tint dark:bg-brand-tint-dark">
            <Text className="text-4xl">✓</Text>
          </View>
          <View className="items-center gap-2">
            <Text className="text-2xl font-bold text-foreground">
              지원 요청이 접수되었습니다
            </Text>
            <Text className="text-center text-sm leading-5 text-default-500">
              {submittedRequest.origin_station_name} →{' '}
              {submittedRequest.destination_station_name}
              {'\n'}역무원이 배정되면 알림으로 안내드릴게요
            </Text>
          </View>
          <View className="w-full gap-3">
            <Button
              size="lg"
              className="rounded-xl bg-brand dark:bg-brand-dark"
              onPress={() =>
                router.push(
                  `/(app)/support/status/${submittedRequest.id}` as never,
                )
              }
            >
              요청 상태 확인
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-xl"
              onPress={handleNewRequest}
            >
              새 요청 작성
            </Button>
          </View>
        </View>
      </View>
    );
  }

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

          {/* 출발역 / 도착역 */}
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
                    {INCHEON_LINE_STATIONS.map((station) => {
                      const isSelected = originStation === station.name;

                      return (
                        <Pressable
                          key={station.id}
                          className={`rounded-full px-4 py-2 ${
                            isSelected
                              ? 'bg-brand dark:bg-brand-dark'
                              : 'bg-default-100'
                          }`}
                          onPress={() => setOriginStation(station.name)}
                        >
                          <Text
                            className={`text-sm ${
                              isSelected
                                ? 'font-semibold text-white'
                                : 'text-default-600'
                            }`}
                          >
                            {station.name.replace('역', '')}
                          </Text>
                        </Pressable>
                      );
                    })}
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
                    {INCHEON_LINE_STATIONS.map((station) => {
                      const isSelected = destinationStation === station.name;

                      return (
                        <Pressable
                          key={station.id}
                          className={`rounded-full px-4 py-2 ${
                            isSelected
                              ? 'bg-brand dark:bg-brand-dark'
                              : 'bg-default-100'
                          }`}
                          onPress={() => setDestinationStation(station.name)}
                        >
                          <Text
                            className={`text-sm ${
                              isSelected
                                ? 'font-semibold text-white'
                                : 'text-default-600'
                            }`}
                          >
                            {station.name.replace('역', '')}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </Card.Body>
          </Card>

          {/* 지원 유형 */}
          <Card className="rounded-2xl">
            <Card.Body className="gap-4 p-4">
              <Text className="text-xs font-semibold tracking-wider text-default-400">
                지원 유형
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(
                  Object.entries(SUPPORT_TYPE_LABELS) as [
                    SupportType,
                    string,
                  ][]
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

          {/* 만남 위치 */}
          <Card className="rounded-2xl">
            <Card.Body className="gap-4 p-4">
              <Text className="text-xs font-semibold tracking-wider text-default-400">
                만남 위치
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {(
                  Object.entries(MEETING_POINT_LABELS) as [
                    MeetingPoint,
                    string,
                  ][]
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

          {/* 메모 */}
          <Card className="rounded-2xl">
            <Card.Body className="gap-3 p-4">
              <Text className="text-xs font-semibold tracking-wider text-default-400">
                추가 메모 (선택)
              </Text>
              <TextInput
                className="min-h-[80px] rounded-xl bg-default-100 px-4 py-3 text-sm text-foreground"
                multiline
                placeholder="예: 전동휠체어 사용, 동행자 1명 있음"
                placeholderTextColor={undefined}
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
            </Card.Body>
          </Card>

          {/* 요약 */}
          <Card className="rounded-2xl border-brand bg-brand-surface dark:border-brand-dark dark:bg-brand-surface-dark">
            <Card.Body className="gap-2 p-4">
              <Text className="text-xs font-semibold tracking-wider text-brand dark:text-brand-dark">
                요청 요약
              </Text>
              <Text className="text-base font-semibold text-foreground">
                {originStation} → {destinationStation}
              </Text>
              <Text className="text-sm text-default-600">
                {supportTypes.map((t) => SUPPORT_TYPE_LABELS[t]).join(', ')} ·{' '}
                {MEETING_POINT_LABELS[meetingPoint]}
              </Text>
              {notes ? (
                <Text className="text-xs text-default-400">
                  메모: {notes}
                </Text>
              ) : null}
              {createRequestMutation.isError ? (
                <Text className="text-xs text-danger">
                  지원 요청 전송에 실패했습니다. 잠시 후 다시 시도해주세요.
                </Text>
              ) : null}
            </Card.Body>
          </Card>
        </View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View
        className="border-t border-default-100 bg-background px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          size="lg"
          className="rounded-xl bg-brand dark:bg-brand-dark"
          isDisabled={
            !originStation ||
            !destinationStation ||
            supportTypes.length === 0 ||
            createRequestMutation.isPending
          }
          onPress={handleSubmit}
        >
          {createRequestMutation.isPending ? '요청 전송 중...' : '지원 요청하기'}
        </Button>
      </View>
    </View>
  );
}
