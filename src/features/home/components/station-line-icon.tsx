import { Text, View } from 'react-native';
import type { SubwayLineTheme } from '@/features/home/types';

type StationLineIconProps = {
  line: SubwayLineTheme;
};

export function StationLineIcon({ line }: StationLineIconProps) {
  return (
    <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#f5f5f5]">
      <View
        className="h-5 w-5 items-center justify-center rounded-full"
        style={{ backgroundColor: line.colors.soft }}
      >
        <Text className="text-xs font-semibold text-white">{line.label}</Text>
      </View>
    </View>
  );
}
