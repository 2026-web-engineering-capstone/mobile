/**
 * 교움 화면 공통 wrapper.
 *
 * 모든 라우트 화면(33개)의 최상위에 위치해 SafeArea·배경·기본 padding을 일관 적용한다.
 * DESIGN.md "Layout system"의 "screen 그라운드(`bg`)" 규칙을 코드 한 곳에 집약한다.
 *
 *   props.background  bg(기본) | surface | brand | brandDark | transparent
 *   props.scrollable  true면 ScrollView로 래핑
 *   props.padded      true(기본)면 좌우 16(SPACING.base) 패딩
 *   props.edges       SafeArea를 적용할 변. 기본 top+bottom.
 */

import type { PropsWithChildren, ReactNode } from 'react';
import {
  ScrollView,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND_TOKENS, SPACING } from '@/lib/design-tokens';

export type ScreenBackground = 'bg' | 'surface' | 'brand' | 'brandDark' | 'transparent';
export type ScreenEdge = 'top' | 'bottom';

interface ScreenProps {
  background?: ScreenBackground;
  scrollable?: boolean;
  padded?: boolean;
  edges?: readonly ScreenEdge[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle' | 'style'>;
  header?: ReactNode;
  footer?: ReactNode;
}

const BACKGROUND_MAP: Record<ScreenBackground, string> = {
  bg: BRAND_TOKENS.bg,
  surface: BRAND_TOKENS.surface,
  brand: BRAND_TOKENS.brand,
  brandDark: BRAND_TOKENS.brandDark,
  transparent: 'transparent',
};

export function Screen({
  children,
  background = 'bg',
  scrollable = false,
  padded = true,
  edges = ['top', 'bottom'],
  style,
  contentStyle,
  scrollProps,
  header,
  footer,
}: PropsWithChildren<ScreenProps>) {
  const insets = useSafeAreaInsets();
  const paddingTop = edges.includes('top') ? insets.top : 0;
  const paddingBottom = edges.includes('bottom') ? insets.bottom : 0;
  const horizontalPad = padded ? SPACING.base : 0;

  const rootStyle: ViewStyle = {
    flex: 1,
    backgroundColor: BACKGROUND_MAP[background],
    paddingTop,
  };

  const innerPadding: ViewStyle = {
    paddingHorizontal: horizontalPad,
  };

  return (
    <View style={[rootStyle, style]}>
      {header}
      {scrollable ? (
        <ScrollView
          {...scrollProps}
          style={{ flex: 1 }}
          contentContainerStyle={[
            innerPadding,
            { paddingBottom: paddingBottom + SPACING.lg },
            contentStyle,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, paddingBottom }, innerPadding, contentStyle]}>{children}</View>
      )}
      {footer}
    </View>
  );
}
