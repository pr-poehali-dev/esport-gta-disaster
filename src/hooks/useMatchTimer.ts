import { useState, useEffect } from 'react';

export function useMatchTimer(startedAt: string | null, minMinutes: number = 3) {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [canUpload, setCanUpload] = useState(false);

  useEffect(() => {
    if (!startedAt) {
      setTimeElapsed(0);
      setCanUpload(false);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startedAt).getTime();
      const elapsed = Math.floor((now - start) / 1000);
      
      setTimeElapsed(elapsed);
      setCanUpload(elapsed >= minMinutes * 60);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, minMinutes]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, minMinutes * 60 - timeElapsed);

  return {
    timeElapsed,
    canUpload,
    formattedTime: formatTime(timeElapsed),
    remainingTime: formatTime(remainingSeconds),
    progress: Math.min(100, (timeElapsed / (minMinutes * 60)) * 100)
  };
}
