import { useState, useEffect } from 'react';

/**
 * @param {boolean} isLoading - Actual 
 * @param {number} minDelay - Minimum ( 800ms)
 * @returns {boolean} - Loading state
 */
export function useMinimumDelay(isLoading, minDelay = 800) {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (isLoading) {
      // Start loading
      setShowLoading(true);
      setStartTime(Date.now());
    } else if (startTime) {
      // Loading finished 
      const elapsed = Date.now() - startTime;
      const remaining = minDelay - elapsed;

      if (remaining > 0) {
        // Wait for remaining time 
        const timer = setTimeout(() => {
          setShowLoading(false);
          setStartTime(null);
        }, remaining);
        return () => clearTimeout(timer);
      } else {
        // Minimum time already
        setShowLoading(false);
        setStartTime(null);
      }
    }
  }, [isLoading, startTime, minDelay]);

  return showLoading;
}
