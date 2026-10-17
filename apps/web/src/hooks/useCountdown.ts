'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCountdown(initialSeconds: number, onComplete?: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      if (onComplete) {
        onComplete();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft, onComplete]);

  const start = useCallback((secs?: number) => {
    if (secs !== undefined) {
      setSecondsLeft(secs);
    }
    setIsActive(true);
  }, []);

  const pause = useCallback(() => setIsActive(false), []);
  const reset = useCallback((secs = initialSeconds) => {
    setIsActive(false);
    setSecondsLeft(secs);
  }, [initialSeconds]);

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSeconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

  return { secondsLeft, formattedTime, isActive, start, pause, reset };
}
