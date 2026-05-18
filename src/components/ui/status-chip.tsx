import { Text, View } from 'react-native';
import type { SupportRequestStatus } from '@/features/support-request/types';
import { STATUS_TONE } from '@/lib/tokens';

interface StatusChipProps {
  status: SupportRequestStatus;
  size?: 'sm' | 'md';
}

export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const tone = STATUS_TONE[status];
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full ${padding} ${tone.chipClassName}`}
      accessibilityRole="text"
      accessibilityLabel={`상태: ${tone.label}`}
    >
      <View className={`h-1.5 w-1.5 rounded-full ${tone.dotClassName}`} />
      <Text className={`font-semibold ${textSize} ${tone.badgeTextClassName}`}>
        {tone.label}
      </Text>
    </View>
  );
}
