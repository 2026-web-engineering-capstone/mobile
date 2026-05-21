import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { BRAND_TOKENS, pretendard } from '@/lib/design-tokens';
import { GyoumCTA } from './gyoum-primitives';

interface EmptyViewProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyView({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: EmptyViewProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 24,
        paddingVertical: 40,
      }}
      accessibilityRole="text"
    >
      {icon ? <View style={{ marginBottom: 8 }}>{icon}</View> : null}
      <Text
        style={{
          textAlign: 'center',
          fontFamily: pretendard('600'),
          fontWeight: '600',
          fontSize: 18,
          color: BRAND_TOKENS.text,
        }}
      >
        {title}
      </Text>
      {description ? (
        <Text
          style={{
            textAlign: 'center',
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
      {actionLabel && onAction ? (
        <View style={{ marginTop: 8, alignSelf: 'stretch' }}>
          <GyoumCTA variant="primary" size="md" onPress={onAction}>
            {actionLabel}
          </GyoumCTA>
        </View>
      ) : null}
    </View>
  );
}
