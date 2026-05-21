import { PropsWithChildren } from 'react';
import { Text, View } from 'react-native';
import { BRAND_TOKENS, pretendard } from '@/lib/design-tokens';
import { GyoumCard } from './gyoum-primitives';

type SectionCardProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  description?: string;
}>;

export function SectionCard({
  children,
  description,
  eyebrow,
  title,
}: SectionCardProps) {
  return (
    <GyoumCard>
      <View style={{ gap: 16 }}>
        <View style={{ gap: 4 }}>
          {eyebrow ? (
            <Text
              style={{
                fontFamily: pretendard('600'),
                fontWeight: '600',
                fontSize: 12,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: BRAND_TOKENS.accent,
              }}
            >
              {eyebrow}
            </Text>
          ) : null}
          <Text
            style={{
              fontFamily: pretendard('700'),
              fontWeight: '700',
              fontSize: 22,
              lineHeight: 32,
              color: BRAND_TOKENS.text,
            }}
          >
            {title}
          </Text>
          {description ? (
            <Text
              style={{
                fontFamily: pretendard('500'),
                fontWeight: '500',
                fontSize: 14,
                lineHeight: 22,
                color: BRAND_TOKENS.textMuted,
              }}
            >
              {description}
            </Text>
          ) : null}
        </View>
        <View
          style={{
            height: 1,
            backgroundColor: BRAND_TOKENS.border,
            opacity: 0.5,
          }}
        />
        {children}
      </View>
    </GyoumCard>
  );
}
