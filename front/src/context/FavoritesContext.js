import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  // Charger les favoris au démarrage
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites([]);
      setError(null);
    }
  }, [isAuthenticated]);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/users/favorites');
      setFavorites(response.data.data || []);
    } catch (error) {
      console.error('❌ FavoritesContext - Erreur chargement favoris:', error);
      setError(error.response?.data?.message || 'Erreur lors du chargement des favoris');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addToFavorites = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Vous devez être connecté pour ajouter aux favoris');
    }

    try {
      await api.post(`/users/favorites/${productId}`);
      await loadFavorites(); // Recharger les favoris
      return { success: true };
    } catch (error) {
      console.error('❌ FavoritesContext - Erreur ajout favoris:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de l\'ajout aux favoris' 
      };
    }
  };

  const removeFromFavorites = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Vous devez être connecté pour retirer des favoris');
    }

    try {
      await api.delete(`/users/favorites/${productId}`);
      await loadFavorites(); // Recharger les favoris
      return { success: true };
    } catch (error) {
      console.error('❌ FavoritesContext - Erreur suppression favoris:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erreur lors de la suppression des favoris' 
      };
    }
  };

  const toggleFavorite = async (productId) => {
    const isFavorite = favorites.some(fav => fav._id === productId);
    
    if (isFavorite) {
      return await removeFromFavorites(productId);
    } else {
      return await addToFavorites(productId);
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => fav._id === productId);
  };

  const getFavoritesCount = () => {
    return favorites.length;
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      loading,
      error,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
      isFavorite,
      getFavoritesCount,
      loadFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
} 