import { useState, useEffect, useRef } from "react";

/**
 * Ensures a loading state is shown for at least `minMs` milliseconds.
 * Prevents the spinner from flashing on/off too quickly.
 *
 * @param {boolean} isLoading - The real loading state from data fetching
 * @param {number}  minMs     - Minimum display time in ms (default 2000)
 * @returns {boolean} - The delayed loading state
 */
const useMinLoadingTime = (isLoading, minMs = 500) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const startRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      // Loading just started — record the timestamp
      startRef.current = Date.now();
      setShowLoading(true);
    } else if (startRef.current) {
      // Loading finished — keep spinner visible for remaining time
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, minMs - elapsed);

      if (remaining === 0) {
        setShowLoading(false);
      } else {
        const timer = setTimeout(() => setShowLoading(false), remaining);
        return () => clearTimeout(timer);
      }
    } else {
      // Was never loading (initial false state)
      setShowLoading(false);
    }
  }, [isLoading, minMs]);

  return showLoading;
};

export default useMinLoadingTime;
