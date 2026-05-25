const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function parseApiDate(value: string): Date {
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
}

function toKST(value: string): Date {
  const utc = parseApiDate(value);
  return new Date(utc.getTime() + KST_OFFSET_MS);
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function ampm(hours: number): string {
  return hours < 12 ? '오전' : '오후';
}

function hour12(hours: number): number {
  const h = hours % 12;
  return h === 0 ? 12 : h;
}

export function formatKoreanTime(value: string): string {
  const d = toKST(value);
  const h = d.getUTCHours();
  return `${ampm(h)} ${hour12(h)}:${pad2(d.getUTCMinutes())}`;
}

export function formatKoreanDateTime(value: string): string {
  const d = toKST(value);
  const y = d.getUTCFullYear();
  const m = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  const h = d.getUTCHours();
  return `${y}.${m}.${day} ${ampm(h)} ${hour12(h)}:${pad2(d.getUTCMinutes())}`;
}

export function formatKoreanDateOnly(value: string): string {
  const d = toKST(value);
  const y = d.getUTCFullYear();
  const m = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  return `${y}.${m}.${day}`;
}

export function elapsedMinutesSafe(createdAt: string): number {
  const created = parseApiDate(createdAt).getTime();
  if (Number.isNaN(created)) return 0;
  return Math.max(0, Math.floor((Date.now() - created) / 60_000));
}
