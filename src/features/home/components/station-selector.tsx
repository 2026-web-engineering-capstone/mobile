import { Text, View } from 'react-native';
import type { SubwayLineTheme } from '@/features/home/types';

type StationSelectorProps = {
  line: SubwayLineTheme;
  currentStation: string;
  previousStation: string;
  nextStation: string;
};

export function StationSelector({
  currentStation,
  line,
  nextStation,
  previousStation,
}: StationSelectorProps) {
  return (
    <View
      className="relative h-12 flex-row items-center justify-between rounded-full px-4"
      style={{ backgroundColor: line.colors.soft }}
    >
      <Text className="text-sm text-white">{previousStation}</Text>
      <Text className="text-sm text-white">{nextStation}</Text>

      <View
        className="absolute left-1/2 top-0 h-12 w-40 -translate-x-1/2 flex-row items-center justify-center rounded-full border-4 bg-background"
        style={{ borderColor: line.colors.soft }}
      >
        <View
          className="mr-2 h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: line.colors.soft }}
        >
          <Text className="text-xs font-semibold text-white">{line.label}</Text>
        </View>
        <Text className="text-base font-semibold tracking-tight text-foreground">
          {currentStation}
        </Text>
      </View>
    </View>
  );
}
