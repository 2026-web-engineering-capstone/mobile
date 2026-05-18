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
    label: '접수',
    chipClassName:
      'bg-status-submitted-bg text-status-submitted dark:bg-status-submitted-bg-dark dark:text-status-submitted-dark',
    dotClassName: 'bg-status-submitted dark:bg-status-submitted-dark',
    badgeBgClassName: 'bg-status-submitted-bg dark:bg-status-submitted-bg-dark',
    badgeTextClassName: 'text-status-submitted dark:text-status-submitted-dark',
  },
  assigned: {
    label: '배정',
    chipClassName:
      'bg-status-assigned-bg text-status-assigned dark:bg-status-assigned-bg-dark dark:text-status-assigned-dark',
    dotClassName: 'bg-status-assigned dark:bg-status-assigned-dark',
    badgeBgClassName: 'bg-status-assigned-bg dark:bg-status-assigned-bg-dark',
    badgeTextClassName: 'text-status-assigned dark:text-status-assigned-dark',
  },
  in_progress: {
    label: '지원 중',
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
    label: '하차 대기',
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
    label: '완료',
    chipClassName:
      'bg-status-completed-bg text-status-completed dark:bg-status-completed-bg-dark dark:text-status-completed-dark',
    dotClassName: 'bg-status-completed dark:bg-status-completed-dark',
    badgeBgClassName: 'bg-status-completed-bg dark:bg-status-completed-bg-dark',
    badgeTextClassName:
      'text-status-completed dark:text-status-completed-dark',
  },
  cancelled: {
    label: '취소',
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
 * 폰트 스케일별 실제 크기 매핑. RN Text style에서 직접 사용.
 */
export const TEXT_SCALE = {
  md: {
    bodyXs: 12,
    bodySm: 14,
    body: 16,
    bodyLg: 18,
    titleSm: 20,
    title: 24,
    titleLg: 30,
    titleXl: 36,
  },
  lg: {
    bodyXs: 14,
    bodySm: 16,
    body: 18,
    bodyLg: 20,
    titleSm: 24,
    title: 28,
    titleLg: 34,
    titleXl: 40,
  },
} as const;

export type FontScale = keyof typeof TEXT_SCALE;
