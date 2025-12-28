interface FounderUsernameProps {
  nickname: string;
  role: string;
  className?: string;
}

export default function FounderUsername({ nickname, role, className = '' }: FounderUsernameProps) {
  if (role === 'founder') {
    return (
      <div className="flex items-center gap-2">
        <span 
          className={`font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent ${className}`}
          style={{ 
            backgroundSize: '200% auto',
            animation: 'gradient 3s linear infinite'
          }}
        >
          {nickname}
        </span>
        <span className="px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold">
          ОСНОВАТЕЛЬ
        </span>
        <style>
          {`
            @keyframes gradient {
              0% { background-position: 0% center; }
              100% { background-position: 200% center; }
            }
          `}
        </style>
      </div>
    );
  }

  return <span className={className}>{nickname}</span>;
}
