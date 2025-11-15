import { useState, useEffect } from 'react';

export function useMinimumDelay(isLoading, minDelay = 800) {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
      setStartTime(Date.now());
    } else if (startTime) {
      const elapsed = Date.now() - startTime;
      const remaining = minDelay - elapsed;

      if (remaining > 0) {
        const timer = setTimeout(() => {
          setShowLoading(false);
          setStartTime(null);
        }, remaining);
        return () => clearTimeout(timer);
      } else {
        setShowLoading(false);
        setStartTime(null);
      }
    }
  }, [isLoading, startTime, minDelay]);

  return showLoading;
}
