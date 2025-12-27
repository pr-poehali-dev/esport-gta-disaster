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
      setTimeout(() => setGlitchActive(false), 200);
    }, 8000);

    const shatterInterval = setInterval(() => {
      setShatterActive(true);
      setTimeout(() => setShatterActive(false), 300);
    }, 12000);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(shatterInterval);
    };
  }, [animated]);

  return (
    <a 
      href="/"
      className={`flex items-center gap-3 ${className} group cursor-pointer`}
      onMouseEnter={() => animated && setGlitchActive(true)}
      onMouseLeave={() => animated && setGlitchActive(false)}
    >
      <div 
        className={`relative ${glitchActive ? 'logo-glitch' : ''} ${shatterActive ? 'logo-shatter' : ''}`}
        style={{ 
          filter: 'drop-shadow(0 0 8px rgba(13, 148, 231, 0.4))',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          background: 'transparent'
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-3"
          style={{
            shapeRendering: 'geometricPrecision',
            textRendering: 'geometricPrecision',
            imageRendering: 'crisp-edges',
            background: 'transparent'
          }}
        >
          <defs>
            <linearGradient id="logo-gradient-d" x1="0" y1="0" x2="30" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="hsl(195 100% 55%)" />
              <stop offset="100%" stopColor="hsl(195 100% 65%)" />
            </linearGradient>
            <linearGradient id="logo-gradient-e" x1="30" y1="0" x2="60" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="hsl(271 76% 58%)" />
              <stop offset="100%" stopColor="hsl(271 76% 68%)" />
            </linearGradient>
            <filter id="glow-d">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="glow-e">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <g filter="url(#glow-d)" className={animated ? 'logo-letter-d' : ''} style={{ transformOrigin: '18px 42px' }}>
            <text
              x="18"
              y="42"
              fontSize="34"
              fontWeight="900"
              fontFamily="Montserrat, sans-serif"
              textAnchor="middle"
              fill="url(#logo-gradient-d)"
              stroke="hsl(195 100% 50%)"
              strokeWidth="0.8"
            >
              D
            </text>
          </g>
          
          <g filter="url(#glow-e)" className={animated ? 'logo-letter-e' : ''} style={{ transformOrigin: '46px 42px' }}>
            <text
              x="46"
              y="42"
              fontSize="34"
              fontWeight="900"
              fontFamily="Montserrat, sans-serif"
              textAnchor="middle"
              fill="url(#logo-gradient-e)"
              stroke="hsl(271 76% 53%)"
              strokeWidth="0.8"
            >
              E
            </text>
          </g>
          
          {glitchActive && (
            <>
              <rect x="10" y="14" width="2" height="4" fill="hsl(195 100% 50%)" opacity="0.4" />
              <rect x="52" y="44" width="2" height="4" fill="hsl(271 76% 53%)" opacity="0.4" />
              <line x1="16" y1="32" x2="22" y2="32" stroke="hsl(195 100% 50%)" strokeWidth="1.5" opacity="0.3" />
              <line x1="42" y1="32" x2="48" y2="32" stroke="hsl(271 76% 53%)" strokeWidth="1.5" opacity="0.3" />
            </>
          )}
        </svg>

        {animated && (
          <>
            <div className="absolute inset-0 scanline opacity-10 pointer-events-none rounded-full" />
            <div className="logo-particles" />
          </>
        )}
      </div>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span 
            className={`text-2xl font-black tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent relative ${glitchActive ? 'text-glitch' : ''}`}
            style={{ 
              filter: glitchActive ? 'none' : 'drop-shadow(0 0 4px rgba(13, 148, 231, 0.3))',
              transition: 'filter 0.3s ease'
            }}
          >
            DISASTER ESPORTS
          </span>
        </div>
      )}
    </a>
  );
}