import React from 'react';
import Svg, {
  Circle,
  Line,
  Path,
  Polyline,
  Polygon,
  Rect,
} from 'react-native-svg';
import { BRAND_TOKENS } from '@/lib/design-tokens';

type IconProps = {
  color?: string;
  size?: number;
};

type FilledIconProps = IconProps & { filled?: boolean };

const DEFAULT_COLOR = BRAND_TOKENS.text;

export function WheelchairIcon({ color = DEFAULT_COLOR, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="3.5" r="1.5" fill={color} />
      <Path
        d="M9 6v6h5l3 5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="9" cy="16" r="5" stroke={color} strokeWidth="1.6" />
      <Path
        d="M14 17l3-2"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function FootboardIcon({ color = DEFAULT_COLOR, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="2"
        y="14"
        width="20"
        height="3"
        rx="1"
        stroke={color}
        strokeWidth="1.6"
      />
      <Path
        d="M5 14l3-6h8l3 6"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 17v3M16 17v3"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CompanionIcon({ color = DEFAULT_COLOR, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="8" cy="6" r="2.5" stroke={color} strokeWidth="1.6" />
      <Circle cx="16" cy="6" r="2.5" stroke={color} strokeWidth="1.6" />
      <Path
        d="M3 20c0-3 2-5 5-5s5 2 5 5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <Path
        d="M11 20c0-3 2-5 5-5s5 2 5 5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ElevatorIcon({ color = DEFAULT_COLOR, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        stroke={color}
        strokeWidth="1.6"
      />
      <Line x1="12" y1="3" x2="12" y2="21" stroke={color} strokeWidth="1.6" />
      <Polyline
        points="6,11 8,8 10,11"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline
        points="14,13 16,16 18,13"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function VisionIcon({ color = DEFAULT_COLOR, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        stroke={color}
        strokeWidth="1.6"
      />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.6" />
    </Svg>
  );
}

export function ChatIcon({ color = DEFAULT_COLOR, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12a8 8 0 11-3-6.2L21 4l-1 4.5A8 8 0 0121 12z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PinIcon({ color = DEFAULT_COLOR, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s7-7 7-12a7 7 0 10-14 0c0 5 7 12 7 12z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="10" r="2.5" stroke={color} strokeWidth="1.6" />
    </Svg>
  );
}

export function StarIcon({
  color = DEFAULT_COLOR,
  size = 22,
  filled = false,
}: FilledIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Polygon
        points="12,2 14.9,8.6 22,9.3 16.5,14.2 18.2,21.2 12,17.5 5.8,21.2 7.5,14.2 2,9.3 9.1,8.6"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function BellIcon({ color = DEFAULT_COLOR, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 16V11a6 6 0 1112 0v5l1.5 2H4.5L6 16z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <Path
        d="M10 21h4"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PlusIcon({ color = DEFAULT_COLOR, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line
        x1="12"
        y1="5"
        x2="12"
        y2="19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Line
        x1="5"
        y1="12"
        x2="19"
        y2="12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function TrainIcon({ color = DEFAULT_COLOR, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="5"
        y="3"
        width="14"
        height="14"
        rx="3"
        stroke={color}
        strokeWidth="1.6"
      />
      <Line x1="5" y1="11" x2="19" y2="11" stroke={color} strokeWidth="1.6" />
      <Circle cx="9" cy="14" r="1" fill={color} />
      <Circle cx="15" cy="14" r="1" fill={color} />
      <Path
        d="M8 17l-2 4M16 17l2 4"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ClockIcon({ color = DEFAULT_COLOR, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.6" />
      <Polyline
        points="12,7 12,12 16,14"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function CheckIcon({ color = DEFAULT_COLOR, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="5,12 10,17 19,7"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronRightIcon({
  color = DEFAULT_COLOR,
  size = 20,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7 4l6 6-6 6"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronLeftIcon({
  color = DEFAULT_COLOR,
  size = 20,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArrowRightIcon({
  color = DEFAULT_COLOR,
  size = 16,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 10" fill="none">
      <Path
        d="M1 5h12M10 1l4 4-4 4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SearchIcon({ color = DEFAULT_COLOR, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Circle cx="9" cy="9" r="6.5" stroke={color} strokeWidth="1.6" />
      <Line
        x1="13.5"
        y1="13.5"
        x2="18"
        y2="18"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** SupportType별 아이콘 컴포넌트 매핑. */
export const SUPPORT_TYPE_ICONS = {
  footboard: FootboardIcon,
  companion: CompanionIcon,
  elevator: ElevatorIcon,
  vision: VisionIcon,
  wheelchair: WheelchairIcon,
  chat: ChatIcon,
} as const;
