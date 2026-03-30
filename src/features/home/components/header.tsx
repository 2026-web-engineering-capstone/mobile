import { Text, View } from 'react-native';

export function Header() {
  return (
    <View className="h-[50px] flex-row items-center justify-between">
      <View className="h-[50px] w-[50px] items-center justify-center rounded-full border border-[#7da0cb]">
        <Text className="text-[18px] font-bold text-[#5f87b9]">M</Text>
      </View>
      <View className="h-[50px] w-[50px] rounded-full border border-[#d9d9d9] bg-white" />
    </View>
  );
}
