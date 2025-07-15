import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Alert,
  Paper,
  Chip,
  Button,
  Fade,
  Zoom,
} from '@mui/material';
import { 
  Favorite, 
  ShoppingCart,
  ArrowBack 
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../context/FavoritesContext';
import ProductCard from '../shop/ProductCard';
import Loader from '../../components/common/Loader';

export default function Favorites() {
  const { favorites, loading } = useFavorites();

  if (loading) {
    return <Loader message="Chargement de vos favoris..." />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* En-tête */}
      <Fade in={true} timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Button
              component={Link}
              to="/shop"
              startIcon={<ArrowBack />}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            >
              Retour à la boutique
            </Button>
          </Box>
          
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Favorite sx={{ color: 'error.main', fontSize: '1.2em' }} />
            Mes Favoris
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Chip
              icon={<Favorite />}
              label={`${favorites.length} produit${favorites.length > 1 ? 's' : ''} favori${favorites.length > 1 ? 's' : ''}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            {favorites.length > 0 && (
              <Chip
                label="Tous vos produits préférés"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      </Fade>

      {/* Contenu */}
      {favorites.length === 0 ? (
        <Zoom in={true} timeout={1000}>
          <Paper
            elevation={2}
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <Favorite 
              sx={{ 
                fontSize: 80, 
                color: 'text.secondary', 
                mb: 3,
                opacity: 0.6,
              }} 
            />
            <Typography 
              variant="h4" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Aucun favori pour le moment
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
            >
              Parcourez nos produits et ajoutez vos favoris en cliquant sur l'icône cœur. 
              Vos favoris seront sauvegardés et vous pourrez y accéder facilement ici.
            </Typography>
            <Button
              component={Link}
              to="/shop"
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1.1rem',
              }}
            >
              Découvrir nos produits
            </Button>
          </Paper>
        </Zoom>
      ) : (
        <Fade in={true} timeout={800}>
          <Grid container spacing={3}>
            {favorites.map((product, index) => (
              <Zoom 
                in={true} 
                timeout={800 + (index * 100)}
                key={product._id}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                >
                  <ProductCard product={product} />
                </Grid>
              </Zoom>
            ))}
          </Grid>
        </Fade>
      )}
    </Container>
  );
} 