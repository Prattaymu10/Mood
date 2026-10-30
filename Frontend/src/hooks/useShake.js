import { useCallback, useEffect, useRef, useState } from "react";

/** Re-triggerable "shake" animation flag for form validation errors. */
export default function useShake(duration = 500) {
  const [shaking, setShaking] = useState(false);
  const timer = useRef();

  const shake = useCallback(() => {
    clearTimeout(timer.current);
    setShaking(false);
    requestAnimationFrame(() => {
      setShaking(true);
      timer.current = setTimeout(() => setShaking(false), duration);
    });
  }, [duration]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return [shaking, shake];
}
