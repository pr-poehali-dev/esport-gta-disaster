import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      if (!requireAuth) {
        setIsAuthorized(true);
        return;
      }

      const user = localStorage.getItem('user');
      const token = localStorage.getItem('session_token');

      if (!user || !token) {
        navigate('/login');
        return;
      }

      try {
        const userData = JSON.parse(user);
        
        if (requireAdmin) {
          const isAdmin = userData.role === 'admin' || 
                         userData.role === 'founder' || 
                         userData.role === 'organizer' ||
                         userData.role === 'referee';
          
          if (!isAdmin) {
            navigate('/');
            return;
          }
        }

        setIsAuthorized(true);
      } catch (e) {
        console.error('Failed to parse user data:', e);
        navigate('/login');
      }
    };

    checkAuth();
  }, [requireAuth, requireAdmin, navigate]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}