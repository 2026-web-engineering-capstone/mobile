import { ActivityIndicator, Text, View } from 'react-native';

interface LoadingViewProps {
  label?: string;
}

export function LoadingView({ label = '불러오는 중...' }: LoadingViewProps) {
  return (
    <View
      className="items-center justify-center gap-3 px-6 py-10"
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <ActivityIndicator size="large" />
      <Text className="text-sm text-muted">{label}</Text>
    </View>
  );
}
