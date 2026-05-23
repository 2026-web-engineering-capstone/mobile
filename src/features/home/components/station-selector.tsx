import { Pressable, Text, View } from 'react-native';
import type { SubwayLineTheme } from '@/features/home/types';

type StationSelectorProps = {
  line: SubwayLineTheme;
  currentStation: string;
  previousStation: string | null;
  nextStation: string | null;
  onSelectPrevious?: () => void;
  onSelectNext?: () => void;
};

export function StationSelector({
  currentStation,
  line,
  nextStation,
  previousStation,
  onSelectPrevious,
  onSelectNext,
}: StationSelectorProps) {
  return (
    <View
      className="h-12 flex-row items-center rounded-full px-4"
      style={{ backgroundColor: line.colors.soft }}
    >
      <View className="flex-1 items-start">
        <Pressable onPress={previousStation ? onSelectPrevious : undefined}>
          <Text className="text-sm text-white" numberOfLines={1}>
            {previousStation}
          </Text>
        </Pressable>
      </View>

      <View
        className="h-12 w-40 flex-row items-center justify-center rounded-full border-4 bg-background"
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

      <View className="flex-1 items-end">
        <Pressable onPress={nextStation ? onSelectNext : undefined}>
          <Text className="text-sm text-white" numberOfLines={1}>
            {nextStation}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
