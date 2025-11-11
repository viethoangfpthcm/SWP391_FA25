import { useState, useEffect } from 'react';

/**
 * Custom hook to ensure loading state shows for a minimum duration
 * This provides better UX by preventing flash of loading state
 * 
 * @param {boolean} isLoading - Actual loading state
 * @param {number} minDelay - Minimum delay in milliseconds (default: 800ms)
 * @returns {boolean} - Loading state that respects minimum delay
 */
export function useMinimumDelay(isLoading, minDelay = 800) {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (isLoading) {
      // Start loading - record start time
      setShowLoading(true);
      setStartTime(Date.now());
    } else if (startTime) {
      // Loading finished - check if minimum time elapsed
      const elapsed = Date.now() - startTime;
      const remaining = minDelay - elapsed;

      if (remaining > 0) {
        // Wait for remaining time before hiding loading
        const timer = setTimeout(() => {
          setShowLoading(false);
          setStartTime(null);
        }, remaining);
        return () => clearTimeout(timer);
      } else {
        // Minimum time already elapsed
        setShowLoading(false);
        setStartTime(null);
      }
    }
  }, [isLoading, startTime, minDelay]);

  return showLoading;
}
