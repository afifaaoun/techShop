import React, { useContext, useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Chip,
  Box,
  Rating,
  Tooltip,
  Badge,
  Fade,
  Zoom,
} from '@mui/material';
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Visibility,
  Star,
  LocalOffer,
  RemoveShoppingCart,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import ProductDetail from './ProductDetail';
import { CartContext } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../hooks/useAuth';

export default function ProductCard({ product }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  // Vérifier si le produit est en rupture de stock
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (isOutOfStock) {
      showError('Ce produit est en rupture de stock');
      return;
    }

    try {
      await addToCart(product, 1);
      showSuccess('Produit ajouté au panier !');
    } catch (error) {
      showError('Erreur lors de l\'ajout au panier');
      console.error('Erreur ajout au panier:', error);
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    // console.log('🔍 Ouverture modal pour produit:', product.name);
    // console.log('🖼️ Images du produit:', product.images);
    setModalOpen(true);
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      showError('Vous devez être connecté pour ajouter aux favoris');
      return;
    }
    
    try {
      const result = await toggleFavorite(product._id);
      if (result.success) {
        showSuccess(isFavorite(product._id) ? 'Retiré des favoris' : 'Ajouté aux favoris');
      } else {
        showError(result.error || 'Erreur lors de la gestion des favoris');
      }
    } catch (error) {
      showError('Erreur lors de la gestion des favoris');
    }
  };

  const handleCardClick = () => {
    // Ouvrir le modal au lieu de naviguer
    // console.log('🖱️ Clic sur la carte pour:', product.name);
    setModalOpen(true);
  };

  const getPriceDisplay = () => {
    if (product.discount > 0) {
      const discountedPrice = product.price * (1 - product.discount / 100);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography
            variant="h6"
            color="error"
            sx={{ fontWeight: 'bold' }}
          >
            {discountedPrice.toFixed(2)} DT
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textDecoration: 'line-through',
              color: 'text.secondary',
            }}
          >
            {product.price.toFixed(2)}DT
          </Typography>
          <Chip
            label={`-${product.discount}%`}
            size="small"
            color="error"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </Box>
      );
    }
    return (
      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
        {product.price.toFixed(2)}DT
      </Typography>
    );
  };

  const getStockStatus = () => {
    if (isOutOfStock) {
      return (
        <Chip
          label="Rupture de stock"
          color="error"
          size="small"
          icon={<RemoveShoppingCart />}
          sx={{ mb: 1 }}
        />
      );
    }
    
    if (product.stock <= 5) {
      return (
        <Chip
          label={`Plus que ${product.stock} en stock`}
          color="warning"
          size="small"
          sx={{ mb: 1 }}
        />
      );
    }
    
    return (
      <Chip
        label="En stock"
        color="success"
        size="small"
        sx={{ mb: 1 }}
      />
    );
  };

  return (
    <>
      <Card
        sx={{
          width: 300,
          height: 550,
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            borderColor: 'primary.main',
          },
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleCardClick}
      >
        {/* Actions au survol */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <Tooltip title="Voir détails">
            <IconButton
              size="small"
              onClick={handleQuickView}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                '&:hover': { backgroundColor: 'white' },
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFavorite(product._id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
            <IconButton
              size="small"
              onClick={handleFavorite}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                '&:hover': { backgroundColor: 'white' },
              }}
            >
              {isFavorite(product._id) ? (
                <Favorite fontSize="small" color="error" />
              ) : (
                <FavoriteBorder fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Image du produit - Hauteur fixe */}
        <Box sx={{ 
          height: 280, 
          minHeight: 280,
          maxHeight: 280,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#f5f5f5',
        }}>
          <CardMedia
            component="img"
            height="280"
            image={product.images?.[0]?.url || 'https://via.placeholder.com/280x280/f0f0f0/666666?text=Produit'}
            alt={product.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              minHeight: 280,
              maxHeight: 280,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback si l'image ne charge pas */}
          <Box
            sx={{
              display: 'none',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              color: '#999',
            }}
          >
            <Typography variant="body2">Image non disponible</Typography>
          </Box>
        </Box>

        {/* Contenu - Hauteur fixe avec flexbox */}
        <CardContent 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            height: 200,
            p: 2,
          }}
        >
          {/* Catégorie */}
          <Chip
            label={product.category}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ 
              alignSelf: 'flex-start',
              mb: 1,
              height: 24,
              fontSize: '0.7rem',
            }}
          />
         {/* Note - Hauteur fixe */}
      
            <Rating
              value={product.rating || 0}
              precision={0.5}
              size="small"
              readOnly
            />
            <Typography variant="body2" color="text.secondary">
              ({(product.rating || 0).toFixed(2)})
            </Typography>
          {/* Titre - Hauteur fixe */}
          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                mx: 'auto',
              }}
            >
              {product.name}
            </Typography>
            {/* Affichage du prix (avec remise si applicable) */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              {getPriceDisplay()}
            </Box>
            {hovered && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1,  textAlign: 'center' }}>
                {getStockStatus()}
              </Box>
            )}
            {hovered && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    minWidth: 40,
                    px: 2
                  }}
                >
                  Ajouter
                </Button>
              </Box>
            )}
          </Box>
 

        </CardContent>

        {/* Actions - Hauteur fixe */}
        <CardActions sx={{ p: 2, pt: 0, height: 40 }}>
          {/* The button is now inside the CardContent */}
        </CardActions>
      </Card>

      {/* Modal de détails rapides */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ProductDetail 
          product={product} 
          onClose={() => setModalOpen(false)}
        />
      </Modal>
    </>
  );
}
