import { useEffect, useState } from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  animated?: boolean;
}

export default function Logo({ className = "", showText = true, animated = true }: LogoProps) {
  const [glitchActive, setGlitchActive] = useState(false);
  const [shatterActive, setShatterActive] = useState(false);

  useEffect(() => {
    if (!animated) return;
    
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 300);
    }, 6000);

    const shatterInterval = setInterval(() => {
      setShatterActive(true);
      setTimeout(() => setShatterActive(false), 400);
    }, 8000);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(shatterInterval);
    };
  }, [animated]);

  return (
    <div 
      className={`flex items-center gap-3 ${className} group cursor-pointer`}
      onMouseEnter={() => animated && setGlitchActive(true)}
      onMouseLeave={() => animated && setGlitchActive(false)}
    >
      <div 
        className={`relative energy-lines ${animated ? 'energy-pulse' : ''} ${glitchActive ? 'logo-glitch' : ''} ${shatterActive ? 'logo-shatter' : ''}`}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-110"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="hsl(195 100% 50%)" />
              <stop offset="50%" stopColor="hsl(271 76% 53%)" />
              <stop offset="100%" stopColor="hsl(195 100% 50%)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <g filter="url(#glow)">
            <path
              d="M10 6 L20 6 L20 10 L14 10 L14 16 L20 10 L30 10 L24 16 L30 22 L38 22 L38 10 L38 6 L38 6 L44 6 L44 20 L44 26 L38 26 L44 32 L44 42 L34 42 L34 38 L40 38 L40 32 L34 32 L28 26 L34 20 L24 20 L24 26 L30 32 L24 38 L20 38 L20 42 L10 42 L10 32 L10 28 L16 28 L10 22 L10 6 Z"
              fill="url(#logo-gradient)"
              stroke="hsl(195 100% 50%)"
              strokeWidth="0.5"
              className={glitchActive ? 'animate-pulse' : ''}
            />
            
            <circle cx="17" cy="13" r="2" fill="hsl(var(--card))" />
            <circle cx="31" cy="29" r="2" fill="hsl(var(--card))" />
            
            <path
              d="M14 16 L20 10"
              stroke="hsl(var(--card))"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M24 26 L30 32"
              stroke="hsl(var(--card))"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
          
          {glitchActive && (
            <>
              <rect x="10" y="6" width="2" height="4" fill="hsl(195 100% 50%)" opacity="0.6" />
              <rect x="42" y="38" width="2" height="4" fill="hsl(271 76% 53%)" opacity="0.6" />
            </>
          )}
        </svg>

        {animated && (
          <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />
        )}
      </div>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span 
            className={`text-2xl font-black tracking-tighter text-gradient relative ${glitchActive ? 'text-glitch' : ''}`}
            data-text="DISASTER"
          >
            DISASTER
          </span>
          <span className="text-xs tracking-[0.3em] text-muted-foreground font-bold font-mono uppercase">
            ESPORTS
          </span>
        </div>
      )}
    </div>
  );
}