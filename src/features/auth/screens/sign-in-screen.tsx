import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GyoumAppBar,
  GyoumCTA,
  GyoumCard,
  GyoumSearchInput,
  PageTitle,
  Screen,
  SectionLabel,
  StationChipDS,
  ToggleChip,
  WheelchairIcon,
  CompanionIcon,
  TrainIcon,
  BellIcon,
} from '@/components/ui';
import { BRAND_TOKENS, FONT_FAMILY, RADIUS } from '@/lib/design-tokens';
import { ApiError } from '@/lib/api/client';
import type { Role } from '@/lib/api/types';
import { useAuth } from '@/providers/auth-provider';
import { useStations } from '@/features/support-request/hooks/use-support-requests';

type RoleOption = {
  role: Role;
  label: string;
  tagline: string;
  icon: (color: string) => React.ReactNode;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'passenger',
    label: '교통약자',
    tagline: '안전한 지하철 이용을 위해 지원을 요청합니다',
    icon: (color) => <WheelchairIcon color={color} size={22} />,
  },
  {
    role: 'staff',
    label: '역무원',
    tagline: '들어온 지원 요청을 현장에서 처리합니다',
    icon: (color) => <CompanionIcon color={color} size={22} />,
  },
  {
    role: 'driver',
    label: '기관사',
    tagline: '교통약자 승차 알림을 받습니다',
    icon: (color) => <TrainIcon color={color} size={22} />,
  },
  {
    role: 'admin',
    label: '관리자',
    tagline: '로그와 처리 시간을 모니터링합니다',
    icon: (color) => <BellIcon color={color} size={22} />,
  },
];

const LAST_STAFF_STATION_KEY = 'gyoum.staff.lastStationId';

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.message && error.message !== 'Request failed') return error.message;
    if (error.status === 401) return '로그인에 실패했습니다. 다시 시도해 주세요.';
    if (error.status === 422) return '입력값을 확인해 주세요.';
  }
  return '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.';
}

export function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const inFlightRef = useRef(false);
  const [selectedRole, setSelectedRole] = useState<Role>('passenger');
  const [stationStep, setStationStep] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [stationQuery, setStationQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 직전 근무 역 자동 복원.
  useEffect(() => {
    void (async () => {
      try {
        const lastId = await AsyncStorage.getItem(LAST_STAFF_STATION_KEY);
        if (lastId) setSelectedStationId(lastId);
      } catch {
        // ignore storage errors
      }
    })();
  }, []);

  const stationsQuery = useStations(stationQuery.trim() || undefined);
  const stations = useMemo(() => stationsQuery.data ?? [], [stationsQuery.data]);

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setErrorMessage(null);
  };

  const handleContinue = async () => {
    if (selectedRole === 'staff' && !stationStep) {
      setStationStep(true);
      return;
    }
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const stationId = selectedRole === 'staff' ? selectedStationId : null;
      if (selectedRole === 'staff' && stationId) {
        await AsyncStorage.setItem(LAST_STAFF_STATION_KEY, stationId);
      }
      await signIn(selectedRole, { stationId });
      router.replace('/(app)/(tabs)');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (stationStep) {
    return (
      <Screen background="bg" padded={false} edges={[]}>
        <StatusBar style="dark" />
        <GyoumAppBar
          title="근무 역 선택"
          topInset={insets.top}
          onBack={() => setStationStep(false)}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: insets.bottom + 120,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <PageTitle sub="오늘 근무하시는 역을 선택해주세요.">
            어느 역에서 근무하시나요?
          </PageTitle>
          <GyoumSearchInput
            value={stationQuery}
            onChangeText={setStationQuery}
            placeholder="역 이름 검색"
            onClear={() => setStationQuery('')}
          />
          <View style={{ height: 16 }} />
          <SectionLabel>역 목록</SectionLabel>
          <View style={{ gap: 8 }}>
            {stationsQuery.isLoading ? (
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  color: BRAND_TOKENS.textMuted,
                  textAlign: 'center',
                  paddingVertical: 24,
                }}
              >
                역 목록을 불러오는 중...
              </Text>
            ) : null}
            {stations.map((station) => (
              <StationChipDS
                key={station.id}
                station={station}
                size="sm"
                selected={selectedStationId === station.id}
                onPress={() => setSelectedStationId(station.id)}
              />
            ))}
            {!stationsQuery.isLoading && stations.length === 0 ? (
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  color: BRAND_TOKENS.textMuted,
                  textAlign: 'center',
                  paddingVertical: 24,
                }}
              >
                일치하는 역이 없습니다.
              </Text>
            ) : null}
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
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16),
            backgroundColor: BRAND_TOKENS.bg + 'F2',
          }}
        >
          <GyoumCTA
            variant="primary"
            disabled={!selectedStationId || isSubmitting}
            onPress={handleContinue}
          >
            {isSubmitting ? '로그인 중...' : '역무원으로 시작하기'}
          </GyoumCTA>
        </View>
      </Screen>
    );
  }

  return (
    <Screen background="bg" padded={false} edges={[]}>
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
          paddingHorizontal: 24,
        }}
      >
        {/* 브랜드 */}
        <View style={{ marginTop: 40, alignItems: 'center', gap: 16 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              backgroundColor: BRAND_TOKENS.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: BRAND_TOKENS.textOnDark,
                fontFamily: FONT_FAMILY,
                fontSize: 32,
                fontWeight: '700',
              }}
            >
              교
            </Text>
          </View>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 28,
                fontWeight: '700',
                color: BRAND_TOKENS.text,
                letterSpacing: -0.6,
              }}
            >
              교움
            </Text>
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: 15,
                color: BRAND_TOKENS.textMuted,
                textAlign: 'center',
                lineHeight: 22,
              }}
            >
              교통약자의 안전한 지하철 이동을{'\n'}역과 연결해 주는 지원 요청 서비스
            </Text>
          </View>
        </View>

        {/* 역할 선택 */}
        <View style={{ marginTop: 40, gap: 12 }}>
          <SectionLabel>어떤 역할로 시작하시겠어요?</SectionLabel>
          {ROLE_OPTIONS.map((option) => {
            const selected = option.role === selectedRole;
            return (
              <ToggleChip
                key={option.role}
                icon={option.icon(selected ? BRAND_TOKENS.textOnDark : BRAND_TOKENS.text)}
                label={option.label}
                sub={option.tagline}
                selected={selected}
                onPress={() => handleSelectRole(option.role)}
              />
            );
          })}
        </View>

        {errorMessage ? (
          <GyoumCard
            padding={14}
            style={{
              marginTop: 16,
              backgroundColor: BRAND_TOKENS.dangerBg,
              borderColor: BRAND_TOKENS.danger + '40',
            }}
          >
            <Text style={{ fontFamily: FONT_FAMILY, color: BRAND_TOKENS.danger, fontSize: 13 }}>
              {errorMessage}
            </Text>
          </GyoumCard>
        ) : null}

        <View style={{ marginTop: 24, gap: 8 }}>
          <GyoumCTA
            variant="primary"
            onPress={handleContinue}
            disabled={isSubmitting}
          >
            {selectedRole === 'staff'
              ? '근무 역 선택하기'
              : isSubmitting
                ? '로그인 중...'
                : `${ROLE_OPTIONS.find((opt) => opt.role === selectedRole)?.label}(으)로 시작하기`}
          </GyoumCTA>
          <Text
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 12,
              color: BRAND_TOKENS.textMuted,
              textAlign: 'center',
            }}
          >
            데모 환경 · 역할은 언제든지 다시 로그인해 전환할 수 있어요
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
