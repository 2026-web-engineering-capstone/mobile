import { Text, View } from 'react-native';
import type { SupportRequestStatus } from '@/features/support-request/types';
import { STATUS_ORDER, STATUS_TONE } from '@/lib/tokens';

interface StatusTimelineProps {
  current: SupportRequestStatus;
}

/**
 * 8개 상태 중 정상 흐름 6단계(submitted→completed)를 가로 스텝퍼로 표시.
 * cancelled/unavailable은 별도 상태 칩으로 안내한다.
 */
export function StatusTimeline({ current }: StatusTimelineProps) {
  const isTerminalAbnormal =
    current === 'cancelled' || current === 'unavailable';
  const currentIndex = isTerminalAbnormal
    ? -1
    : STATUS_ORDER.indexOf(current);

  return (
    <View
      className="gap-3"
      accessibilityRole="progressbar"
      accessibilityLabel={`현재 상태: ${STATUS_TONE[current].label}`}
    >
      {isTerminalAbnormal ? (
        <View className="items-start">
          <View
            className={`flex-row items-center gap-2 rounded-full px-3 py-1 ${STATUS_TONE[current].chipClassName}`}
          >
            <View
              className={`h-2 w-2 rounded-full ${STATUS_TONE[current].dotClassName}`}
            />
            <Text
              className={`text-sm font-semibold ${STATUS_TONE[current].badgeTextClassName}`}
            >
              {STATUS_TONE[current].label}
            </Text>
          </View>
        </View>
      ) : null}

      <View className="flex-row items-center gap-1">
        {STATUS_ORDER.map((status, index) => {
          const isComplete = currentIndex > index;
          const isCurrent = currentIndex === index;
          const tone = STATUS_TONE[status];
          const dotColor =
            isComplete || isCurrent
              ? tone.dotClassName
              : 'bg-muted/40';
          const lineColor =
            isComplete
              ? 'bg-brand dark:bg-brand-dark'
              : 'bg-muted/30';

          return (
            <View
              key={status}
              className="flex-1 flex-row items-center"
            >
              <View
                className={`h-3 w-3 rounded-full ${dotColor} ${
                  isCurrent
                    ? 'border-2 border-brand dark:border-brand-dark'
                    : ''
                }`}
              />
              {index < STATUS_ORDER.length - 1 ? (
                <View
                  className={`mx-0.5 h-0.5 flex-1 rounded-full ${lineColor}`}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      <View className="flex-row justify-between">
        {STATUS_ORDER.map((status, index) => {
          const isCurrent = currentIndex === index;
          return (
            <Text
              key={status}
              className={`text-[10px] ${
                isCurrent
                  ? 'font-semibold text-foreground'
                  : 'text-muted'
              }`}
              style={{ width: `${100 / STATUS_ORDER.length}%`, textAlign: 'center' }}
            >
              {STATUS_TONE[status].label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}
