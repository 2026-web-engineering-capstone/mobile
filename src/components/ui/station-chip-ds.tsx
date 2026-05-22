/**
 * 교움 디자인 시안 스타일의 역 선택 칩.
 *
 * Station 객체를 받아 노선 색 뱃지 + 역 이름 + 노선/출구 메타를 보여준다.
 * selected 시 인디고 보더 + brandLight 배경 + 체크 아이콘.
 */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { BRAND_TOKENS, RADIUS, getLineMeta, getOfficialLineName, pretendard } from '@/lib/design-tokens';
import { LineBadge } from './gyoum-primitives';
import { CheckIcon } from './icons';
import type { Station } from '@/lib/api/types';

interface StationChipDSProps {
  station: Station;
  selected?: boolean;
  onPress?: () => void;
  label?: string;
  size?: 'sm' | 'md';
}

export function StationChipDS({
  station,
  selected,
  onPress,
  label,
  size = 'md',
}: StationChipDSProps) {
  const lineMeta = getLineMeta(station.line);
  const lineName = getOfficialLineName(station.line);
  const padding = size === 'sm' ? 12 : 16;
  const fontSize = size === 'sm' ? 14 : 16;
  const badgeSize = size === 'sm' ? 32 : 36;

  const content = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingHorizontal: padding,
        paddingVertical: size === 'sm' ? 13 : 18,
        borderRadius: RADIUS.chip,
        backgroundColor: selected ? BRAND_TOKENS.brandLight : BRAND_TOKENS.surfaceAlt,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? BRAND_TOKENS.brand : BRAND_TOKENS.border,
      }}
    >
      <LineBadge char={lineMeta.char} color={lineMeta.color} size={badgeSize} />
      <View style={{ flex: 1 }}>
        {label ? (
          <Text
            style={{
              fontFamily: pretendard('500'),
              fontSize: 11,
              color: BRAND_TOKENS.textMuted,
              marginBottom: 2,
              fontWeight: '500',
            }}
          >
            {label}
          </Text>
        ) : null}
        <Text
          style={{
            fontFamily: pretendard('600'),
            fontSize,
            fontWeight: '600',
            color: BRAND_TOKENS.text,
            letterSpacing: -0.16,
          }}
        >
          {station.name}
        </Text>
        <Text
          style={{
            fontFamily: pretendard('500'),
            fontSize: 12,
            color: BRAND_TOKENS.textMuted,
            fontWeight: '500',
          }}
        >
          {lineName}
        </Text>
      </View>
      {selected ? (
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: BRAND_TOKENS.brand,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckIcon color={BRAND_TOKENS.onBrand100} size={14} />
        </View>
      ) : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${station.name} ${lineName}`}
      accessibilityState={{ selected: !!selected }}
    >
      {content}
    </Pressable>
  );
}
