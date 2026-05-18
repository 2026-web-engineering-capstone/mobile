import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Button } from 'heroui-native';

interface EmptyViewProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyView({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyViewProps) {
  return (
    <View
      className="items-center justify-center gap-3 px-6 py-10"
      accessibilityRole="text"
    >
      {icon ? <View className="mb-2">{icon}</View> : null}
      <Text className="text-center text-lg font-semibold text-foreground">
        {title}
      </Text>
      {description ? (
        <Text className="text-center text-sm leading-6 text-muted">
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-2">
          <Button variant="primary" onPress={onAction}>
            <Button.LabelContent>{actionLabel}</Button.LabelContent>
          </Button>
        </View>
      ) : null}
    </View>
  );
}
