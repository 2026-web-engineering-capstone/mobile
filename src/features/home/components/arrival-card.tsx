import { Text, View } from 'react-native';
import { Card, Separator } from 'heroui-native';

type ArrivalRow = {
  destination: string;
  eta: string;
};

type ArrivalCardProps = {
  title: string;
  rows: ArrivalRow[];
  width: number;
};

export function ArrivalCard({ rows, title, width }: ArrivalCardProps) {
  return (
    <Card
      className="rounded-[6px] border border-[#e3e3e3] bg-white shadow-none"
      style={{ width }}
    >
      <Card.Body className="gap-3 px-3 py-3">
        <Text className="text-[14px] font-bold text-[#111111]">{title}</Text>
        <Separator />
        {rows.map((row) => (
          <View
            key={`${title}-${row.destination}-${row.eta}`}
            className="flex-row items-center justify-between"
          >
            <Text className="text-[12px] text-[#8a8a8a]">{row.destination}</Text>
            <Text className="text-[12px] font-medium text-[#759cce]">
              {row.eta}
            </Text>
          </View>
        ))}
      </Card.Body>
    </Card>
  );
}
