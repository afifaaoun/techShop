import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Rating,
  Grid,
  Paper,
  IconButton,
  Link,
} from '@mui/material';
import {
  RemoveShoppingCart,
  Close,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ProductReviews from './ProductReviews';
import ImageZoom from './ImageZoom';
import api from '../../utils/api';

export default function ProductDetail({ product, productId, onClose }) {
  const { user } = useAuth();
  const [loadedProduct, setLoadedProduct] = useState(product || null);
  const [avgRating, setAvgRating] = useState(0);
  const [numOfReviews, setNumOfReviews] = useState(0);
  const [mainImage, setMainImage] = useState(null);
  const [showFullDesc, setShowFullDesc] = useState(false);

  const isOutOfStock = loadedProduct?.stock <= 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${productId}`);
        setLoadedProduct(res.data.data);
        setAvgRating(res.data.data.ratings ?? 0);
        setNumOfReviews(res.data.data.numOfReviews ?? 0);
        setMainImage(res.data.data.images?.[0]?.url || null);
      } catch (err) {
        console.error('Erreur chargement produit :', err);
      }
    };

    if (!product && productId) {
      fetchProduct();
    } else if (product) {
      setLoadedProduct(product);
      setAvgRating(product.ratings ?? 0);
      setNumOfReviews(product.numOfReviews ?? 0);
      setMainImage(product.images?.[0]?.url || null);
    }
  }, [product, productId]);



  const handleClose = () => {
    if (onClose) onClose();
  };

  const getPriceDisplay = () => {
    if (loadedProduct.discount > 0) {
      const discountedPrice = loadedProduct.price * (1 - loadedProduct.discount / 100);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Typography variant="h5" color="error" sx={{ fontWeight: 'bold' }}>
            {discountedPrice.toFixed(2)}DT
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textDecoration: 'line-through',
              color: 'text.secondary',
            }}
          >
            {loadedProduct.price.toFixed(2)}DT
          </Typography>
          <Chip
            label={`-${loadedProduct.discount}%`}
            color="error"
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      );
    }
    return (
      <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
        {loadedProduct.price.toFixed(2)}DT
      </Typography>
    );
  };

  const getStockStatus = () => {
    if (isOutOfStock) {
      return (
        <Chip
          label="Rupture de stock"
          color="error"
          icon={<RemoveShoppingCart />}
          sx={{ mb: 2 }}
        />
      );
    }

    if (loadedProduct.stock <= 5) {
      return (
        <Chip
          label={`Plus que ${loadedProduct.stock} en stock`}
          color="warning"
          sx={{ mb: 2 }}
        />
      );
    }

    return (
      <Chip
        label="En stock"
        color="success"
        sx={{ mb: 2 }}
      />
    );
  };

  if (!loadedProduct) return <p>Chargement du produit...</p>;

  // Vérifier si la description est vraiment longue (plus de 200 caractères)
  const isDescLong = loadedProduct.description && loadedProduct.description.length > 200;

  return (
    <Box sx={{ p: 2, position: 'relative' }}>
      {/* Bouton fermer en haut à droite */}
      <IconButton
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          color: 'error.main',
          zIndex: 10,
          backgroundColor: 'rgba(255,255,255,0.9)',
          '&:hover': {
            backgroundColor: 'white',
          },
        }}
      >
        <Close />
      </IconButton>

      {/* Titre en haut */}
      <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 3, pr: 4 }}>
        {loadedProduct.name}
      </Typography>

      {/* Section principale : Description + Image */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Colonne gauche : Description + Statut stock + Catégorie */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            justifyContent: 'flex-start',
            minWidth: 0,
          }}
        >
          {/* Description */}
          <Box>  
            {/* Catégorie */}
            <Box sx={{ mb: 2 }}>
              <Chip
                label={loadedProduct.category}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
          
            {/* Statut stock */}
            <Box sx={{ mb: 2 }}>
              {getStockStatus()}
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Description
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: showFullDesc ? 'unset' : 6,
                lineHeight: 1.4,
                fontSize: '0.9rem',
                maxHeight: showFullDesc ? 'none' : '8.4em',
              }}
            >
              {loadedProduct.description}
            </Typography>
            {isDescLong && (
              <Button
                size="small"
                onClick={() => setShowFullDesc(!showFullDesc)}
                sx={{
                  p: 0,
                  minWidth: 'auto',
                  fontSize: '0.75rem',
                  mt: 0.5,
                  color: 'primary.main',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                {showFullDesc ? 'Voir moins' : 'Voir plus'}
              </Button>
            )}
          </Box>

          
        </Box>

        {/* Colonne droite : Image + Miniatures + Prix */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          {/* Image principale avec zoom */}
          <Paper
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              mb: 2,
              width: '100%',
              maxWidth: { xs: '100%', md: 400 },
              alignSelf: 'center',
            }}
          >
            {mainImage ? (
              <ImageZoom
                src={mainImage}
                width={350}
                height={300}
                zoomWidth={400}
                zoomHeight={400}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  borderRadius: 2,
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography>Aucune image</Typography>
              </Box>
            )}

            {/* Miniatures */}
            {loadedProduct.images && loadedProduct.images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mt: 2, justifyContent: 'center' }}>
                {loadedProduct.images.map((img, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={img.url}
                    alt={`Miniature ${index}`}
                    onClick={() => setMainImage(img.url)}
                    sx={{
                      width: 50,
                      height: 50,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                      border: img.url === mainImage ? '2px solid #1976d2' : '2px solid transparent',
                      transition: 'border-color 0.2s ease',
                      '&:hover': {
                        borderColor: '#1976d2',
                      },
                    }}
                  />
                ))}
              </Box>
            )}
          </Paper>

          {/* Prix centré sous l'image */}
          {getPriceDisplay()}
        </Box>
      </Box>

      {/* Rating + Avis en bas */}
      <Box sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Rating value={avgRating} precision={0.5} readOnly size="small" />
          <Typography variant="body2" color="text.secondary">
            ({numOfReviews} avis)
          </Typography>
        </Box>

        <ProductReviews
          productId={loadedProduct._id}
          onReviewsUpdate={({ avgRating, numOfReviews }) => {
            setAvgRating(avgRating);
            setNumOfReviews(numOfReviews);
          }}
        />
      </Box>
    </Box>
  );
}
