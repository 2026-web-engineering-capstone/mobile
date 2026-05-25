const API_TZ_SUFFIX_RE = /[zZ]|[+-]\d{2}:?\d{2}$/;

export function parseApiDate(value: string) {
  return new Date(API_TZ_SUFFIX_RE.test(value) ? value : `${value}Z`);
}

export function formatKoreanDateTime(value: string) {
  const date = parseApiDate(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatKoreanTime(value: string | null | undefined) {
  if (!value) return '';
  const date = parseApiDate(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatKoreanDateTimeCompact(value: string | null | undefined) {
  if (!value) return '';
  const date = parseApiDate(value);
  if (Number.isNaN(date.getTime())) return '';

  const dateLabel = date.toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
  });

  return `${dateLabel} ${formatKoreanTime(value)}`;
}

export function elapsedMinutesFromApiDate(value: string, nowMs = Date.now()) {
  const created = parseApiDate(value).getTime();
  if (Number.isNaN(created)) return 0;
  return Math.max(0, Math.floor((nowMs - created) / 60000));
}

export function formatRelativeFromApiDate(value: string, nowMs = Date.now()) {
  const minutes = elapsedMinutesFromApiDate(value, nowMs);
  if (minutes <= 0) return '방금전';
  if (minutes < 60) return `${minutes}분전`;

  const created = parseApiDate(value);
  if (Number.isNaN(created.getTime())) return '방금전';

  const dateParts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const sameDay = dateParts.format(created) === dateParts.format(new Date(nowMs));

  if (sameDay) return `오늘 ${formatKoreanTime(value)}`;

  return `${created.toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  })} ${formatKoreanTime(value)}`;
}
