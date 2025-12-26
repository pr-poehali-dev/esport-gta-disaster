interface UserStatusBadgeProps {
  status: string;
}

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'Главный администратор':
        return 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white border-red-500 animate-gradient bg-[length:200%_200%]';
      case 'Администратор':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'Модератор':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case 'Игрок':
        return 'bg-white/20 text-white border-white/40';
      case 'Новичок':
        return 'bg-green-500/20 text-green-400 border-green-500/40';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/40';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
}
