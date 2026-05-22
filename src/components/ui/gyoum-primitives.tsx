/**
 * 교움 디자인 시안의 핵심 빌딩 블록 컴포넌트.
 *
 * 시안 `ui-kit.jsx`에서 직접 포팅. 각 컴포넌트는 시안 props 시그니처를 가능한 한
 * 유지하며 React Native(View/Pressable/Text) 기반으로 동작한다. Tailwind/Uniwind
 * className 대신 design-tokens.ts의 BRAND_TOKENS를 직접 style prop에 주입한다.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { BRAND_TOKENS, RADIUS, pretendard } from '@/lib/design-tokens';
import { CheckIcon, SearchIcon, ChevronLeftIcon } from './icons';

type ReactNode = React.ReactNode;

// ─── LineBadge ──────────────────────────────────────────
interface LineBadgeProps {
  char?: string;
  color?: string;
  size?: number;
}

export function LineBadge({
  char = '인',
  color = BRAND_TOKENS.line1Incheon,
  size = 24,
}: LineBadgeProps) {
  const inverted = color === 'white' || color === BRAND_TOKENS.onBrand100 || color === '#fff';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: inverted ? BRAND_TOKENS.onBrand18 : color,
        borderWidth: inverted ? 1.5 : 0,
        borderColor: inverted ? BRAND_TOKENS.onBrand60 : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: pretendard('700'),
          fontWeight: '700',
          fontSize: size * 0.5,
          color: BRAND_TOKENS.onBrand100,
          lineHeight: size * 0.6,
        }}
      >
        {char}
      </Text>
    </View>
  );
}

// ─── GyoumCard ──────────────────────────────────────────
interface GyoumCardProps {
  children: ReactNode;
  padding?: number;
  accent?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function GyoumCard({
  children,
  padding = 20,
  accent = false,
  style,
  onPress,
  accessibilityLabel,
}: GyoumCardProps) {
  const innerStyle: ViewStyle = {
    backgroundColor: BRAND_TOKENS.surface,
    borderRadius: RADIUS.card,
    padding,
    borderWidth: 1,
    borderColor: accent ? BRAND_TOKENS.brand : BRAND_TOKENS.border,
  };

  // DESIGN.md "card-accent": 1px primary 보더 + 0 0 0 3px primary-container 글로우.
  // RN에는 box-shadow ring이 없어 외부 View로 ring을 시뮬레이션한다.
  if (accent) {
    const ringStyle: ViewStyle = {
      backgroundColor: BRAND_TOKENS.brandLight,
      borderRadius: RADIUS.card + 3,
      padding: 3,
    };
    if (onPress) {
      return (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          style={({ pressed }) => [ringStyle, style, pressed && { opacity: 0.92 }]}
        >
          <View style={innerStyle}>{children}</View>
        </Pressable>
      );
    }
    return (
      <View style={[ringStyle, style]} accessibilityLabel={accessibilityLabel}>
        <View style={innerStyle}>{children}</View>
      </View>
    );
  }

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [innerStyle, style, pressed && { opacity: 0.92 }]}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View style={[innerStyle, style]} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
}

// ─── GyoumCTA ──────────────────────────────────────────
/**
 * DESIGN.md "큰 CTA 9종 + 사이즈 변형" 사양.
 *  - variant: primary / accent / success / danger / ghost / soft / accent-soft
 *  - size:    lg(56) / md(48) / sm(40)
 *  - disabled: outline-strong 배경 + opacity 0.5
 *  - pressedScale 0.98 transform 피드백
 */
export type CTAVariant =
  | 'primary'
  | 'accent'
  | 'success'
  | 'danger'
  | 'ghost'
  | 'soft'
  | 'accent-soft';
export type CTASize = 'sm' | 'md' | 'lg';

interface GyoumCTAProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: CTAVariant;
  size?: CTASize;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  leadingIcon?: ReactNode;
}

const CTA_BG: Record<CTAVariant, string> = {
  primary: BRAND_TOKENS.brand,
  accent: BRAND_TOKENS.accent,
  success: BRAND_TOKENS.success,
  danger: BRAND_TOKENS.danger,
  ghost: BRAND_TOKENS.surface,
  soft: BRAND_TOKENS.brandLight,
  'accent-soft': BRAND_TOKENS.accentLight,
};

const CTA_FG: Record<CTAVariant, string> = {
  primary: BRAND_TOKENS.textOnDark,
  accent: BRAND_TOKENS.textOnDark,
  success: BRAND_TOKENS.textOnDark,
  danger: BRAND_TOKENS.textOnDark,
  ghost: BRAND_TOKENS.brand,
  soft: BRAND_TOKENS.brand,
  'accent-soft': BRAND_TOKENS.accent,
};

const CTA_HEIGHT: Record<CTASize, number> = { sm: 40, md: 48, lg: 56 };
const CTA_FONT: Record<CTASize, number> = { sm: 14, md: 15, lg: 17 };
const CTA_FONT_WEIGHT: Record<CTASize, '500' | '600'> = {
  sm: '500',
  md: '600',
  lg: '600',
};

export function GyoumCTA({
  children,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  fullWidth = true,
  accessibilityLabel,
  leadingIcon,
}: GyoumCTAProps) {
  const bg = disabled ? BRAND_TOKENS.borderStrong : CTA_BG[variant];
  const fg = disabled ? BRAND_TOKENS.textOnDark : CTA_FG[variant];
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => ({
        width: fullWidth ? '100%' : undefined,
        minWidth: fullWidth ? undefined : 80,
        paddingHorizontal: fullWidth ? 24 : 24,
        height: CTA_HEIGHT[size],
        borderRadius: RADIUS.button,
        backgroundColor: bg,
        borderWidth: variant === 'ghost' && !disabled ? 1.5 : 0,
        borderColor: variant === 'ghost' ? BRAND_TOKENS.border : 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
        transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
      })}
    >
      {leadingIcon ? (
        <View style={{ marginRight: 8 }}>{leadingIcon}</View>
      ) : null}
      <Text
        style={{
          color: fg,
          fontFamily: pretendard(CTA_FONT_WEIGHT[size]),
          fontWeight: CTA_FONT_WEIGHT[size],
          fontSize: CTA_FONT[size],
          letterSpacing: -(CTA_FONT[size] * 0.01),
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

// ─── PulseDot ──────────────────────────────────────────
interface PulseDotProps {
  color?: string;
  size?: number;
}

export function PulseDot({ color = BRAND_TOKENS.brand, size = 10 }: PulseDotProps) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

// ─── SectionLabel ──────────────────────────────────────
interface SectionLabelProps {
  children: ReactNode;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SectionLabel({ children, action, style }: SectionLabelProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: pretendard('600'),
          fontSize: 13,
          fontWeight: '600',
          color: BRAND_TOKENS.textMuted,
          letterSpacing: 0.4,
        }}
      >
        {typeof children === 'string' ? children.toUpperCase() : children}
      </Text>
      {action}
    </View>
  );
}

// ─── PageTitle ──────────────────────────────────────────
interface PageTitleProps {
  children: ReactNode;
  sub?: ReactNode;
}

export function PageTitle({ children, sub }: PageTitleProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontFamily: pretendard('700'),
          fontSize: 26,
          fontWeight: '700',
          color: BRAND_TOKENS.text,
          letterSpacing: -0.78,
          lineHeight: 32,
        }}
      >
        {children}
      </Text>
      {sub ? (
        <Text
          style={{
            fontFamily: pretendard('600'),
            fontSize: 15,
            fontWeight: '600',
            color: BRAND_TOKENS.textMuted,
            marginTop: 8,
            letterSpacing: -0.15,
            lineHeight: 22,
          }}
        >
          {sub}
        </Text>
      ) : null}
    </View>
  );
}

// ─── BottomBar ──────────────────────────────────────────
interface BottomBarProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function BottomBar({ children, style }: BottomBarProps) {
  return (
    <View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 34,
          backgroundColor: BRAND_TOKENS.bg + 'F2',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ─── Divider ──────────────────────────────────────────
interface DividerProps {
  inset?: number;
}

export function Divider({ inset = 20 }: DividerProps) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: BRAND_TOKENS.border,
        marginHorizontal: inset,
      }}
    />
  );
}

// ─── ToggleChip ──────────────────────────────────────
interface ToggleChipProps {
  icon: ReactNode;
  label: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
}

export function ToggleChip({
  icon,
  label,
  sub,
  selected,
  onPress,
}: ToggleChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: RADIUS.chip,
        backgroundColor: selected ? BRAND_TOKENS.brandLight : BRAND_TOKENS.surface,
        borderWidth: 1.5,
        borderColor: selected ? BRAND_TOKENS.brand : BRAND_TOKENS.border,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: selected ? BRAND_TOKENS.brand : BRAND_TOKENS.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: pretendard('600'),
            fontSize: 15,
            fontWeight: '600',
            color: BRAND_TOKENS.text,
            letterSpacing: -0.15,
          }}
        >
          {label}
        </Text>
        {sub ? (
          <Text
            style={{
              fontFamily: pretendard('500'),
              fontSize: 12,
              fontWeight: '500',
              color: BRAND_TOKENS.textMuted,
              marginTop: 2,
            }}
          >
            {sub}
          </Text>
        ) : null}
      </View>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: selected ? BRAND_TOKENS.brand : BRAND_TOKENS.borderStrong,
          backgroundColor: selected ? BRAND_TOKENS.brand : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? <CheckIcon color={BRAND_TOKENS.onBrand100} size={14} /> : null}
      </View>
    </Pressable>
  );
}

// ─── GyoumSearchInput ──────────────────────────────────
interface GyoumSearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onClear?: () => void;
}

export function GyoumSearchInput({
  value,
  onChangeText,
  placeholder,
  autoFocus,
  onClear,
}: GyoumSearchInputProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        height: 52,
        borderRadius: RADIUS.chip,
        backgroundColor: BRAND_TOKENS.surfaceAlt,
        borderWidth: 1,
        borderColor: BRAND_TOKENS.border,
      }}
    >
      <SearchIcon color={BRAND_TOKENS.textMuted} size={20} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={BRAND_TOKENS.textMuted}
        autoFocus={autoFocus}
        style={{
          flex: 1,
          fontFamily: pretendard('600'),
          fontSize: 16,
          fontWeight: '600',
          color: BRAND_TOKENS.text,
          letterSpacing: -0.16,
        }}
      />
      {value && onClear ? (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="검색어 지우기"
          hitSlop={8}
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: BRAND_TOKENS.borderStrong,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: BRAND_TOKENS.onBrand100,
              fontSize: 14,
              fontWeight: '700',
              lineHeight: 16,
            }}
          >
            ✕
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ─── GyoumAppBar ──────────────────────────────────────
interface GyoumAppBarProps {
  title?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onBack?: () => void;
  transparent?: boolean;
  topInset?: number;
}

export function GyoumAppBar({
  title,
  leading,
  trailing,
  onBack,
  transparent,
  topInset = 0,
}: GyoumAppBarProps) {
  return (
    <View
      style={{
        paddingTop: topInset,
        backgroundColor: transparent ? 'transparent' : BRAND_TOKENS.surface,
        borderBottomWidth: transparent ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: BRAND_TOKENS.border,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 8,
          paddingHorizontal: 20,
          paddingBottom: 12,
          height: 56,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            minWidth: 40,
          }}
        >
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="뒤로"
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: BRAND_TOKENS.bg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronLeftIcon color={BRAND_TOKENS.text} size={20} />
            </Pressable>
          ) : (
            leading
          )}
        </View>
        <Text
          numberOfLines={1}
          style={{
            fontFamily: pretendard('600'),
            fontSize: 16,
            fontWeight: '600',
            color: BRAND_TOKENS.text,
            flex: 1,
            textAlign: 'center',
            letterSpacing: -0.16,
          }}
        >
          {title ?? ''}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            minWidth: 40,
            justifyContent: 'flex-end',
          }}
        >
          {trailing}
        </View>
      </View>
    </View>
  );
}

// ─── MiniMap ──────────────────────────────────────
/**
 * DESIGN.md "mini-map" 컨테이너 사양:
 *   - 높이 160
 *   - rounded.chip (14)
 *   - surface-alt 베이스
 *   - 내부 children은 호출자가 자유 구성(지도, 펄스 도트 등)
 */
interface MiniMapProps {
  children?: ReactNode;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function MiniMap({ children, height = 160, style }: MiniMapProps) {
  return (
    <View
      style={[
        {
          width: '100%',
          height,
          borderRadius: RADIUS.chip,
          backgroundColor: BRAND_TOKENS.surfaceAlt,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: BRAND_TOKENS.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ─── NumberDisplay ───────────────────────────────
/**
 * DESIGN.md "number-display" — 요청 번호·ETA·큰 숫자 강조용.
 * typography.number-lg(22 / 700)로 통일.
 */
interface NumberDisplayProps {
  children: ReactNode;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function NumberDisplay({
  children,
  color = BRAND_TOKENS.text,
  style,
}: NumberDisplayProps) {
  return (
    <Text
      style={[
        {
          fontFamily: pretendard('700'),
          fontSize: 22,
          fontWeight: '700',
          lineHeight: 28,
          letterSpacing: -0.44,
          color,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ─── 타입 export ──────────────────────────────────────
export type GyoumTextStyle = StyleProp<TextStyle>;
export type GyoumViewStyle = StyleProp<ViewStyle>;
