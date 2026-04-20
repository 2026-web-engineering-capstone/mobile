import { ScrollView, Text, View } from 'react-native';
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
import { useSupportRequest } from '@/features/support-request/hooks/use-support-requests';
import {
  canStaffManageSupportRequest,
  canStaffViewSupportRequest,
  getCancelReasonLabel,
  getUnavailableReasonLabel,
  STATUS_CHIP_COLORS,
  SUPPORT_REQUEST_STATUS_GUIDES,
  SUPPORT_REQUEST_STATUS_LABELS,
  TERMINAL_REQUEST_STATUSES,
} from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between py-2">
      <Text className="text-sm text-default-400">{label}</Text>
      <Text className="max-w-[60%] text-right text-sm font-medium text-foreground">
        {value}
      </Text>
    </View>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RequestDetailScreen({ requestId }: { requestId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role, user } = useAuth();
  const { data: request, isLoading, error } = useSupportRequest(requestId);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-sm text-default-500">요청 정보를 불러오는 중입니다.</Text>
      </View>
    );
  }

  if (error || !request) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-center text-sm text-danger">
          요청 정보를 불러오지 못했습니다.
        </Text>
      </View>
    );
  }

  const canSeeStatusTimeline = role === 'passenger';
  const canOpenStaffStatus =
    role === 'staff' && !TERMINAL_REQUEST_STATUSES.includes(request.status);
  const canManageRequest = canStaffManageSupportRequest(request, user);
  const canViewRequest =
    (role === 'passenger' && request.passenger_id === user?.id) ||
    canStaffViewSupportRequest(request, user);
  const cancelReasonLabel = getCancelReasonLabel(request.cancel_reason);
  const unavailableReasonLabel = getUnavailableReasonLabel(request.unavailable_reason);
  const currentGuide = cancelReasonLabel
    ? `취소 사유: ${cancelReasonLabel}`
    : unavailableReasonLabel
      ? `지원 불가 사유: ${unavailableReasonLabel}`
      : request.completion_note
        ? `완료 메모: ${request.completion_note}`
        : SUPPORT_REQUEST_STATUS_GUIDES[request.status];

  if (!canViewRequest) {
    return <Redirect href="/(app)/(tabs)" />;
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
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="text-2xl font-bold tracking-tight text-foreground">
                요청 상세
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
            <Card.Body className="items-center gap-2 p-5">
              <Text className="text-lg font-bold text-brand dark:text-brand-dark">
                {request.origin_station_name}
              </Text>
              <Text className="text-default-400">↓</Text>
              <Text className="text-lg font-bold text-brand dark:text-brand-dark">
                {request.destination_station_name}
              </Text>
            </Card.Body>
          </Card>

          <Card className="rounded-2xl">
            <Card.Body className="p-4">
              <Text className="mb-2 text-xs font-semibold tracking-wider text-default-400">
                요청 정보
              </Text>
              <InfoRow
                label="지원 유형"
                value={request.support_types
                  .map((type) => SUPPORT_TYPE_LABELS[type])
                  .join(', ')}
              />
              <Separator />
              <InfoRow
                label="만남 위치"
                value={MEETING_POINT_LABELS[request.meeting_point]}
              />
              <Separator />
              <InfoRow label="요청자" value={request.passenger_name} />
              <Separator />
              <InfoRow
                label="담당 역무원"
                value={request.assigned_staff_name ?? '미배정'}
              />
              <Separator />
              <InfoRow label="요청 시간" value={formatDateTime(request.created_at)} />
              {request.train_car_number ? (
                <>
                  <Separator />
                  <InfoRow label="탑승 칸" value={`${request.train_car_number}번 칸`} />
                </>
              ) : null}
              {request.notes ? (
                <>
                  <Separator />
                  <InfoRow label="메모" value={request.notes} />
                </>
              ) : null}
            </Card.Body>
          </Card>

          <Card className="rounded-2xl border border-brand/20 dark:border-brand-dark/20">
            <Card.Body className="gap-2 p-4">
              <Text className="text-sm font-semibold text-brand dark:text-brand-dark">
                현재 안내
              </Text>
              <Text className="text-sm leading-5 text-default-600">{currentGuide}</Text>
            </Card.Body>
          </Card>
        </View>
      </ScrollView>

      <View
        className="flex-row gap-3 border-t border-default-100 bg-background px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          size="lg"
          variant="outline"
          className="flex-1 rounded-xl"
          onPress={() => router.back()}
        >
          뒤로
        </Button>
        {canSeeStatusTimeline ? (
          <Button
            size="lg"
            className="flex-1 rounded-xl bg-brand dark:bg-brand-dark"
            onPress={() => router.push(`/(app)/support/status/${requestId}`)}
          >
            상태 타임라인
          </Button>
        ) : canOpenStaffStatus ? (
          <Button
            size="lg"
            className="flex-1 rounded-xl bg-brand dark:bg-brand-dark"
            onPress={() => router.push(`/(app)/support/status/${requestId}`)}
          >
            {canManageRequest ? '처리 화면' : '상태 확인'}
          </Button>
        ) : null}
      </View>
    </View>
  );
}
