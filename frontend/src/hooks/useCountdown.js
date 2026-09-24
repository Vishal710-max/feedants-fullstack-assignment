import { useEffect, useRef, useState } from 'react';

/**
 * Ticks every second toward `target` (ISO string). `offsetMs` = serverTime - deviceTime,
 * so a wrong device clock does not change the countdown. Calls onExpire once at zero.
 */
export default function useCountdown(target, offsetMs = 0, onExpire) {
  const compute = () => (target ? Math.max(0, new Date(target).getTime() - (Date.now() + offsetMs)) : 0);
  const [remaining, setRemaining] = useState(compute);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    if (!target) return undefined;
    setRemaining(compute());
    const id = setInterval(() => {
      const r = compute();
      setRemaining(r);
      if (r <= 0) {
        clearInterval(id);
        expireRef.current && expireRef.current();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, offsetMs]);

  const total = Math.floor(remaining / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    isDone: remaining <= 0,
  };
}
