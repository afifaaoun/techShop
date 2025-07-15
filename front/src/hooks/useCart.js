import { useContext, useEffect, useCallback } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export const useCart = () => {
  const cartContext = useContext(CartContext);
  const { isAuthenticated, user } = useContext(AuthContext);

  // Fonction pour forcer la synchronisation du panier
  const syncCart = useCallback(async () => {
    if (!cartContext.loading) {
      console.log('🔄 Synchronisation du panier...');
      await cartContext.refreshCart();
    }
  }, [cartContext]);

  // Synchronisation automatique lors des changements d'état
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!cartContext.loading) {
        syncCart();
      }
    }, 1000); // Délai pour laisser le temps aux contextes de se mettre à jour

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, syncCart]);

  // Fonction pour ajouter au panier avec synchronisation
  const addToCart = useCallback(async (product, quantity = 1) => {
    try {
      await cartContext.addToCart(product, quantity);
      // Synchroniser après l'ajout
      setTimeout(syncCart, 500);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    }
  }, [cartContext, syncCart]);

  // Fonction pour supprimer du panier avec synchronisation
  const removeFromCart = useCallback(async (productId) => {
    try {
      await cartContext.removeFromCart(productId);
      // Synchroniser après la suppression
      setTimeout(syncCart, 500);
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
    }
  }, [cartContext, syncCart]);

  // Fonction pour vider le panier avec synchronisation
  const clearCart = useCallback(async () => {
    try {
      await cartContext.clearCart();
      // Synchroniser après le vidage
      setTimeout(syncCart, 500);
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error);
    }
  }, [cartContext, syncCart]);

  return {
    ...cartContext,
    addToCart,
    removeFromCart,
    clearCart,
    syncCart,
  };
}; 