import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import React from 'react';
import { act, create } from 'react-test-renderer';

const require = createRequire(import.meta.url);
const useLatestCallback = require('./use-latest-callback.ts') as <T extends (...args: never[]) => unknown>(
  callback: T,
) => T;

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

test('useLatestCallback preserves this binding for the returned callback', () => {
  let latestCallback!: (this: { count: number }, delta: number) => number;

  function Harness() {
    latestCallback = useLatestCallback(function (this: { count: number }, delta: number) {
      this.count += delta;
      return this.count;
    });

    return null;
  }

  act(() => {
    create(React.createElement(Harness));
  });

  const receiver = { count: 1 };

  assert.equal(latestCallback.call(receiver, 2), 3);
  assert.equal(receiver.count, 3);
});

test('useLatestCallback returns a stable function that calls the latest callback', () => {
  let latestCallback!: (delta: number) => number;
  let offset = 1;

  function Harness() {
    latestCallback = useLatestCallback((delta: number) => delta + offset);
    return null;
  }

  let renderer!: ReturnType<typeof create>;

  act(() => {
    renderer = create(React.createElement(Harness));
  });

  const firstCallback = latestCallback;
  assert.equal(firstCallback(2), 3);

  offset = 5;

  act(() => {
    renderer.update(React.createElement(Harness));
  });

  assert.equal(latestCallback, firstCallback);
  assert.equal(firstCallback(2), 7);
});
