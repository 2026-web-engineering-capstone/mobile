/**
 * 교움 디자인 시안의 역무원 큐 화면.
 *
 * 어두운 근무지 카드(대기/처리중/완료 stat) + 탭(지원 요청/완료) + 요청 카드.
 * 요청 카드 누르면 staff-detail로, 5분 이상 대기 시 긴급 뱃지 표시.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  BellIcon,
  CheckIcon,
  EmptyView,
  ErrorView,
  GyoumAppBar,
  GyoumCard,
  LineBadge,
  LoadingView,
  PinIcon,
  Screen,
  StatusChip,
  ArrowRightIcon,
} from '@/components/ui';
import {
  BRAND_TOKENS,
  FONT_FAMILY,
  getLineMeta,
  type LineMeta,
} from '@/lib/design-tokens';
import {
  MEETING_POINT_LABELS,
  SUPPORT_TYPE_LABELS,
} from '@/features/support-request/store/use-request-draft-store';
import { useSupportRequests } from '@/features/support-request/hooks/use-support-requests';
import {
  TERMINAL_REQUEST_STATUSES,
  getStaffQueueItemClassification,
  type SupportRequestListItem,
} from '@/features/support-request/types';
import type { SessionUser } from '@/lib/api/types';
import { useAuth } from '@/providers/auth-provider';

type Tab = 'incoming' | 'done';
const STAFF_QUEUE_SEEN_STORAGE_KEY = 'gyoum.staffQueue.seenRequestKeys.v1';

function elapsedMinutes(createdAt: string, nowMs = Date.now()): number {
  const created = parseApiDate(createdAt).getTime();
  if (Number.isNaN(created)) return 0;
  return Math.max(0, Math.floor((nowMs - created) / 60000));
}

function parseApiDate(iso: string) {
  return new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`);
}

function formatRelativeCreatedAt(createdAt: string, nowMs = Date.now()): string {
  const minutes = elapsedMinutes(createdAt, nowMs);
  if (minutes <= 0) return '방금전';
  if (minutes < 60) return `${minutes}분전`;

  const created = parseApiDate(createdAt);
  if (Number.isNaN(created.getTime())) return '방금전';

  const dateParts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const sameDay = dateParts.format(created) === dateParts.format(new Date(nowMs));
  const time = created.toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
  });

  if (sameDay) return `오늘 ${time}`;

  return `${created.toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })} ${time}`;
}

function sortQueueRequests(
  requests: SupportRequestListItem[],
) {
  return [...requests].sort((a, b) => {
    return parseApiDate(b.created_at).getTime() - parseApiDate(a.created_at).getTime();
  });
}

function getStaffStationDisplayName(user: ReturnType<typeof useAuth>['user']) {
  if (user?.station_name) return user.station_name;
  if (!user?.station_id) return '근무지 미지정';
  if (user.name.endsWith(' 역무원')) return user.name.replace(/ 역무원$/, '');
  return user.station_id;
}

const SUPPORT_TYPE_ORDER = [
  'footboard',
  'wheelchair',
  'companion',
  'elevator',
  'vision',
  'chat',
] as const;

const BOARDING_REQUEST_BORDER = '#A9DDF8';
const DROPOFF_REQUEST_BORDER = '#AEE8C8';
const REQUEST_CARD_MIN_HEIGHT = 196;

function sortSupportTypes(types: SupportRequestListItem['support_types']) {
  return [...types].sort((a, b) => {
    const aOrder = SUPPORT_TYPE_ORDER.indexOf(a);
    const bOrder = SUPPORT_TYPE_ORDER.indexOf(b);
    return (aOrder === -1 ? 99 : aOrder) - (bOrder === -1 ? 99 : bOrder);
  });
}

function shouldShowInIncomingQueue(
  request: SupportRequestListItem,
  user: ReturnType<typeof useAuth>['user'],
) {
  if (!user || user.role !== 'staff' || !user.station_id) return false;
  const classification = getStaffQueueItemClassification(request, user);
  return Boolean(
    classification?.isActionable && !TERMINAL_REQUEST_STATUSES.includes(request.status),
  );
}

function getQueueNoticeKey(
  request: SupportRequestListItem,
  user: ReturnType<typeof useAuth>['user'],
) {
  const classification = getStaffQueueItemClassification(request, user);
  if (!classification) return request.id;
  return `${user?.id ?? 'staff'}:${request.id}:${classification.kind}`;
}

function getDoneKind(
  request: SupportRequestListItem,
  user: SessionUser | null,
): 'boarding' | 'dropoff' {
  if (request.status === 'completed') return 'dropoff';
  if (user?.station_id === request.origin_station_id) return 'boarding';
  return 'dropoff';
}

export function StaffQueueScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('incoming');
  const [seenRequestKeys, setSeenRequestKeys] = useState<Set<string>>(new Set());
  const [nowMs, setNowMs] = useState(() => Date.now());
  const requestsQuery = useSupportRequests(user?.role === 'staff');
  const { refetch } = requestsQuery;

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STAFF_QUEUE_SEEN_STORAGE_KEY)
      .then((value) => {
        if (!alive || !value) return;
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setSeenRequestKeys(new Set(parsed.filter((item) => typeof item === 'string')));
        }
      })
      .catch(() => {
        // 읽음 배지는 보조 UI라 저장소 오류는 화면 동작을 막지 않는다.
      });

    return () => {
      alive = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user?.role === 'staff') {
        setNowMs(Date.now());
        void refetch();
      }
    }, [refetch, user?.role]),
  );

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const requests = requestsQuery.data ?? [];
  const incoming = useMemo(
    () => {
      const actionable = requests.filter((request) =>
        shouldShowInIncomingQueue(request, user),
      );
      return sortQueueRequests(actionable);
    },
    [requests, user],
  );
  const done = useMemo(
    () =>
      sortQueueRequests(requests.filter((request) => {
        if (request.status === 'completed') {
          return (
            user?.station_id === request.destination_station_id ||
            request.assigned_staff_name === user?.name
          );
        }
        const classification = getStaffQueueItemClassification(request, user);
        return classification?.kind === 'origin_handoff_monitoring';
      })),
    [requests, user],
  );

  const processingCount = incoming.filter((r) =>
    ['assigned', 'in_progress', 'boarded', 'awaiting_dropoff'].includes(r.status),
  ).length;
  const waitingCount = incoming.filter((r) => r.status === 'submitted').length;
  const unreadIncomingCount = incoming.filter(
    (request) => !seenRequestKeys.has(getQueueNoticeKey(request, user)),
  ).length;

  const handleIncomingPress = (request: SupportRequestListItem) => {
    const noticeKey = getQueueNoticeKey(request, user);
    setSeenRequestKeys((prev) => {
      if (prev.has(noticeKey)) return prev;
      const next = new Set(prev);
      next.add(noticeKey);
      void AsyncStorage.setItem(
        STAFF_QUEUE_SEEN_STORAGE_KEY,
        JSON.stringify([...next]),
      );
      return next;
    });
    router.push(`/(app)/support/${request.id}`);
  };

  if (user?.role !== 'staff') {
    return <ErrorView message="역무원 권한이 필요합니다." />;
  }

  const stationDisplayName = getStaffStationDisplayName(user);
  const stationLineMetas = [getLineMeta(null)];

  return (
    <Screen
      background="bg"
      padded={false}
      edges={['top', 'bottom']}
      header={
        <>
          <StatusBar style="dark" />
          <GyoumAppBar
            topInset={0}
            leading={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                backgroundColor: BRAND_TOKENS.brand,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: BRAND_TOKENS.onBrand100,
                  fontFamily: FONT_FAMILY,
                  fontWeight: '700',
                  fontSize: 14,
                }}
              >
                교
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                backgroundColor: BRAND_TOKENS.text,
              }}
            >
              <Text
                style={{
                  color: BRAND_TOKENS.onBrand100,
                  fontFamily: FONT_FAMILY,
                  fontWeight: '700',
                  fontSize: 10,
                  letterSpacing: 1,
                }}
              >
                STAFF
              </Text>
            </View>
          </View>
        }
        trailing={
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: BRAND_TOKENS.surfaceAlt,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BellIcon color={BRAND_TOKENS.text} size={20} />
          </View>
        }
          />
        </>
      }
    >
      {requestsQuery.isLoading && requests.length === 0 ? (
        <LoadingView />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 32,
            gap: 16,
          }}
        >
          {/* 근무 정보 카드 (어두운) */}
          <GyoumCard
            padding={16}
            style={{ backgroundColor: BRAND_TOKENS.text, borderColor: BRAND_TOKENS.text }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 12,
                  color: BRAND_TOKENS.onBrand60,
                }}
              >
                오늘 근무
              </Text>
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 12,
                  color: BRAND_TOKENS.onBrand60,
                }}
              >
                {user?.name}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <StationLineBadges lines={stationLineMetas} size={30} />
              <View>
                <Text
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 18,
                    fontWeight: '700',
                    color: BRAND_TOKENS.onBrand100,
                  }}
                >
                  {stationDisplayName}
                </Text>
                <Text
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 12,
                    color: BRAND_TOKENS.onBrand60,
                  }}
                >
                  역무원 모드
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                gap: 1,
                backgroundColor: BRAND_TOKENS.onBrand10,
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <StatBlock label="대기" value={waitingCount} accent />
              <StatBlock label="처리 중" value={processingCount} />
              <StatBlock label="오늘 완료" value={done.length} />
            </View>
          </GyoumCard>

          {/* 탭 */}
          <View
            style={{
              flexDirection: 'row',
              gap: 4,
              backgroundColor: BRAND_TOKENS.surfaceAlt,
              padding: 4,
              borderRadius: 12,
            }}
          >
            <TabButton
              active={tab === 'incoming'}
              onPress={() => setTab('incoming')}
              count={unreadIncomingCount}
            >
              지원 요청
            </TabButton>
            <TabButton active={tab === 'done'} onPress={() => setTab('done')}>
              완료
            </TabButton>
          </View>

          {tab === 'incoming' ? (
            <View style={{ gap: 10 }}>
              {incoming.length === 0 ? (
                <EmptyState text="대기 중인 요청이 없습니다" />
              ) : (
                incoming.map((req) => (
                  <RequestQueueCard
                    key={req.id}
                    request={req}
                    user={user}
                    isUnread={!seenRequestKeys.has(getQueueNoticeKey(req, user))}
                    nowMs={nowMs}
                    onPress={() => handleIncomingPress(req)}
                  />
                ))
              )}
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {done.length === 0 ? (
                <EmptyState text="오늘 완료된 요청이 없습니다" />
              ) : (
                done.map((req) => (
                  <DoneCard
                    key={req.id}
                    request={req}
                    user={user}
                    nowMs={nowMs}
                    onPress={() => router.push(`/(app)/support/${req.id}`)}
                  />
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

function StatBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 10,
        backgroundColor: '#000',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 11,
          color: BRAND_TOKENS.onBrand50,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 22,
          fontWeight: '700',
          color: accent ? BRAND_TOKENS.accent : BRAND_TOKENS.onBrand100,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function TabButton({
  active,
  onPress,
  children,
  count,
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        onTouchEnd={onPress}
        style={{
          paddingVertical: 10,
          borderRadius: 8,
          backgroundColor: active ? BRAND_TOKENS.surface : 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            fontWeight: '600',
            color: active ? BRAND_TOKENS.text : BRAND_TOKENS.textMuted,
          }}
        >
          {children}
        </Text>
        {count ? (
          <View
            style={{
              minWidth: 18,
              height: 18,
              paddingHorizontal: 6,
              borderRadius: 9,
              backgroundColor: BRAND_TOKENS.danger,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: BRAND_TOKENS.onBrand100,
                fontFamily: FONT_FAMILY,
                fontSize: 10,
                fontWeight: '700',
              }}
            >
              {count}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function RequestQueueCard({
  request,
  user,
  isUnread,
  nowMs,
  onPress,
}: {
  request: SupportRequestListItem;
  user: SessionUser | null;
  isUnread: boolean;
  nowMs: number;
  onPress: () => void;
}) {
  const originLines = [getLineMeta(null)];
  const destLines = [getLineMeta(null)];
  const classification = getStaffQueueItemClassification(request, user);
  const isDropoff = classification?.kind === 'destination_handoff';
  const cardTone = isDropoff ? BRAND_TOKENS.success : BRAND_TOKENS.brand;
  const cardBorder = isDropoff ? DROPOFF_REQUEST_BORDER : BOARDING_REQUEST_BORDER;
  const actionTitle = isDropoff ? '하차 지원 필요' : '승차 지원 필요';
  const locationLabel = isDropoff
    ? [
        request.train_number ? `${request.train_number} 열차` : null,
        request.train_car_number ? `${request.train_car_number}칸` : null,
      ]
        .filter(Boolean)
        .join(' · ') || '열차 정보 확인 중'
    : MEETING_POINT_LABELS[request.meeting_point];
  return (
    <GyoumCard
      padding={16}
      onPress={onPress}
      style={{
        position: 'relative',
        minHeight: REQUEST_CARD_MIN_HEIGHT,
        borderColor: cardBorder,
        borderWidth: 2,
        backgroundColor: BRAND_TOKENS.surface,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -6,
          right: 12,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: isUnread ? BRAND_TOKENS.danger : BRAND_TOKENS.surfaceAlt,
          borderWidth: isUnread ? 0 : 1,
          borderColor: BRAND_TOKENS.border,
        }}
      >
        <Text
          style={{
            color: isUnread ? BRAND_TOKENS.onBrand100 : BRAND_TOKENS.textMid,
            fontFamily: FONT_FAMILY,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.2,
          }}
        >
          {formatRelativeCreatedAt(request.created_at, nowMs)}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 12,
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 12,
              fontWeight: '700',
              color: cardTone,
              marginBottom: 4,
            }}
          >
            {actionTitle}
          </Text>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 16,
              fontWeight: '700',
              color: BRAND_TOKENS.text,
            }}
          >
            {request.passenger_name}
          </Text>
        </View>
        {isDropoff ? (
          <QueueStatusPill label="하차 대기" tone="dropoff" />
        ) : (
          <StatusChip status={request.status} size="sm" />
        )}
      </View>

      {/* 경로 */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: BRAND_TOKENS.surfaceAlt,
          borderRadius: 10,
          marginBottom: 12,
        }}
      >
        <StationLineBadges lines={originLines} />
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            fontWeight: '600',
            color: BRAND_TOKENS.text,
            flexShrink: 1,
          }}
          numberOfLines={1}
        >
          {request.origin_station_name}
        </Text>
        <ArrowRightIcon color={BRAND_TOKENS.textMuted} size={14} />
        <StationLineBadges lines={destLines} />
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            fontWeight: '600',
            color: BRAND_TOKENS.text,
            flexShrink: 1,
          }}
          numberOfLines={1}
        >
          {request.destination_station_name}
        </Text>
      </View>

      {/* 지원 유형 */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
        {sortSupportTypes(request.support_types).map((type) => (
          <View
            key={type}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              backgroundColor: BRAND_TOKENS.surfaceAlt,
            }}
          >
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 11,
                color: BRAND_TOKENS.textMid,
                fontWeight: '500',
              }}
            >
              {SUPPORT_TYPE_LABELS[type]}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <PinIcon color={BRAND_TOKENS.accent} size={14} />
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            color: BRAND_TOKENS.textMid,
          }}
        >
          {locationLabel}
        </Text>
      </View>
    </GyoumCard>
  );
}

function QueueStatusPill({
  label,
  tone,
}: {
  label: string;
  tone: 'dropoff';
}) {
  const color = tone === 'dropoff' ? BRAND_TOKENS.success : BRAND_TOKENS.brand;
  const backgroundColor =
    tone === 'dropoff' ? BRAND_TOKENS.successBg : BRAND_TOKENS.brandLight;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 999,
        alignSelf: 'flex-start',
        backgroundColor,
      }}
      accessibilityRole="text"
      accessibilityLabel={`상태: ${label}`}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
        }}
      />
      <Text
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: 12,
          fontWeight: '500',
          color,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function StationLineBadges({
  lines,
  size = 24,
}: {
  lines: readonly LineMeta[];
  size?: number;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {lines.map((line, index) => (
        <LineBadge
          key={`${line.char}-${line.color}-${index}`}
          char={line.char}
          color={line.color}
          size={size}
        />
      ))}
    </View>
  );
}

function DoneCard({
  request,
  user,
  nowMs,
  onPress,
}: {
  request: SupportRequestListItem;
  user: SessionUser | null;
  nowMs: number;
  onPress: () => void;
}) {
  const doneKind = getDoneKind(request, user);
  const doneLabel = doneKind === 'boarding' ? '승차 완료' : '하차 완료';
  const doneColor = doneKind === 'boarding' ? BRAND_TOKENS.brand : BRAND_TOKENS.success;
  const doneBg = doneKind === 'boarding' ? BRAND_TOKENS.brandLight : BRAND_TOKENS.successBg;
  return (
    <GyoumCard padding={14} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: doneBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckIcon color={doneColor} size={18} />
        </View>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              marginBottom: 2,
            }}
          >
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 14,
                fontWeight: '600',
                color: BRAND_TOKENS.text,
                flexShrink: 1,
              }}
              numberOfLines={1}
            >
              {request.passenger_name}
            </Text>
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 11,
                color: doneColor,
                fontWeight: '500',
              }}
            >
              {doneLabel}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 12,
              color: BRAND_TOKENS.textMuted,
            }}
            numberOfLines={1}
          >
            {request.origin_station_name} → {request.destination_station_name}
          </Text>
          <Text
            style={{
              marginTop: 2,
              fontFamily: FONT_FAMILY,
              fontSize: 11,
              color: BRAND_TOKENS.textMuted,
            }}
            numberOfLines={1}
          >
            {formatRelativeCreatedAt(request.created_at, nowMs)}
            {request.train_number ? ` · ${request.train_number}` : ''}
            {request.train_car_number ? ` · ${request.train_car_number}칸` : ''}
          </Text>
        </View>
      </View>
    </GyoumCard>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View
      style={{
        paddingVertical: 48,
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: BRAND_TOKENS.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: BRAND_TOKENS.border,
      }}
    >
      <Text style={{ fontFamily: FONT_FAMILY, fontSize: 14, color: BRAND_TOKENS.textMuted }}>
        {text}
      </Text>
    </View>
  );
}
