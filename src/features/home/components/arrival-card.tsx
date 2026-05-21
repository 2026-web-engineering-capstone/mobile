import { Text, View } from 'react-native';
import { BRAND_TOKENS, pretendard } from '@/lib/design-tokens';
import { GyoumCard } from '@/components/ui/gyoum-primitives';

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
    <View style={{ flex: 1, minWidth: 0 }}>
      <GyoumCard padding={16}>
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily: pretendard('700'),
              fontWeight: '700',
              fontSize: 14,
              lineHeight: 20,
              color: BRAND_TOKENS.text,
            }}
          >
            {title}
          </Text>
          <View style={{ height: 1, backgroundColor: BRAND_TOKENS.border }} />
          {rows.map((row) => (
            <View
              key={`${title}-${row.destination}-${row.eta}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  flexShrink: 1,
                  fontFamily: pretendard('500'),
                  fontSize: 12,
                  color: BRAND_TOKENS.textMuted,
                }}
              >
                {row.destination}
              </Text>
              <Text
                style={{
                  marginLeft: 12,
                  fontFamily: pretendard('500'),
                  fontWeight: '500',
                  fontSize: 12,
                  color: etaColor ?? BRAND_TOKENS.text,
                }}
              >
                {row.eta}
              </Text>
            </View>
          ))}
        </View>
      </GyoumCard>
    </View>
  );
}
