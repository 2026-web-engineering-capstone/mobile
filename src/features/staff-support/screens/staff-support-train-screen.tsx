import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from 'heroui-native/button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  boardStaffSupport,
  completeStaffSupport,
  fetchStaffSupportTrainOptions,
} from '@/features/staff-support/api';
import { useSupportRequestsRealtime } from '@/features/support-request/hooks/use-support-requests-realtime';

export function StaffSupportTrainScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  useSupportRequestsRealtime();
  const [selectedTrainNumber, setSelectedTrainNumber] = useState('');
  const [directInput, setDirectInput] = useState('');

  const trainOptionsQuery = useQuery({
    queryKey: ['staff-support', 'train-options', requestId],
    queryFn: () => fetchStaffSupportTrainOptions(requestId ?? ''),
    enabled: Boolean(requestId),
    refetchInterval: 15000,
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      const trainNumber = directInput.trim() || selectedTrainNumber;
      if (!requestId || !trainNumber) {
        throw new Error('train number missing');
      }
      await boardStaffSupport(requestId, trainNumber);
      return completeStaffSupport(requestId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['staff-support'] });
      await queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      router.replace('/(app)/(tabs)' as never);
    },
    onError: (error) => {
      Alert.alert(
        '처리를 완료하지 못했어요',
        error instanceof Error
          ? error.message
          : '잠시 후 다시 시도해주세요.',
      );
    },
  });

  const resolvedTrainNumber = useMemo(
    () => directInput.trim() || selectedTrainNumber,
    [directInput, selectedTrainNumber],
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <View
        className="flex-1 justify-between px-5"
        style={{
          paddingTop: insets.top + 18,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-6">
            <Text className="text-lg font-semibold text-foreground">
              교움
            </Text>

            <Text className="text-3xl font-semibold leading-[44px] text-foreground">
              교통약자가 탑승한 열차 번호를{'\n'}선택하거나 직접 입력해주세요.
            </Text>

            <View className="gap-3">
              {trainOptionsQuery.isLoading ? (
                <View className="rounded-xl bg-default-100 px-4 py-5">
                  <Text className="text-sm text-default-400">
                    실시간 열차 정보를 불러오는 중입니다.
                  </Text>
                </View>
              ) : null}
              {!trainOptionsQuery.isLoading && !trainOptionsQuery.data?.length ? (
                <View className="rounded-xl bg-default-100 px-4 py-5">
                  <Text className="text-sm text-default-500">
                    현재 연결 가능한 실시간 열차 정보가 없습니다. 현장 확인 후 직접 입력해주세요.
                  </Text>
                </View>
              ) : null}
              {trainOptionsQuery.data?.map((option) => {
                const isSelected =
                  !directInput.trim() &&
                  selectedTrainNumber === option.train_number;

                return (
                  <Pressable
                    key={option.train_number}
                    className={`flex-row items-center rounded-xl px-4 py-5 ${
                      isSelected
                        ? 'border border-brand bg-brand-tint dark:bg-brand-tint-dark'
                        : 'bg-brand-tint dark:bg-brand-tint-dark'
                    }`}
                    onPress={() => {
                      setSelectedTrainNumber(option.train_number);
                      setDirectInput('');
                    }}
                  >
                    <View className="mr-4 h-7 w-7 items-center justify-center rounded-full bg-brand/70">
                      <Text className="text-sm font-semibold text-white">
                        {option.line_label}
                      </Text>
                    </View>
                    <Text className="flex-1 text-base font-medium text-foreground">
                      {option.destination_label}
                    </Text>
                    <Text className="mr-4 text-base text-foreground">
                      {option.arrival_label}
                    </Text>
                    <Text className="text-base font-medium text-foreground">
                      {option.train_number}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="gap-3">
              <Text className="text-2xl font-semibold text-foreground">
                직접입력
              </Text>
              <TextInput
                value={directInput}
                onChangeText={(text) => {
                  setDirectInput(text);
                  if (text.trim()) {
                    setSelectedTrainNumber('');
                  }
                }}
                placeholder="열차 번호를 입력하세요"
                placeholderTextColor="#9ca3af"
                className="rounded-xl bg-default-100 px-4 py-4 text-base text-foreground"
              />
            </View>
          </View>
        </ScrollView>

        <Button
          size="lg"
          className="rounded-xl bg-brand dark:bg-brand-dark"
          isDisabled={!resolvedTrainNumber}
          onPress={() => completeMutation.mutate()}
        >
          {completeMutation.isPending ? '처리 중...' : '교통지원 완료'}
        </Button>
      </View>
    </View>
  );
}
