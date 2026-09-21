export function useDebouncedCallback(callback, delayMs = 400) {
  let timer = null;

  const run = (...args) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = null;
      callback(...args);
    }, delayMs);
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
