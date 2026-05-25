import type { ArrivalTrain } from '@/features/transit/types';

export function getLiveEtaLabel(
  train: ArrivalTrain,
  fetchedAt: number,
  nowMs: number,
) {
  if (typeof train.etaSeconds !== 'number') {
    return train.etaMessage || '도착 정보 없음';
  }

  const fetchedAtMs = fetchedAt < 10_000_000_000 ? fetchedAt * 1000 : fetchedAt;
  const remainingSeconds = Math.max(
    0,
    Math.ceil((fetchedAtMs + train.etaSeconds * 1000 - nowMs) / 1000),
  );

  if (remainingSeconds <= 0) {
    return train.etaMessage.includes('도착') ? train.etaMessage : '곧 도착';
  }

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  if (minutes <= 0) return `${seconds}초 후`;
  if (seconds === 0) return `${minutes}분 후`;
  return `${minutes}분 ${seconds}초 후`;
}
