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
        className={`relative ${glitchActive ? 'logo-glitch' : ''} ${shatterActive ? 'logo-shatter' : ''}`}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-110"
        >
          <defs>
            <linearGradient id="logo-gradient-d" x1="0" y1="0" x2="30" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="hsl(195 100% 50%)" />
              <stop offset="100%" stopColor="hsl(195 100% 60%)" />
            </linearGradient>
            <linearGradient id="logo-gradient-e" x1="30" y1="0" x2="60" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="hsl(271 76% 53%)" />
              <stop offset="100%" stopColor="hsl(271 76% 63%)" />
            </linearGradient>
            <filter id="glow-d">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="glow-e">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <g filter="url(#glow-d)" className={animated ? 'logo-letter-d' : ''}>
            <text
              x="18"
              y="42"
              fontSize="36"
              fontWeight="900"
              fontFamily="Montserrat, sans-serif"
              textAnchor="middle"
              fill="url(#logo-gradient-d)"
              stroke="hsl(195 100% 50%)"
              strokeWidth="1.5"
            >
              D
            </text>
          </g>
          
          <g filter="url(#glow-e)" className={animated ? 'logo-letter-e' : ''}>
            <text
              x="46"
              y="42"
              fontSize="36"
              fontWeight="900"
              fontFamily="Montserrat, sans-serif"
              textAnchor="middle"
              fill="url(#logo-gradient-e)"
              stroke="hsl(271 76% 53%)"
              strokeWidth="1.5"
            >
              E
            </text>
          </g>
          
          {glitchActive && (
            <>
              <rect x="10" y="12" width="3" height="6" fill="hsl(195 100% 50%)" opacity="0.6" />
              <rect x="51" y="46" width="3" height="6" fill="hsl(271 76% 53%)" opacity="0.6" />
              <line x1="14" y1="32" x2="22" y2="32" stroke="hsl(195 100% 50%)" strokeWidth="2" opacity="0.5" />
              <line x1="42" y1="32" x2="50" y2="32" stroke="hsl(271 76% 53%)" strokeWidth="2" opacity="0.5" />
            </>
          )}
        </svg>

        {animated && (
          <>
            <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
            <div className="logo-particles" />
          </>
        )}
      </div>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span 
            className={`text-2xl font-black tracking-tight text-gradient relative ${glitchActive ? 'text-glitch' : ''}`}
            data-text="DISASTER ESPORTS"
          >
            DISASTER ESPORTS
          </span>
        </div>
      )}
    </div>
  );
}