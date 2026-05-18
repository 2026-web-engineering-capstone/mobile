import { Text, View } from 'react-native';
import { Button } from 'heroui-native';

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorView({
  title = '오류가 발생했어요',
  message = '잠시 후 다시 시도해 주세요.',
  onRetry,
}: ErrorViewProps) {
  return (
    <View
      className="items-center justify-center gap-3 rounded-3xl bg-danger-bg px-6 py-8 dark:bg-danger-bg-dark"
      accessibilityRole="alert"
    >
      <Text className="text-center text-lg font-semibold text-danger dark:text-danger-dark">
        {title}
      </Text>
      <Text className="text-center text-sm leading-6 text-danger dark:text-danger-dark">
        {message}
      </Text>
      {onRetry ? (
        <View className="mt-2">
          <Button variant="secondary" onPress={onRetry}>
            <Button.LabelContent>다시 시도</Button.LabelContent>
          </Button>
        </View>
      ) : null}
    </View>
  );
}
