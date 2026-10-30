// Tracks requests that take suspiciously long (Render's free plan sleeps when
// idle and needs up to a minute to wake). The banner subscribes to this.
let slowCount = 0;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

/** Call when a request starts; call the returned function when it ends. */
export function trackSlowRequest(thresholdMs = 4000) {
  let slow = false;
  const timer = setTimeout(() => {
    slow = true;
    slowCount += 1;
    emit();
  }, thresholdMs);

  return () => {
    clearTimeout(timer);
    if (slow) {
      slowCount -= 1;
      emit();
    }
  };
}

export const subscribeSlow = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
export const getSlowSnapshot = () => slowCount > 0;
