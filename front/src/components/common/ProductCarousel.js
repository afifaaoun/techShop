import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  IconButton,
  Paper,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Star,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

export default function ProductCarousel({ products, title, subtitle }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const navigate = useNavigate();

  // Configuration du carousel
  const itemsPerView = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
  };

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = Math.max(0, products.length - getItemsPerView());
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4000); // Change toutes les 4 secondes

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, products.length]);

  const getItemsPerView = () => {
    // Logique responsive simplifiée
    if (window.innerWidth >= 1200) return 4; // lg
    if (window.innerWidth >= 900) return 3;   // md
    if (window.innerWidth >= 600) return 2;   // sm
    return 1; // xs
  };

  const nextSlide = () => {
    const maxIndex = Math.max(0, products.length - getItemsPerView());
    setCurrentIndex(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  };

  const prevSlide = () => {
    const maxIndex = Math.max(0, products.length - getItemsPerView());
    setCurrentIndex(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  };

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const handleCardClick = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    // Utiliser navigate au lieu de Link pour éviter les problèmes de routing
    navigate(`/product/${productId}`);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Box sx={{ position: 'relative', py: 2 }}> {/* Réduit de py: 4 à py: 2 */}
      {/* Titre de la section */}
      {(title || subtitle) && (
        <Box sx={{ textAlign: 'center', mb: 3 }}> {/* Réduit de mb: 4 à mb: 3 */}
          {title && (
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="h6" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      {/* Container du carousel */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          '&:hover .carousel-controls': {
            opacity: 1,
          },
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Boutons de navigation */}
        <IconButton
          onClick={prevSlide}
          sx={{
            position: 'absolute',
            left: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: 'white',
            },
            opacity: 0,
            transition: 'opacity 0.3s ease',
            '&.carousel-controls': true,
          }}
          className="carousel-controls"
        >
          <ChevronLeft />
        </IconButton>

        <IconButton
          onClick={nextSlide}
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              backgroundColor: 'white',
            },
            opacity: 0,
            transition: 'opacity 0.3s ease',
            '&.carousel-controls': true,
          }}
          className="carousel-controls"
        >
          <ChevronRight />
        </IconButton>

        {/* Container des cartes */}
        <Box
          sx={{
            display: 'flex',
            transition: 'transform 0.5s ease',
            transform: `translateX(-${currentIndex * (100 / getItemsPerView())}%)`,
            width: `${(products.length / getItemsPerView()) * 100}%`,
          }}
        >
          {products.map((product) => (
            <Box
              key={product._id}
              sx={{
                flex: `0 0 ${100 / getItemsPerView()}%`,
                px: 1,
              }}
            >
              <Card
                sx={{
                  height: 350, // Réduit de 420 à 350
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    borderColor: 'primary.main',
                  },
                }}
                onClick={(e) => handleCardClick(e, product._id)}
              >
                <Box sx={{ 
                  height: 180, // Réduit de 220 à 180
                  overflow: 'hidden',
                  backgroundColor: '#f5f5f5',
                }}>
                  <CardMedia
                    component="img"
                    height="180" // Réduit de 220 à 180
                    image={product.images?.[0]?.url || 'https://via.placeholder.com/180x180/f0f0f0/666666?text=Produit'}
                    alt={product.name}
                    sx={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                </Box>
                
                <CardContent sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  height: 130, // Réduit de 160 à 130
                  p: 1.5, // Réduit de 2 à 1.5
                }}>
                  {/* Catégorie */}
                  <Chip
                    label={product.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ 
                      alignSelf: 'flex-start',
                      mb: 0.5, // Réduit de 1 à 0.5
                      height: 18, // Réduit de 20 à 18
                      fontSize: '0.6rem', // Réduit de 0.65rem à 0.6rem
                    }}
                  />
                  
                  {/* Titre */}
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      height: 32, // Réduit de 40 à 32
                      lineHeight: 1.2,
                      fontSize: '0.85rem', // Réduit de 0.9rem à 0.85rem
                      fontWeight: 600,
                      mb: 0.5, // Réduit de gutterBottom à 0.5
                    }}
                  >
                    {product.name}
                  </Typography>
                  
                  {/* Description */}
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 1, // Réduit de 2 à 1
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      height: 32, // Réduit de 40 à 32
                      lineHeight: 1.3,
                      flexGrow: 1,
                      fontSize: '0.75rem', // Réduit de 0.8rem à 0.75rem
                    }}
                  >
                    {product.description?.substring(0, 60)}... {/* Réduit de 80 à 60 */}
                  </Typography>
                  
                  {/* Prix et Rating */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 'auto'
                  }}>
                    <Typography variant="h6" color="primary" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
                      {product.price?.toFixed(2)} DT
                    </Typography>
                    <Chip
                      icon={<Star sx={{ fontSize: '0.7rem' }} />}
                      label={`${(product.rating || 0).toFixed(2)}/5`}
                      size="small"
                      color="warning"
                      sx={{ fontSize: '0.65rem' }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Indicateurs de position */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
        {Array.from({ length: Math.ceil(products.length / getItemsPerView()) }).map((_, index) => (
          <Box
            key={index}
            onClick={() => setCurrentIndex(index * getItemsPerView())}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: currentIndex >= index * getItemsPerView() && 
                            currentIndex < (index + 1) * getItemsPerView() 
                            ? 'primary.main' 
                            : 'grey.300',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: 'primary.main',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
} 