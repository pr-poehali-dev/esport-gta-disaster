import { useEffect, useRef } from 'react';

interface NotificationSoundProps {
  play: boolean;
  onEnd?: () => void;
}

export default function NotificationSound({ play, onEnd }: NotificationSoundProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (play && audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  }, [play]);

  return (
    <audio
      ref={audioRef}
      onEnded={onEnd}
      preload="auto"
    >
      <source
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUKzn77RgGwU7k9r0yXksBSh+zPLaizsKFF+45+ujVhMJQ5zd8sFtIAUsgs7y2Ik2CBtpvfDknE4MDlCs5++zXxsGO5Ha9Ml5LAUofszy2os7ChRfuOfrpFYTCUOc3fLBbSAFLILO8tmJNwgaab3w5JxODA5QrOfvs18bBjqR2vTJeSwFKH7M8tuKOwoUX7jn66RWEwlDnN3ywW0gBSyCzvLZiTcIG2m98OScTgwOUKzn77NfGwY6kdr0yXksBSh+zPLbizsKFF+45+ukVhMJQ5zd8sFtIAUsgs7y2Yk3CBtpvfDknE4MDlCs5++zXxsGOpHa9Ml5LAUofszy24s7ChRfuOfrpFYTCUOc3fLBbSAFLILO8tmJNwgbab3w5JxODA5QrOfvs18bBjqR2vTJeSwFKH7M8tuLOwoUX7jn66RWEwlDnN3ywW0gBSyCzvLZiTcIG2m98OScTgwOUKzn77NfGwY6kdr0yXksBSh+zPLbizsKFF+45+ukVhMJQ5zd8sFtIAUsgs7y2Yk3CBtpvfDknE4MDlCs5++zXxsGOpHa9Ml5LAUofszy24s7ChRfuOfrpFYTCUOc3fLBbSAFLILO8tmJNwgbab3w5JxODA5QrOfvs18bBjqR2vTJeSwFKH7M8tuLOwoUX7jn66RWEwlDnN3ywW0gBSyCzvLZiTcIG2m98OScTgwOUKzn77NfGwY6kdr0yXksBSh+zPLbizsKFF+45+ukVhMJQ5zd8sFtIAUsgs7y2Yk3CBtpvfDknE4MDlCs5++zXxsGOpHa9Ml5LAUofszy24s7ChRfuOfrpFYTCUOc3fLBbSAFLILO8tmJNwgbab3w5JxODA5QrOfvs18bBjqR2vTJeSwFKH7M8tuLOwoUX7jn66RWEwlDnN3ywW0gBSyCzvLZiTcIG2m98OScTgwOUKzn77NfGwY6kdr0yXksBSh+zPLbizsKFF+45+ukVhMJQ5zd8sFtIAUsgs7y2Yk3CBtpvfDknE4MDlCs5++zXxsGOpHa9Ml5LAUofszy24s7ChRfuOfrpFYTCUOc3fLBbSAFLILO8tmJNwgbab3w5JxODA5QrOfvs18bBjqR2vTJeSwFKH7M8tuLOwoUX7jn66RWEwlDnN3ywW0gBSyCzvLZiTcIG2m98OScTgwOUKzn77NfGwY="
        type="audio/wav"
      />
    </audio>
  );
}
