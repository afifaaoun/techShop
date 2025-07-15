import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const login = async (email, password, rememberMe = false) => {
    const result = await auth.login(email, password, rememberMe);
    if (result.success) {
      // Rediriger vers la page d'origine ou la page d'accueil
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
    return result;
  };

  const register = async (userData) => {
    const result = await auth.register(userData);
    if (result.success) {
      navigate('/', { replace: true });
    }
    return result;
  };

  const logout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  return {
    ...auth,
    login,
    register,
    logout,
  };
};
