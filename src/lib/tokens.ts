import type { SupportRequestStatus } from '@/features/support-request/types';

/**
 * 8가지 요청 상태에 대한 시각 토큰. global.css의 --color-status-* 와 일대일 매핑.
 * 다크/라이트 분기는 Uniwind의 dark variant에 위임하므로 className 문자열로 노출한다.
 */
export const STATUS_TONE: Record<
  SupportRequestStatus,
  {
    label: string;
    chipClassName: string;
    dotClassName: string;
    badgeBgClassName: string;
    badgeTextClassName: string;
  }
> = {
  submitted: {
    label: '요청 접수',
    chipClassName:
      'bg-status-submitted-bg text-status-submitted dark:bg-status-submitted-bg-dark dark:text-status-submitted-dark',
    dotClassName: 'bg-status-submitted dark:bg-status-submitted-dark',
    badgeBgClassName: 'bg-status-submitted-bg dark:bg-status-submitted-bg-dark',
    badgeTextClassName: 'text-status-submitted dark:text-status-submitted-dark',
  },
  assigned: {
    label: '담당자 배정',
    chipClassName:
      'bg-status-assigned-bg text-status-assigned dark:bg-status-assigned-bg-dark dark:text-status-assigned-dark',
    dotClassName: 'bg-status-assigned dark:bg-status-assigned-dark',
    badgeBgClassName: 'bg-status-assigned-bg dark:bg-status-assigned-bg-dark',
    badgeTextClassName: 'text-status-assigned dark:text-status-assigned-dark',
  },
  in_progress: {
    label: '역무원 도착',
    chipClassName:
      'bg-status-in-progress-bg text-status-in-progress dark:bg-status-in-progress-bg-dark dark:text-status-in-progress-dark',
    dotClassName: 'bg-status-in-progress dark:bg-status-in-progress-dark',
    badgeBgClassName:
      'bg-status-in-progress-bg dark:bg-status-in-progress-bg-dark',
    badgeTextClassName:
      'text-status-in-progress dark:text-status-in-progress-dark',
  },
  boarded: {
    label: '승차 완료',
    chipClassName:
      'bg-status-boarded-bg text-status-boarded dark:bg-status-boarded-bg-dark dark:text-status-boarded-dark',
    dotClassName: 'bg-status-boarded dark:bg-status-boarded-dark',
    badgeBgClassName: 'bg-status-boarded-bg dark:bg-status-boarded-bg-dark',
    badgeTextClassName: 'text-status-boarded dark:text-status-boarded-dark',
  },
  awaiting_dropoff: {
    label: '하차 처리 중',
    chipClassName:
      'bg-status-awaiting-dropoff-bg text-status-awaiting-dropoff dark:bg-status-awaiting-dropoff-bg-dark dark:text-status-awaiting-dropoff-dark',
    dotClassName:
      'bg-status-awaiting-dropoff dark:bg-status-awaiting-dropoff-dark',
    badgeBgClassName:
      'bg-status-awaiting-dropoff-bg dark:bg-status-awaiting-dropoff-bg-dark',
    badgeTextClassName:
      'text-status-awaiting-dropoff dark:text-status-awaiting-dropoff-dark',
  },
  completed: {
    label: '하차 완료',
    chipClassName:
      'bg-status-completed-bg text-status-completed dark:bg-status-completed-bg-dark dark:text-status-completed-dark',
    dotClassName: 'bg-status-completed dark:bg-status-completed-dark',
    badgeBgClassName: 'bg-status-completed-bg dark:bg-status-completed-bg-dark',
    badgeTextClassName:
      'text-status-completed dark:text-status-completed-dark',
  },
  cancelled: {
    label: '취소됨',
    chipClassName:
      'bg-status-cancelled-bg text-status-cancelled dark:bg-status-cancelled-bg-dark dark:text-status-cancelled-dark',
    dotClassName: 'bg-status-cancelled dark:bg-status-cancelled-dark',
    badgeBgClassName: 'bg-status-cancelled-bg dark:bg-status-cancelled-bg-dark',
    badgeTextClassName:
      'text-status-cancelled dark:text-status-cancelled-dark',
  },
  unavailable: {
    label: '지원 불가',
    chipClassName:
      'bg-status-unavailable-bg text-status-unavailable dark:bg-status-unavailable-bg-dark dark:text-status-unavailable-dark',
    dotClassName: 'bg-status-unavailable dark:bg-status-unavailable-dark',
    badgeBgClassName:
      'bg-status-unavailable-bg dark:bg-status-unavailable-bg-dark',
    badgeTextClassName:
      'text-status-unavailable dark:text-status-unavailable-dark',
  },
};

export const STATUS_ORDER: SupportRequestStatus[] = [
  'submitted',
  'assigned',
  'in_progress',
  'boarded',
  'awaiting_dropoff',
  'completed',
];

export const TERMINAL_STATUSES: SupportRequestStatus[] = [
  'completed',
  'cancelled',
  'unavailable',
];

/**
 * DESIGN.md typography 슬롯 — 10종.
 * 각 슬롯은 RN TextStyle 호환 형태로 노출된다.
 * 폰트 스케일(`lg`)은 fontSize/lineHeight에 배율을 곱해 접근성 확대를 지원한다.
 */
export type TypoSlot =
  | 'caption-xs'
  | 'caption'
  | 'meta'
  | 'label-caps'
  | 'body-sm'
  | 'body-md'
  | 'body'
  | 'body-lg'
  | 'number-lg'
  | 'title';

export interface TypoToken {
  readonly fontSize: number;
  readonly fontWeight:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
  readonly lineHeight: number;
  readonly letterSpacing?: number;
  readonly textTransform?: 'none' | 'uppercase';
}

/** DESIGN.md typography 블록을 RN style 단위(px → number)로 그대로 포팅. */
export const TEXT_SCALE: Readonly<Record<TypoSlot, TypoToken>> = {
  'caption-xs': {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.2, // 0.02em * 10
  },
  caption: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  meta: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  'label-caps': {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: -0.065, // -0.005em * 13
    textTransform: 'uppercase',
  },
  'body-sm': {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.14, // -0.01em * 14
  },
  'body-md': {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.15,
  },
  body: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.16,
  },
  'body-lg': {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.17,
  },
  'number-lg': {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.44, // -0.02em
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.78, // -0.03em
  },
};

export type FontScale = 'md' | 'lg';
