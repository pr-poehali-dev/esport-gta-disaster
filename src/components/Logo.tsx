import { useEffect, useState } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

export default function Logo({ className = "", showText = true, animated = true }: LogoProps) {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 5000);

    return () => clearInterval(interval);
  }, [animated]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${animated ? 'energy-pulse' : ''}`}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={glitch ? 'glitch-text' : ''}
        >
          <path
            d="M8 4L18 4L18 12L28 4L40 4L40 18L32 18L40 26L40 44L28 44L28 36L18 44L8 44L8 30L16 30L8 22L8 4Z"
            fill="url(#logo-gradient)"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
          />
          <path
            d="M14 14L14 20L20 14L14 14Z"
            fill="hsl(var(--card))"
          />
          <path
            d="M28 28L28 34L34 28L28 28Z"
            fill="hsl(var(--card))"
          />
          <defs>
            <linearGradient id="logo-gradient" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="hsl(var(--primary))" />
              <stop offset="1" stopColor="hsl(var(--secondary))" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`text-2xl font-black tracking-tighter text-gradient ${glitch ? 'glitch-text' : ''}`}>
            DISASTER
          </span>
          <span className="text-xs tracking-widest text-muted-foreground font-semibold">
            ESPORTS
          </span>
        </div>
      )}
    </div>
  );
}
