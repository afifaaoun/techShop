import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Skeleton,
} from '@mui/material';
import {
  ShoppingCart,
  Star,
  LocalOffer,
  Timer,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCarousel from '../components/common/ProductCarousel';

const Home = () => {
  const [newProducts, setNewProducts] = useState([]);
  const [promotedProducts, setPromotedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Promotions statiques simples
  const promotions = [
    {
      title: "PROMOTION ÉTÉ",
      subtitle: "Jusqu'à -50% sur tous les produits",
      description: "Profitez de nos offres exceptionnelles pour l'été",
      color: "#ff6b6b",
    },
    {
      title: "LIVRAISON GRATUITE",
      subtitle: "Pour toute commande > 100DT",
      description: "Offre limitée, profitez-en maintenant",
      color: "#4ecdc4",
    },
  ];

  // Charger les produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [newResponse, promotedResponse] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/products?isPromoted=true&limit=6')
        ]);
        
        setNewProducts(newResponse.data.data || []);
        setPromotedProducts(promotedResponse.data.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Box>
      {/* Hero Section Simple */}
      <Box
        sx={{
          background: 'linear-gradient(135deg,rgb(82, 113, 216) 0%,rgb(76, 134, 241) 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" fontWeight="bold" gutterBottom>
               E-SHOP
            </Typography>
            <Typography variant="h4" gutterBottom>
              Votre boutique en ligne de confiance
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Découvrez nos produits exceptionnels aux meilleurs prix
            </Typography>
            
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/shop"
                sx={{ backgroundColor: 'white', color: '#667eea' }}
              >
                Découvrir nos produits
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/cart"
                sx={{ color: 'white', borderColor: 'white' }}
              >
                Voir le panier
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Section Promotions */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" textAlign="center" fontWeight="bold" gutterBottom>
           Nos Promotions!
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2, justifyContent: 'center' }}>
          {promotions.map((promo, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ 
                backgroundColor: promo.color, 
                color: 'white',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}>
                <CardContent sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <LocalOffer sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {promo.title}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {promo.subtitle}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, flexGrow: 1 }}>
                    {promo.description}
                  </Typography>
                  <Button
                    variant="contained"
                    component={Link}
                    to="/shop"
                    sx={{ backgroundColor: 'white', color: promo.color }}
                  >
                    En profiter
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Section Produits Promus */}
      {promotedProducts.length > 0 && (
        <Container maxWidth="lg" sx={{ py: 4 }}> {/* Réduit de py: 6 à py: 4 */}
          <ProductCarousel 
            products={promotedProducts}
            title="Produits en Vedette"
            subtitle="Nos produits les plus populaires"
          />
        </Container>
      )}

      {/* Section Nouveautés */}
      <Container maxWidth="lg" sx={{ py: 4 }}> {/* Réduit de py: 6 à py: 4 */}
        <ProductCarousel 
          products={newProducts}
          title="Nos Nouveautés"
          subtitle="Découvrez nos derniers produits ajoutés"
        />

        {newProducts.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/shop"
              startIcon={<ShoppingCart />}
              sx={{ 
                px: 4, 
                py: 1.5, 
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              Voir tous nos produits
            </Button>
          </Box>
        )}
      </Container>

      {/* Section Avantages */}
      <Box sx={{ backgroundColor: '#f5f5f5', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" fontWeight="bold" gutterBottom>
            Pourquoi choisir E-Shop ?
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2, justifyContent: 'center' }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <LocalOffer sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Prix compétitifs
                </Typography>
                <Typography color="text.secondary">
                  Les meilleurs prix du marché avec des promotions régulières
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <ShoppingCart sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Livraison rapide
                </Typography>
                <Typography color="text.secondary">
                  Livraison gratuite dès 100DT 
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Star sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Qualité garantie
                </Typography>
                <Typography color="text.secondary">
                  Produits sélectionnés avec soin pour votre satisfaction
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;