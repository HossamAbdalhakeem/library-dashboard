export function useThrottledCallback(callback, delayMs = 400) {
  let timer = null;
  let lastRunAt = 0;

  const run = (...args) => {
    const now = Date.now();
    const remaining = delayMs - (now - lastRunAt);

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    const execute = () => {
      lastRunAt = Date.now();
      callback(...args);
    };

    if (remaining <= 0) {
      execute();
      return;
    }

    timer = setTimeout(execute, remaining);
  };

  const cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  onBeforeUnmount(cancel);

  return { run, cancel };
}
