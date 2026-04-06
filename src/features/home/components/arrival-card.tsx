import { Text, View } from 'react-native';
import { Card, Separator } from 'heroui-native';

type ArrivalRow = {
  destination: string;
  eta: string;
};

type ArrivalCardProps = {
  title: string;
  rows: ArrivalRow[];
  etaColor?: string;
};

export function ArrivalCard({ rows, title, etaColor }: ArrivalCardProps) {
  return (
    <Card className="min-w-0 flex-1 rounded-lg border border-default-200 bg-background shadow-none">
      <Card.Body className="gap-3">
        <Text className="text-sm font-bold leading-5 text-foreground">{title}</Text>
        <Separator />
        {rows.map((row) => (
          <View
            key={`${title}-${row.destination}-${row.eta}`}
            className="flex-row items-center justify-between"
          >
            <Text className="shrink text-xs text-default-400">{row.destination}</Text>
            <Text
              className="ml-3 text-xs font-medium"
              style={etaColor ? { color: etaColor } : undefined}
            >
              {row.eta}
            </Text>
          </View>
        ))}
      </Card.Body>
    </Card>
  );
}
