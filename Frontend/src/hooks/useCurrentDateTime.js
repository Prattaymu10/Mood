import { useEffect, useState } from "react";

/** Current Date, refreshed every minute (original: setInterval(updateDateTime, 60000)). */
export default function useCurrentDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  return now;
}
