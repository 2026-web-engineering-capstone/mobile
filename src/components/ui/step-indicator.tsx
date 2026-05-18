import { Text, View } from 'react-native';

interface StepIndicatorProps {
  steps: string[];
  currentIndex: number;
}

export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  return (
    <View
      className="flex-row items-center gap-1.5"
      accessibilityRole="progressbar"
      accessibilityLabel={`${steps.length}단계 중 ${currentIndex + 1}번째 단계: ${steps[currentIndex] ?? ''}`}
    >
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const bar = isComplete
          ? 'bg-brand dark:bg-brand-dark'
          : isCurrent
            ? 'bg-brand dark:bg-brand-dark'
            : 'bg-muted/30';
        const flex = isCurrent ? 'flex-[2]' : 'flex-1';
        return (
          <View key={step} className={`flex-row items-center ${flex}`}>
            <View className={`h-1.5 w-full rounded-full ${bar}`} />
          </View>
        );
      })}
    </View>
  );
}

interface StepLabelProps {
  steps: string[];
  currentIndex: number;
}

export function StepLabel({ steps, currentIndex }: StepLabelProps) {
  const total = steps.length;
  const current = steps[currentIndex] ?? '';
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-xs font-semibold uppercase tracking-widest text-accent">
        STEP {currentIndex + 1} / {total}
      </Text>
      <Text className="text-sm font-medium text-muted">{current}</Text>
    </View>
  );
}
