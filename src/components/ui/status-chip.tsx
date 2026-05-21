import { Text, View } from 'react-native';
import type { SupportRequestStatus } from '@/features/support-request/types';
import { STATUS_TONE } from '@/lib/tokens';
import { RADIUS } from '@/lib/design-tokens';
import { typo } from '@/lib/typography';

interface StatusChipProps {
  status: SupportRequestStatus;
  size?: 'sm' | 'md';
}

/**
 * DESIGN.md "status-chip-*" 사양:
 *   - rounded.pill
 *   - padding 5px 10px
 *   - typography.meta (12 / 500)
 *   - 6×6 leading dot (텍스트 색과 동일)
 */
export function StatusChip({ status, size = 'md' }: StatusChipProps) {
  const tone = STATUS_TONE[status];
  // size sm은 padding을 한 단계 축소.
  const paddingVertical = size === 'sm' ? 3 : 5;
  const paddingHorizontal = size === 'sm' ? 8 : 10;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical,
        paddingHorizontal,
        borderRadius: RADIUS.pill,
        alignSelf: 'flex-start',
      }}
      className={tone.badgeBgClassName}
      accessibilityRole="text"
      accessibilityLabel={`상태: ${tone.label}`}
    >
      <View
        style={{ width: 6, height: 6, borderRadius: 3 }}
        className={tone.dotClassName}
      />
      <Text style={typo('meta')} className={tone.badgeTextClassName}>
        {tone.label}
      </Text>
    </View>
  );
}
