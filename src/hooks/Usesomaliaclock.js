import { useEffect, useRef, useState } from "react";

/**
 * Demo-friendly server-corrected clock.
 * Returns a real JS Date, safe to compare directly against API timestamps.
 */
export const useServerClock = (serverTimeISO) => {
  const offsetRef = useRef(0); // ms to add to local time to match the server

  useEffect(() => {
    if (!serverTimeISO) return;
    const serverMs = new Date(serverTimeISO).getTime();
    if (Number.isNaN(serverMs)) return;
    offsetRef.current = serverMs - Date.now();
  }, [serverTimeISO]);

  const getNow = () => new Date(Date.now() + offsetRef.current);

  const [now, setNow] = useState(getNow);

  useEffect(() => {
    setNow(getNow());
    const id = setInterval(() => setNow(getNow()), 1000);
    return () => clearInterval(id);
  }, [serverTimeISO]);

  return now;
};
