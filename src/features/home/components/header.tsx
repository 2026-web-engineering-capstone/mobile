import { Text, View } from 'react-native';

export function Header() {
  return (
    <View className="h-12 flex-row items-center justify-between">
      <View className="h-12 w-12 items-center justify-center rounded-full border border-[#7da0cb] bg-[#f8fbff]">
        <Text className="text-lg font-bold text-[#5f87b9]">M</Text>
      </View>
      <View className="h-12 w-12 rounded-full border border-[#d9d9d9] bg-white" />
    </View>
  );
}
