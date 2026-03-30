import { Text, View } from 'react-native';

type StationSelectorProps = {
  lineLabel: string;
  currentStation: string;
  previousStation: string;
  nextStation: string;
};

export function StationSelector({
  currentStation,
  lineLabel,
  nextStation,
  previousStation,
}: StationSelectorProps) {
  return (
    <View className="relative h-11 flex-row items-center justify-between rounded-full bg-[#759cce] px-3">
      <Text className="text-[14px] text-white">{previousStation}</Text>
      <Text className="text-[14px] text-white">{nextStation}</Text>

      <View
        className="absolute top-0 h-11 w-40 flex-row items-center justify-center rounded-full border-[4px] border-[#759cce] bg-white"
        style={{ left: '50%', marginLeft: -80 }}
      >
        <View className="mr-2 h-5 w-5 items-center justify-center rounded-full bg-[#759cce]">
          <Text className="text-[12px] font-semibold text-white">{lineLabel}</Text>
        </View>
        <Text className="text-[16px] font-semibold tracking-[-0.4px] text-[#111111]">
          {currentStation}
        </Text>
      </View>
    </View>
  );
}
