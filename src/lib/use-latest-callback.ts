const React = require('react') as typeof import('react');

type Callback = (...args: never[]) => unknown;

const useClientLayoutEffect =
  typeof document !== 'undefined' ||
  (typeof navigator !== 'undefined' && navigator.product === 'ReactNative')
    ? React.useLayoutEffect
    : React.useEffect;

function useLatestCallback<T extends Callback>(callback: T): T {
  const callbackRef = React.useRef(callback);
  const latestCallbackRef = React.useRef(
    (function (this: unknown, ...args: Parameters<T>) {
      return callbackRef.current.apply(this, args);
    }) as T,
  );

  useClientLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return latestCallbackRef.current;
}

module.exports = useLatestCallback;
module.exports.default = useLatestCallback;
