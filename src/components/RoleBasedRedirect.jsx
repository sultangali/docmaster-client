import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Перенаправляем магистрантов на страницу IUP2025
  if (user.role === 'magistrants') {
    return <Navigate to="/iup2025" replace />;
  }

  // Для остальных ролей перенаправляем на профиль
  return <Navigate to="/profile" replace />;
};

export default RoleBasedRedirect;
