import { Text, View } from 'react-native';

export function Header() {
  return (
    <View className="h-12 flex-row items-center justify-between">
      <View className="h-12 w-12 items-center justify-center rounded-full border border-brand-soft bg-brand-surface dark:border-brand-soft-dark dark:bg-brand-surface-dark">
        <Text className="text-lg font-bold text-brand-soft dark:text-brand-soft-dark">M</Text>
      </View>
      <View className="h-12 w-12 rounded-full border border-default-200 bg-background" />
    </View>
  );
}
