import { Text, View } from 'react-native';

type StationLineIconProps = {
  lineLabel: string;
};

export function StationLineIcon({ lineLabel }: StationLineIconProps) {
  return (
    <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-[#f5f5f5]">
      <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-[#759cce]">
        <Text className="text-[13px] font-semibold text-white">{lineLabel}</Text>
      </View>
    </View>
  );
}
