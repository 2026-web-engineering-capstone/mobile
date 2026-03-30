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
    <View className="w-1/2 flex-row items-center gap-[10px]">
      <View className="h-6 w-6 items-center justify-center rounded-full border border-[#d9d9d9]">
        {!available ? (
          <Text className="text-[18px] leading-[18px] text-[#d9d9d9]">/</Text>
        ) : null}
      </View>
      <Text
        className={
          available
            ? 'text-[14px] text-[#111111]'
            : 'text-[14px] text-[#dedede]'
        }
      >
        {label}
      </Text>
    </View>
  );
}

export function FacilitiesGrid({ facilities }: FacilitiesGridProps) {
  return (
    <View className="flex-row flex-wrap gap-y-[18px]">
      {facilities.map((facility) => (
        <FacilityItem key={facility.label} {...facility} />
      ))}
    </View>
  );
}
