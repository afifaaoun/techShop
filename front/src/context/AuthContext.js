import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import Loader from '../components/common/Loader';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(userStr));
    } else {
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      
      // Si "Se souvenir de moi" est activé, stocker dans localStorage
      // Sinon, utiliser sessionStorage pour une session temporaire
      const storage = rememberMe ? localStorage : sessionStorage;
      
      storage.setItem('token', res.data.token);
      storage.setItem('user', JSON.stringify(res.data.user));
      
      // Synchroniser avec localStorage pour la compatibilité
      if (rememberMe) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      } else {
        // Stocker temporairement dans localStorage pour la session actuelle
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur de connexion' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/signup', userData);
      
      // La nouvelle réponse ne contient plus de token car l'utilisateur doit d'abord vérifier son email
      return { 
        success: true, 
        message: res.data.message,
        user: res.data.user 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur d\'inscription' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('guest_cart');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  if (loading) {
    return <Loader message="Initialisation..." fullScreen />;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      updateUser,
      setUser, 
      isAuthenticated, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
