// components/common/Navbar/CategoryMenu.js
import React, { useState, useEffect } from 'react';
import { Box, Button, Tooltip, Chip } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { 
  Phone, 
  Laptop, 
  Watch, 
  TabletMac,
  CameraAlt,
  ViewModule,
  Smartphone,
  Computer,
  Tablet,
  Headset,
  WatchOutlined
} from '@mui/icons-material';
import api from '../../../utils/api';

// Mapping des icônes basé sur les noms d'icônes du backend
const getIconComponent = (iconName) => {
  const iconMap = {
    smartphone: <Smartphone fontSize="small" />,
    laptop: <Laptop fontSize="small" />,
    headset: <Headset fontSize="small" />,
    watch: <WatchOutlined fontSize="small" />,
    tablet: <Tablet fontSize="small" />,
    phone: <Phone fontSize="small" />,
    computer: <Computer fontSize="small" />,
    camera: <CameraAlt fontSize="small" />
  };
  
  return iconMap[iconName] || <ViewModule fontSize="small" />;
};

export default function CategoryMenu() {
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/products/categories');
        
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        } else {
          console.warn('⚠️ Aucune catégorie trouvée dans la réponse');
          setCategories([]);
        }
      } catch (err) {
        console.error('❌ Erreur lors du chargement des catégories:', err);
        setError('Erreur de chargement des catégories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const isActiveCategory = (categoryPath) => {
    const urlParams = new URLSearchParams(location.search);
    const currentCategory = urlParams.get('category');
    
    // Si c'est "Tous les produits" (path = /shop sans paramètres)
    if (categoryPath === '/shop') {
      return !currentCategory; // Actif si pas de catégorie sélectionnée
    }
    
    // Pour les autres catégories
    return categoryPath.includes(currentCategory);
  };

  if (loading) {
    return (
      <Box
        sx={{
          background: 'linear-gradient(135deg, #e9e5da 0%, #f5f5dc 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingY: 1.5,
          color: '#333',
          fontSize: '0.9rem',
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          zIndex: 1199,
        }}
      >
        Chargement des catégories...
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          background: 'linear-gradient(135deg, #e9e5da 0%, #f5f5dc 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingY: 1.5,
          color: '#333',
          fontSize: '0.9rem',
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          zIndex: 1199,
        }}
      >
        Erreur de chargement
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #e9e5da 0%, #f5f5dc 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingY: 1.5,
        gap: 1,
        flexWrap: 'wrap',
        position: 'fixed',
        top: '64px', // Hauteur du Navbar
        left: 0,
        right: 0,
        zIndex: 1199, // Juste en dessous du Navbar
        color: '#333',
      }}
    >
      {/* Bouton statique pour tous les produits */}
      <Tooltip title="Tous les produits" placement="bottom" arrow>
        <Button
          component={RouterLink}
          to="/shop"
          startIcon={<ViewModule fontSize="small" />}
          sx={{
            color: '#333',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            px: 2,
            py: 0.8,
            mx: 0.5,
            transition: 'all 0.3s ease',
            backgroundColor: isActiveCategory('/shop')
              ? 'rgba(0,0,0,0.1)'
              : 'transparent',
            border: isActiveCategory('/shop')
              ? '1px solid rgba(0,0,0,0.2)'
              : '1px solid transparent',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderColor: 'rgba(0,0,0,0.3)',
            },
          }}
        >
          Tous les produits
          {isActiveCategory('/shop') && (
            <Chip
              label="Actif"
              size="small"
              sx={{
                ml: 1,
                height: 20,
                fontSize: '0.7rem',
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          )}
        </Button>
      </Tooltip>

      {/* Catégories dynamiques du backend avec métadonnées */}
      {categories.map((category) => {
        const iconComponent = getIconComponent(category.icon);
        return (
          <Tooltip key={category.key} title={category.label} placement="bottom" arrow>
            <Button
              component={RouterLink}
              to={`/shop?category=${category.key}`}
              startIcon={iconComponent}
              sx={{
                color: '#333',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 0.8,
                mx: 0.5,
                transition: 'all 0.3s ease',
                backgroundColor: isActiveCategory(`/shop?category=${category.key}`)
                  ? 'rgba(0,0,0,0.1)'
                  : 'transparent',
                border: isActiveCategory(`/shop?category=${category.key}`)
                  ? '1px solid rgba(0,0,0,0.2)'
                  : '1px solid transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderColor: 'rgba(0,0,0,0.3)',
                },
              }}
            >
              {category.label}
              {isActiveCategory(`/shop?category=${category.key}`) && (
                <Chip
                  label="Actif"
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
              )}
            </Button>
          </Tooltip>
        );
      })}
    </Box>
  );
}
