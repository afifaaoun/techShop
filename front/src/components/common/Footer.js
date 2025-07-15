import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'rgb(110, 110, 106)',
        color: 'white',
        mt: 'auto',
        py: 6,
        mt: 4, // Ajouter une marge en haut pour séparer du contenu
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Section À propos */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              E-SHOP
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
              Votre boutique en ligne de confiance pour tous vos besoins. 
              Nous proposons une large gamme de produits de qualité aux meilleurs prix.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <IconButton
                size="small"
                sx={{ 
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                size="small"
                sx={{ 
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(253, 18, 18, 0.1)' }
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                size="small"
                sx={{ 
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                size="small"
                sx={{ 
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Section Liens rapides */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Liens rapides
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component={RouterLink}
                to="/shop"
                sx={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                Nos produits
              </Link>
              <Link
                component={RouterLink}
                to="/cart"
                sx={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                Panier
              </Link>
              <Link
                component={RouterLink}
                to="/profile"
                sx={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                Mon compte
              </Link>
              <Link
                component={RouterLink}
                to="/orders"
                sx={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                Mes commandes
              </Link>
            </Box>
          </Grid>

          {/* Section Support */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                href="#"
                sx={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                Centre d'aide
              </Link>
              <Link
                href="#"
                sx={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                Contactez-nous
              </Link>
              <Link
                href="#"
                sx={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                FAQ
              </Link>
              <Link
                href="#"
                sx={{ 
                  color: 'white', 
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' }
                }}
              >
                Retours
              </Link>
            </Box>
          </Grid>

          {/* Section Contact */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2">
                  123 Rue du Commerce, Tunis 1000
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2">
                  +216 71 234 567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2">
                  contact@eshop.tn
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Section Copyright */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <Typography variant="body2" color="rgba(255,255,255,0.7)">
            © {currentYear} E-SHOP. Tous droits réservés.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              href="#"
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { color: 'white' }
              }}
            >
              Politique de confidentialité
            </Link>
            <Link
              href="#"
              sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { color: 'white' }
              }}
            >
              Conditions d'utilisation
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 