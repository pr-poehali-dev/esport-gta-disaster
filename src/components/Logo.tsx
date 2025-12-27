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
        className={`relative ${animated ? 'energy-pulse' : ''} ${glitchActive ? 'logo-glitch' : ''} ${shatterActive ? 'logo-shatter' : ''}`}
      >
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-110"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="hsl(195 100% 50%)" />
              <stop offset="50%" stopColor="hsl(271 76% 53%)" />
              <stop offset="100%" stopColor="hsl(195 100% 50%)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <g filter="url(#glow)">
            <text
              x="28"
              y="38"
              fontSize="32"
              fontWeight="900"
              fontFamily="Montserrat, sans-serif"
              textAnchor="middle"
              fill="url(#logo-gradient)"
              stroke="hsl(195 100% 50%)"
              strokeWidth="1"
              letterSpacing="-2"
              className={glitchActive ? 'animate-pulse' : ''}
            >
              DE
            </text>
          </g>
          
          {glitchActive && (
            <>
              <rect x="8" y="10" width="3" height="6" fill="hsl(195 100% 50%)" opacity="0.6" />
              <rect x="45" y="40" width="3" height="6" fill="hsl(271 76% 53%)" opacity="0.6" />
              <line x1="12" y1="28" x2="20" y2="28" stroke="hsl(195 100% 50%)" strokeWidth="2" opacity="0.5" />
              <line x1="36" y1="28" x2="44" y2="28" stroke="hsl(271 76% 53%)" strokeWidth="2" opacity="0.5" />
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
            className={`text-2xl font-black tracking-tight text-gradient relative ${glitchActive ? 'text-glitch' : ''}`}
            data-text="D ESPORTS"
          >
            D ESPORTS
          </span>
        </div>
      )}
    </div>
  );
}