function parseApiDate(value: string) {
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

export function formatKoreanDateTime(value: string) {
  return parseApiDate(value).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
  });
}

export function formatKoreanTime(value: string) {
  return parseApiDate(value).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  });
}
