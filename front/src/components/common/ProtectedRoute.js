import React, { useContext } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ allowedRoles = ['user', 'admin'] }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  console.log('🔍 ProtectedRoute - user:', user);
  console.log('🔍 ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('🔍 ProtectedRoute - loading:', loading);
  console.log('🔍 ProtectedRoute - allowedRoles:', allowedRoles);

  // Afficher un loader pendant le chargement
  if (loading) {
    console.log('⏳ ProtectedRoute - Affichage loader');
    return <Loader message="Vérification de l'authentification..." fullScreen />;
  }

  // Si l'utilisateur n'est pas connecté
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute - Utilisateur non connecté, redirection vers /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur n'a pas le bon rôle
  if (!allowedRoles.includes(user?.role)) {
    console.log('❌ ProtectedRoute - Rôle non autorisé, redirection vers /');
    return <Navigate to="/" replace />;
  }

  console.log('✅ ProtectedRoute - Accès autorisé, affichage du contenu');
  return <Outlet />;
};

export default ProtectedRoute;
