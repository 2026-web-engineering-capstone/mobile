import { Text, View } from 'react-native';
import { BRAND_TOKENS, RADIUS, pretendard } from '@/lib/design-tokens';
import { GyoumCTA } from './gyoum-primitives';

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorView({
  title = '오류가 발생했어요',
  message = '잠시 후 다시 시도해 주세요.',
  onRetry,
}: ErrorViewProps) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        borderRadius: RADIUS.card,
        backgroundColor: BRAND_TOKENS.dangerBg,
        paddingHorizontal: 24,
        paddingVertical: 32,
      }}
      accessibilityRole="alert"
    >
      <Text
        style={{
          textAlign: 'center',
          fontFamily: pretendard('600'),
          fontWeight: '600',
          fontSize: 18,
          color: BRAND_TOKENS.danger,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          textAlign: 'center',
          fontFamily: pretendard('500'),
          fontWeight: '500',
          fontSize: 14,
          lineHeight: 22,
          color: BRAND_TOKENS.danger,
        }}
      >
        {message}
      </Text>
      {onRetry ? (
        <View style={{ marginTop: 8, alignSelf: 'stretch' }}>
          <GyoumCTA variant="soft" size="md" onPress={onRetry}>
            다시 시도
          </GyoumCTA>
        </View>
      ) : null}
    </View>
  );
}
