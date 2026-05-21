#!/usr/bin/env node
/**
 * Design SSOT 회귀 방지 스크립트.
 *
 * DESIGN.md를 SSOT로 하는 디자인 시스템에서 화면 코드 안 hex literal(#abcdef)이
 * 토큰을 우회하는 경우를 차단한다.
 *
 * 화이트리스트:
 *   - src/lib/design-tokens.ts       (BRAND_TOKENS, LineMeta 정의)
 *   - src/global.css                  (Uniwind/Tailwind theme)
 *   - LineMeta·노선 색 데이터 픽스처:
 *       src/features/home/data/station-catalog.ts
 *       src/features/support-request/types.ts
 *   - 테스트 파일 (*.test.ts, *.test.tsx)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src');

const WHITELIST = new Set([
  'src/lib/design-tokens.ts',
  'src/global.css',
  'src/features/home/data/station-catalog.ts',
  'src/features/support-request/types.ts',
]);

const HEX_RE = /#[0-9a-fA-F]{6}\b/g;
// 어두운 카드 위 흰색 알파 패턴. design-tokens.ts의 onBrand* 토큰을 우회하는 경우를 차단한다.
const WHITE_ALPHA_RE = /rgba\(\s*255\s*,\s*255\s*,\s*255/gi;

/** 디렉터리를 재귀 순회하며 ts/tsx 파일 경로 목록을 모은다. */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const violations = [];
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).replaceAll('\\', '/');
  if (WHITELIST.has(rel)) continue;

  const text = readFileSync(file, 'utf8');

  for (const m of text.matchAll(HEX_RE)) {
    const offset = m.index ?? 0;
    const line = text.slice(0, offset).split('\n').length;
    violations.push({ rel, line, value: m[0] });
  }

  for (const m of text.matchAll(WHITE_ALPHA_RE)) {
    const offset = m.index ?? 0;
    const line = text.slice(0, offset).split('\n').length;
    violations.push({ rel, line, value: m[0] + '...' });
  }
}

if (violations.length > 0) {
  console.error('[check:design] hex literal violation in non-whitelisted files:');
  for (const v of violations) {
    console.error(`  ${v.rel}:${v.line}  ${v.value}`);
  }
  console.error(`\n${violations.length} violations. 토큰 사용 또는 화이트리스트 확장이 필요합니다.`);
  process.exit(1);
}

console.log('[check:design] OK — non-whitelisted files have no hex literals.');
