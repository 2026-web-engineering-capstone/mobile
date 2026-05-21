/**
 * 교움 디자인 시안의 역무원 큐 화면.
 *
 * 어두운 근무지 카드(대기/처리중/완료 stat) + 탭(지원 요청/완료) + 요청 카드.
 * 요청 카드 누르면 staff-detail로, 5분 이상 대기 시 긴급 뱃지 표시.
 */
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
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
import { BRAND_TOKENS, FONT_FAMILY, getLineMeta } from '@/lib/design-tokens';
import {
  MEETING_POINT_LABELS,
  SUPPORT_TYPE_LABELS,
} from '@/features/support-request/store/use-request-draft-store';
import { useSupportRequests } from '@/features/support-request/hooks/use-support-requests';
import {
  TERMINAL_REQUEST_STATUSES,
  type SupportRequestListItem,
} from '@/features/support-request/types';
import { useAuth } from '@/providers/auth-provider';

type Tab = 'incoming' | 'done';

function elapsedMinutes(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return 0;
  return Math.max(0, Math.floor((Date.now() - created) / 60000));
}

export function StaffQueueScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('incoming');
  const requestsQuery = useSupportRequests(user?.role === 'staff');

  const requests = requestsQuery.data ?? [];
  const incoming = useMemo(
    () => requests.filter((r) => !TERMINAL_REQUEST_STATUSES.includes(r.status)),
    [requests],
  );
  const done = useMemo(
    () => requests.filter((r) => r.status === 'completed'),
    [requests],
  );

  const processingCount = incoming.filter((r) =>
    ['assigned', 'in_progress', 'boarded', 'awaiting_dropoff'].includes(r.status),
  ).length;
  const waitingCount = incoming.filter((r) => r.status === 'submitted').length;

  if (user?.role !== 'staff') {
    return <ErrorView message="역무원 권한이 필요합니다." />;
  }

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
              <LineBadge char="역" color="white" size={32} />
              <View>
                <Text
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: 18,
                    fontWeight: '700',
                    color: BRAND_TOKENS.onBrand100,
                  }}
                >
                  {user?.station_id ? `${user.station_id} 역` : '근무지 미지정'}
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
              count={incoming.length}
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
                    onPress={() => router.push(`/(app)/support/${req.id}`)}
                  />
                ))
              )}
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {done.length === 0 ? (
                <EmptyState text="오늘 완료된 요청이 없습니다" />
              ) : (
                done.map((req) => <DoneCard key={req.id} request={req} />)
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
  onPress,
}: {
  request: SupportRequestListItem;
  onPress: () => void;
}) {
  const waitMin = elapsedMinutes(request.created_at);
  const urgent = waitMin >= 5 && request.status === 'submitted';
  const originLine = getLineMeta(request.origin_station_name);
  const destLine = getLineMeta(request.destination_station_name);
  return (
    <GyoumCard padding={16} onPress={onPress} style={{ position: 'relative' }}>
      {urgent ? (
        <View
          style={{
            position: 'absolute',
            top: -6,
            right: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: BRAND_TOKENS.danger,
          }}
        >
          <Text
            style={{
              color: BRAND_TOKENS.onBrand100,
              fontFamily: FONT_FAMILY,
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 0.5,
            }}
          >
            {waitMin}분 대기
          </Text>
        </View>
      ) : null}
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
              fontSize: 11,
              color: BRAND_TOKENS.textMuted,
              marginBottom: 2,
            }}
          >
            #{request.id.slice(-6).toUpperCase()}
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
        <StatusChip status={request.status} size="sm" />
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
        <LineBadge char={originLine.char} color={originLine.color} size={20} />
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
        <LineBadge char={destLine.char} color={destLine.color} size={20} />
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
        {request.support_types.map((type) => (
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

      {/* 만남 위치 */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <PinIcon color={BRAND_TOKENS.accent} size={14} />
        <Text
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 13,
            color: BRAND_TOKENS.textMid,
          }}
        >
          {MEETING_POINT_LABELS[request.meeting_point]}
        </Text>
      </View>
    </GyoumCard>
  );
}

function DoneCard({ request }: { request: SupportRequestListItem }) {
  return (
    <GyoumCard padding={14}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: BRAND_TOKENS.successBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckIcon color={BRAND_TOKENS.success} size={18} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 14,
              fontWeight: '600',
              color: BRAND_TOKENS.text,
            }}
          >
            {request.passenger_name}
          </Text>
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
