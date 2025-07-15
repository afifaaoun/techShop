import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [cart, setCart] = useState({ items: [], total: 0, count: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour calculer le total et count
  const calculateCartTotals = (items) => {
    const total = items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
    const count = items.reduce((acc, item) => acc + item.quantity, 0);
    return { total, count };
  };

  // Fonction pour charger le panier guest depuis localStorage
  const loadGuestCart = () => {
    try {
      const guestCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
      const { total, count } = calculateCartTotals(guestCart);
      return { items: guestCart, total, count };
    } catch (error) {
      console.error('Erreur lecture panier guest:', error);
      localStorage.removeItem('guest_cart');
      return { items: [], total: 0, count: 0 };
    }
  };

  // Fonction pour sauvegarder le panier guest
  const saveGuestCart = (cartData) => {
    try {
      localStorage.setItem('guest_cart', JSON.stringify(cartData.items));
    } catch (error) {
      console.error('Erreur sauvegarde panier guest:', error);
    }
  };

  useEffect(() => {
    // Attendre que l'authentification soit terminée avant de charger le panier
    if (authLoading) {
      // console.log('⏳ Attente de l\'authentification...');
      return;
    }

    const loadCart = async () => {
      try {
        setLoading(true);
        setError(null);

        if (isAuthenticated) {
          // Fusionner guest_cart avec le panier user si nécessaire
          const guestCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
          if (guestCart.length > 0) {
            try {
              // console.log('🔄 Fusion du panier guest avec le panier user...');
              await api.post('/cart/merge', { items: guestCart });
              localStorage.removeItem('guest_cart');
              // console.log('✅ Fusion réussie');
              
              // console.log('⏳ Attente de synchronisation...');
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (mergeError) {
              console.error('❌ Erreur lors de la fusion du panier:', mergeError);
            }
          }

          // Charger le panier user depuis le serveur
          const res = await api.get('/cart');
          // console.log('📦 Panier user chargé:', res.data.data);
          setCart(res.data.data);
          
          // Si le panier est vide après fusion, essayer de le recharger
          if (res.data.data.items.length === 0 && guestCart.length > 0) {
            // console.log('⚠️ Panier vide après fusion, tentative de rechargement...');
            setTimeout(async () => {
              try {
                const retryRes = await api.get('/cart');
                console.log('🔄 Rechargement après fusion:', retryRes.data.data);
                setCart(retryRes.data.data);
              } catch (error) {
                console.error('❌ Erreur rechargement après fusion:', error);
              }
            }, 2000);
          }
        } else {
          // Charger le panier guest depuis localStorage
          const guestCartData = loadGuestCart();
          // console.log('🛒 Panier guest chargé:', guestCartData);
          setCart(guestCartData);
        }
      } catch (error) {
        console.error('❌ Erreur chargement panier:', error);
        setError('Erreur lors du chargement du panier');
        setCart({ items: [], total: 0, count: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [isAuthenticated, authLoading]);

  // Le vidage du panier se fait maintenant dans AuthContext.logout()

  const addToCart = async (product, quantity = 1) => {
    try {
      setError(null);
      // console.log('➕ Ajout au panier:', product.name, 'x', quantity);

      if (isAuthenticated) {
        const payload = { productId: product._id, quantity };
        const res = await api.post('/cart', payload);
        // console.log('✅ Produit ajouté au panier user:', res.data.data);
        setCart(res.data.data);
      } else {
        let guestCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
        const index = guestCart.findIndex(item => String(item.product._id) === String(product._id));

        if (index !== -1) {
          guestCart[index].quantity += quantity;
          // console.log('📈 Quantité mise à jour pour:', product.name);
        } else {
          guestCart.push({
            product: {
              _id: product._id,
              name: product.name,
              images: product.images,
              price: product.price,
              stock: product.stock || 0, 
            },
            quantity,
            price: product.price,
          });
          // console.log('🆕 Nouveau produit ajouté:', product.name, 'Stock:', product.stock);
        }

        saveGuestCart({ items: guestCart });
        const { total, count } = calculateCartTotals(guestCart);
        const newCart = { items: guestCart, total, count };
        // console.log('💾 Panier guest mis à jour:', newCart);
        setCart(newCart);
      }
    } catch (error) {
      console.error('❌ Erreur ajout au panier:', error);
      setError('Erreur lors de l\'ajout au panier');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setError(null);
      // console.log('🗑️ Suppression du produit:', productId);

      if (isAuthenticated) {
        const res = await api.delete(`/cart/${productId}`);
        // console.log('✅ Produit supprimé du panier user:', res.data.data);
        setCart(res.data.data);
      } else {
        let guestCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
        guestCart = guestCart.filter(item => String(item.product._id) !== String(productId));
        
        saveGuestCart({ items: guestCart });
        const { total, count } = calculateCartTotals(guestCart);
        const newCart = { items: guestCart, total, count };
        // console.log('💾 Panier guest mis à jour:', newCart);
        setCart(newCart);
      }
    } catch (error) {
      console.error('❌ Erreur suppression du panier:', error);
      setError('Erreur lors de la suppression du produit');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setError(null);
      // console.log('📊 Mise à jour quantité:', productId, '->', quantity);

      if (isAuthenticated) {
        const res = await api.patch(`/cart/${productId}`, { quantity });
        // console.log('✅ Quantité mise à jour dans le panier user:', res.data.data);
        setCart(res.data.data);
      } else {
        let guestCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
        const index = guestCart.findIndex(item => String(item.product._id) === String(productId));
        
        if (index !== -1) {
          if (quantity <= 0) {
            guestCart = guestCart.filter(item => String(item.product._id) !== String(productId));
            // console.log('🗑️ Produit supprimé (quantité <= 0)');
          } else {
            guestCart[index].quantity = quantity;
            // console.log('📈 Quantité mise à jour:', quantity);
          }
          
          saveGuestCart({ items: guestCart });
          const { total, count } = calculateCartTotals(guestCart);
          const newCart = { items: guestCart, total, count };
          // console.log('💾 Panier guest mis à jour:', newCart);
          setCart(newCart);
        }
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour quantité:', error);
      setError('Erreur lors de la mise à jour de la quantité');
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      // console.log('🧹 Vidage du panier...');

      if (isAuthenticated) {
        await api.delete('/cart/all');
        // console.log('✅ Panier user vidé');
        setCart({ items: [], total: 0, count: 0 });
      } else {
        localStorage.removeItem('guest_cart');
        // console.log('✅ Panier guest vidé');
        setCart({ items: [], total: 0, count: 0 });
      }
    } catch (error) {
      console.error('❌ Erreur vidage panier:', error);
      setError('Erreur lors du vidage du panier');
    }
  };

  // Fonction pour forcer le rechargement du panier
  const refreshCart = async () => {
    if (isAuthenticated) {
      try {
        // console.log('🔄 Rechargement forcé du panier...');
        const res = await api.get('/cart');
        // console.log('📦 Panier rechargé:', res.data.data);
        setCart(res.data.data);
      } catch (error) {
        console.error('❌ Erreur rechargement panier:', error);
      }
    } else {
      const guestCartData = loadGuestCart();
      // console.log('🛒 Panier guest rechargé:', guestCartData);
      setCart(guestCartData);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        setError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
