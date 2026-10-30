import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Inline alert that fades out after `duration` ms (login/signup forms).
 * Returns [alert, showAlert]; alert = { message, type, leaving } | null
 */
export default function useTimedAlert(duration = 5000) {
  const [alert, setAlert] = useState(null);
  const timers = useRef([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const showAlert = useCallback(
    (message, type = "error") => {
      clearTimers();
      setAlert({ message, type, leaving: false });
      timers.current.push(
        setTimeout(
          () => setAlert((a) => (a ? { ...a, leaving: true } : a)),
          duration
        ),
        setTimeout(() => setAlert(null), duration + 300)
      );
    },
    [clearTimers, duration]
  );

  useEffect(() => clearTimers, [clearTimers]);

  return [alert, showAlert];
}
