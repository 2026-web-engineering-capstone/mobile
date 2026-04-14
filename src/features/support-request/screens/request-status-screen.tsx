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
} from '@/features/support-request/store/use-request-draft-store';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getNextProgressStatus,
  useAssignSupportRequest,
  useCancelSupportRequest,
  useMarkSupportRequestUnavailable,
  useSupportRequest,
  useUpdateSupportRequestChecklist,
  useUpdateSupportRequestStatus,
} from '@/features/support-request/hooks/use-support-requests';
import {
  canStaffAssignSupportRequest,
  canStaffManageSupportRequest,
  canStaffViewSupportRequest,
  CANCELLABLE_REQUEST_STATUSES,
  STATUS_CHIP_COLORS,
  SUPPORT_REQUEST_FLOW,
  SUPPORT_REQUEST_STATUS_GUIDES,
  SUPPORT_REQUEST_STATUS_LABELS,
  TERMINAL_REQUEST_STATUSES,
  type SupportRequestStatus,
  type SupportRequestChecklistDraftItem,
  type SupportRequestChecklistItem,
} from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getGuideMessage(status: SupportRequestStatus, requestReason?: string | null) {
  if (requestReason) {
    return requestReason;
  }

  return SUPPORT_REQUEST_STATUS_GUIDES[status];
}

function getErrorMessage() {
  return '요청을 처리하지 못했습니다. 다시 시도해주세요.';
}

function toChecklistDraft(
  items: SupportRequestChecklistItem[],
): SupportRequestChecklistDraftItem[] {
  return items.map((item) => ({
    code: item.code,
    label: item.label,
    checked: item.checked,
  }));
}

function toggleChecklistItem(
  items: SupportRequestChecklistDraftItem[],
  itemCode: string,
): SupportRequestChecklistDraftItem[] {
  return items.map((item) =>
    item.code === itemCode ? { ...item, checked: !item.checked } : item,
  );
}

export function RequestStatusScreen({ requestId }: { requestId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role, user } = useAuth();
  const [trainCarNumberInput, setTrainCarNumberInput] = useState('');
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [unavailableReasonInput, setUnavailableReasonInput] = useState('');
  const [completionNoteInput, setCompletionNoteInput] = useState('');
  const [checklistItems, setChecklistItems] = useState<
    SupportRequestChecklistDraftItem[] | null
  >(null);
  const [isChecklistDirty, setIsChecklistDirty] = useState(false);
  const isChecklistDirtyRef = useRef(false);
  const { data: request, isLoading, error } = useSupportRequest(requestId);
  const cancelMutation = useCancelSupportRequest(requestId);
  const assignMutation = useAssignSupportRequest();
  const updateChecklistMutation = useUpdateSupportRequestChecklist(requestId);
  const updateStatusMutation = useUpdateSupportRequestStatus(requestId);
  const unavailableMutation = useMarkSupportRequestUnavailable(requestId);
  const requestChecklistDraft = useMemo(
    () => (request ? toChecklistDraft(request.checklist_items) : []),
    [request],
  );
  const requestChecklistSignature = JSON.stringify(requestChecklistDraft);
  const visibleChecklistItems = checklistItems ?? requestChecklistDraft;
  const visibleChecklistSignature = JSON.stringify(visibleChecklistItems);
  const hasChecklistChanges =
    checklistItems !== null && visibleChecklistSignature !== requestChecklistSignature;

  useEffect(() => {
    if (!request || isChecklistDirtyRef.current) {
      return;
    }

    setChecklistItems(requestChecklistDraft);
  }, [request, requestChecklistDraft]);

  useEffect(() => {
    isChecklistDirtyRef.current = hasChecklistChanges;

    if (isChecklistDirty !== hasChecklistChanges) {
      setIsChecklistDirty(hasChecklistChanges);
    }
  }, [hasChecklistChanges, isChecklistDirty]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-sm text-default-500">지원 상태를 불러오는 중입니다.</Text>
      </View>
    );
  }

  if (error || !request) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-sm text-danger">
          지원 상태를 불러오지 못했습니다.
        </Text>
      </View>
    );
  }

  const currentIndex = SUPPORT_REQUEST_FLOW.indexOf(request.status);
  const isFlowStatus = currentIndex !== -1;
  const nextStatus = getNextProgressStatus(request.status);
  const isPassenger = role === 'passenger';
  const isPassengerOwner = request.passenger_id === user?.id;
  const canViewRequest =
    (isPassenger && isPassengerOwner) ||
    canStaffViewSupportRequest(request, user);
  const canCancel =
    isPassenger &&
    isPassengerOwner &&
    CANCELLABLE_REQUEST_STATUSES.includes(request.status);
  const canAssign = canStaffAssignSupportRequest(request, user);
  const canManageRequest = canStaffManageSupportRequest(request, user);
  const requiresTrainCarInput =
    nextStatus === 'boarded' && !request.train_car_number;
  const requiresCompletionNote = nextStatus === 'completed';
  const hasValidTrainCarInput = /^\d{1,2}$/.test(trainCarNumberInput.trim());
  const hasValidCancelReason = cancelReasonInput.trim().length > 0;
  const hasValidUnavailableReason = unavailableReasonInput.trim().length > 0;
  const hasValidCompletionNote = completionNoteInput.trim().length > 0;
  const canAdvance =
    canManageRequest &&
    nextStatus !== null &&
    !TERMINAL_REQUEST_STATUSES.includes(request.status);
  const canMarkUnavailable =
    canManageRequest && !TERMINAL_REQUEST_STATUSES.includes(request.status);
  const canEditChecklist = canManageRequest;
  const mutationError =
    cancelMutation.error ??
    assignMutation.error ??
    updateChecklistMutation.error ??
    updateStatusMutation.error ??
    unavailableMutation.error;
  const isMutating =
    cancelMutation.isPending ||
    assignMutation.isPending ||
    updateChecklistMutation.isPending ||
    updateStatusMutation.isPending ||
    unavailableMutation.isPending;

  const currentGuide = request.cancel_reason
    ? `취소 사유: ${request.cancel_reason}`
    : request.unavailable_reason
      ? `지원 불가 사유: ${request.unavailable_reason}`
      : request.completion_note
        ? `완료 메모: ${request.completion_note}`
        : SUPPORT_REQUEST_STATUS_GUIDES[request.status];

  if (!canViewRequest) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  const handleAdvance = () => {
    if (!nextStatus) {
      return;
    }

    if (nextStatus === 'boarded' && !request.train_car_number && !hasValidTrainCarInput) {
      return;
    }

    if (nextStatus === 'completed' && !hasValidCompletionNote) {
      return;
    }

    updateStatusMutation.mutate({
      status: nextStatus,
      trainCarNumber:
        nextStatus === 'boarded'
          ? request.train_car_number ?? trainCarNumberInput.trim()
          : undefined,
      completionNote: nextStatus === 'completed' ? completionNoteInput.trim() : undefined,
    });
  };

  const handleChecklistSave = () => {
    if (!canEditChecklist || !hasChecklistChanges) {
      return;
    }

    updateChecklistMutation.mutate(visibleChecklistItems, {
      onSuccess: () => {
        isChecklistDirtyRef.current = false;
        setIsChecklistDirty(false);
      },
    });
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
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="text-2xl font-bold tracking-tight text-foreground">
                지원 상태
              </Text>
              <Text className="text-xs text-default-400">{request.id}</Text>
            </View>
            <Chip
              variant="soft"
              color={STATUS_CHIP_COLORS[request.status]}
              size="sm"
            >
              {SUPPORT_REQUEST_STATUS_LABELS[request.status]}
            </Chip>
          </View>

          <Card className="rounded-2xl bg-brand-surface dark:bg-brand-surface-dark">
            <Card.Body className="gap-2 p-4">
              <Text className="text-base font-semibold text-foreground">
                {request.origin_station_name} → {request.destination_station_name}
              </Text>
              <Text className="text-sm text-default-500">
                {request.support_types
                  .map((type) => SUPPORT_TYPE_LABELS[type])
                  .join(', ')}{' '}
                · {MEETING_POINT_LABELS[request.meeting_point]}
              </Text>
              <Text className="text-xs text-default-400">
                담당 역무원: {request.assigned_staff_name ?? '미배정'}
              </Text>
            </Card.Body>
          </Card>

          {isFlowStatus ? (
            <View className="gap-0">
              {SUPPORT_REQUEST_FLOW.map((status, index) => {
                const isDone = currentIndex >= index;
                const isCurrent = request.status === status;
                const matchedEvent = request.events.find(
                  (event) => event.to_status === status,
                );
                const time = matchedEvent ? formatTime(matchedEvent.created_at) : null;
                const guide = getGuideMessage(status, matchedEvent?.message ?? null);

                return (
                  <View key={status} className="flex-row">
                    <View className="mr-4 w-6 items-center">
                      <View
                        className={`h-6 w-6 items-center justify-center rounded-full ${
                          isCurrent
                            ? 'bg-brand dark:bg-brand-dark'
                            : isDone
                              ? 'bg-brand-soft dark:bg-brand-soft-dark'
                              : 'border-2 border-default-200 bg-background'
                        }`}
                      >
                        {isDone ? (
                          <Text className="text-xs font-bold text-white">
                            {isCurrent ? '●' : '✓'}
                          </Text>
                        ) : (
                          <Text className="text-[10px] text-default-300">
                            {index + 1}
                          </Text>
                        )}
                      </View>
                      {index < SUPPORT_REQUEST_FLOW.length - 1 ? (
                        <View
                          className={`w-0.5 flex-1 ${isDone ? 'bg-brand-soft dark:bg-brand-soft-dark' : 'bg-default-200'}`}
                          style={{ minHeight: 40 }}
                        />
                      ) : null}
                    </View>

                    <View
                      className={`mb-4 flex-1 rounded-xl px-4 py-3 ${
                        isCurrent ? 'bg-brand-tint dark:bg-brand-tint-dark' : 'bg-default-50'
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text
                          className={`text-sm font-semibold ${
                            isDone ? 'text-foreground' : 'text-default-300'
                          }`}
                        >
                          {SUPPORT_REQUEST_STATUS_LABELS[status]}
                        </Text>
                        {time ? (
                          <Text className="text-xs text-default-400">{time}</Text>
                        ) : null}
                      </View>
                      <Text
                        className={`mt-1 text-xs leading-4 ${
                          isDone ? 'text-default-500' : 'text-default-300'
                        }`}
                      >
                        {guide}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Card className="rounded-2xl border border-default-200 bg-default-50">
              <Card.Body className="gap-2 p-4">
                <Text className="text-sm font-semibold text-foreground">
                  {SUPPORT_REQUEST_STATUS_LABELS[request.status]}
                </Text>
                <Text className="text-sm leading-5 text-default-500">
                  {currentGuide}
                </Text>
              </Card.Body>
            </Card>
          )}

          <Separator />

          {mutationError ? (
            <Card className="rounded-2xl border border-danger/30">
              <Card.Body className="p-4">
                <Text className="text-sm text-danger">
                  {getErrorMessage()}
                </Text>
              </Card.Body>
            </Card>
          ) : null}

          <Card className="rounded-2xl">
            <Card.Body className="gap-2 p-4">
              <Text className="text-sm font-semibold text-foreground">
                다음 안내
              </Text>
              <Text className="text-sm leading-5 text-default-500">
                {currentGuide}
              </Text>
            </Card.Body>
          </Card>

          {request.checklist_items.length > 0 ? (
            <Card className="rounded-2xl">
              <Card.Body className="gap-3 p-4">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1 gap-1">
                    <Text className="text-sm font-semibold text-foreground">
                      지원 체크리스트
                    </Text>
                    <Text className="text-xs leading-4 text-default-400">
                      지원 유형에 맞는 준비 항목을 확인해주세요.
                    </Text>
                  </View>
                  {canEditChecklist ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="rounded-xl"
                      isDisabled={isMutating || !hasChecklistChanges}
                      onPress={handleChecklistSave}
                    >
                      저장
                    </Button>
                  ) : null}
                </View>

                <View className="gap-2">
                  {visibleChecklistItems.map((item) => (
                    <Pressable
                      key={item.code}
                      accessibilityRole={canEditChecklist ? 'checkbox' : undefined}
                      accessibilityState={{ checked: item.checked }}
                      className={`flex-row items-center gap-3 rounded-xl border px-3 py-3 ${
                        item.checked
                          ? 'border-brand-soft bg-brand-tint dark:border-brand-soft-dark dark:bg-brand-tint-dark'
                          : 'border-default-200 bg-default-50'
                      }`}
                      disabled={!canEditChecklist || isMutating}
                      onPress={() => {
                        isChecklistDirtyRef.current = true;
                        setIsChecklistDirty(true);
                        setChecklistItems((current) =>
                          toggleChecklistItem(current ?? requestChecklistDraft, item.code),
                        );
                      }}
                    >
                      <View
                        className={`h-5 w-5 items-center justify-center rounded-full border ${
                          item.checked
                            ? 'border-brand bg-brand dark:border-brand-dark dark:bg-brand-dark'
                            : 'border-default-300 bg-background'
                        }`}
                      >
                        {item.checked ? (
                          <Text className="text-[10px] font-bold text-white">✓</Text>
                        ) : null}
                      </View>
                      <Text
                        className={`flex-1 text-sm ${
                          item.checked
                            ? 'font-medium text-foreground'
                            : 'text-default-600'
                        }`}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Card.Body>
            </Card>
          ) : null}

          {requiresTrainCarInput ? (
            <Card className="rounded-2xl">
              <Card.Body className="gap-3 p-4">
                <Text className="text-sm font-semibold text-foreground">
                  탑승 칸 번호 입력
                </Text>
                <TextInput
                  className="rounded-xl bg-default-100 px-4 py-3 text-sm text-foreground"
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="예: 4"
                  placeholderTextColor={undefined}
                  value={trainCarNumberInput}
                  onChangeText={(value) =>
                    setTrainCarNumberInput(value.replace(/[^0-9]/g, ''))
                  }
                />
              </Card.Body>
            </Card>
          ) : null}

          {requiresCompletionNote && canAdvance ? (
            <Card className="rounded-2xl">
              <Card.Body className="gap-3 p-4">
                <Text className="text-sm font-semibold text-foreground">
                  완료 메모 입력
                </Text>
                <TextInput
                  className="min-h-[96px] rounded-xl bg-default-100 px-4 py-3 text-sm text-foreground"
                  multiline
                  placeholder="지원 완료 내용을 입력해주세요"
                  placeholderTextColor={undefined}
                  textAlignVertical="top"
                  value={completionNoteInput}
                  onChangeText={setCompletionNoteInput}
                />
              </Card.Body>
            </Card>
          ) : null}

          {canMarkUnavailable ? (
            <Card className="rounded-2xl">
              <Card.Body className="gap-3 p-4">
                <Text className="text-sm font-semibold text-foreground">
                  지원 불가 사유
                </Text>
                <TextInput
                  className="min-h-[88px] rounded-xl bg-default-100 px-4 py-3 text-sm text-foreground"
                  multiline
                  placeholder="지원이 어려운 사유를 입력해주세요"
                  placeholderTextColor={undefined}
                  textAlignVertical="top"
                  value={unavailableReasonInput}
                  onChangeText={setUnavailableReasonInput}
                />
              </Card.Body>
            </Card>
          ) : null}

          {canCancel ? (
            <Card className="rounded-2xl">
              <Card.Body className="gap-3 p-4">
                <Text className="text-sm font-semibold text-foreground">
                  취소 사유
                </Text>
                <TextInput
                  className="min-h-[88px] rounded-xl bg-default-100 px-4 py-3 text-sm text-foreground"
                  multiline
                  placeholder="취소 사유를 입력해주세요"
                  placeholderTextColor={undefined}
                  textAlignVertical="top"
                  value={cancelReasonInput}
                  onChangeText={setCancelReasonInput}
                />
              </Card.Body>
            </Card>
          ) : null}
        </View>
      </ScrollView>

      <View
        className="gap-3 border-t border-default-100 bg-background px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {canAssign ? (
          <Button
            size="lg"
            className="rounded-xl bg-brand dark:bg-brand-dark"
            isDisabled={isMutating}
            onPress={() => assignMutation.mutate(request.id)}
          >
            내가 배정받기
          </Button>
        ) : null}

        {canAdvance && nextStatus ? (
          <Button
            size="lg"
            className="rounded-xl bg-brand dark:bg-brand-dark"
            isDisabled={
              isMutating ||
              (requiresTrainCarInput && !hasValidTrainCarInput) ||
              (requiresCompletionNote && !hasValidCompletionNote)
            }
            onPress={handleAdvance}
          >
            다음 단계: {SUPPORT_REQUEST_STATUS_LABELS[nextStatus]}
          </Button>
        ) : null}

        {canMarkUnavailable ? (
          <Button
            size="lg"
            variant="secondary"
            className="rounded-xl"
            isDisabled={isMutating || !hasValidUnavailableReason}
            onPress={() => unavailableMutation.mutate(unavailableReasonInput.trim())}
          >
            지원 불가 처리
          </Button>
        ) : null}

        <View className="flex-row gap-3">
          {canCancel ? (
            <Button
              size="lg"
              variant="danger-soft"
              className="flex-1 rounded-xl"
              isDisabled={isMutating || !hasValidCancelReason}
              onPress={() => cancelMutation.mutate(cancelReasonInput.trim())}
            >
              요청 취소
            </Button>
          ) : null}
          <Button
            size="lg"
            className="rounded-xl bg-brand dark:bg-brand-dark"
            isDisabled={isMutating}
            onPress={() => router.back()}
            style={canCancel ? { flex: 1 } : undefined}
          >
            확인
          </Button>
        </View>
      </View>
    </View>
  );
}
