import { Text, View } from 'react-native';

type Facility = {
  label: string;
  available: boolean;
};

type FacilitiesGridProps = {
  facilities: Facility[];
};

function FacilityItem({ available, label }: Facility) {
  return (
    <View className="w-1/2 flex-row items-center gap-2.5 pr-2">
      <View className="h-6 w-6 items-center justify-center rounded-full border border-default-300">
        {!available ? (
          <Text className="text-lg leading-none text-gray-400">/</Text>
        ) : null}
      </View>
      <Text
        className={
          available
            ? 'text-sm text-foreground'
            : 'text-sm text-gray-400'
        }
      >
        {label}
      </Text>
    </View>
  );
}

export function FacilitiesGrid({ facilities }: FacilitiesGridProps) {
  return (
    <View className="flex-row flex-wrap gap-y-4">
      {facilities.map((facility) => (
        <FacilityItem key={facility.label} {...facility} />
      ))}
    </View>
  );
}
