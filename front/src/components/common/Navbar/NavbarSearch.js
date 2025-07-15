// components/common/Navbar/NavbarSearch.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  Box, 
  InputBase, 
  IconButton, 
  MenuItem, 
  Typography,
  Chip,
  Fade,
  Zoom,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { 
  Search, 
  Close,
  TrendingUp,
  LocalOffer,
  KeyboardArrowRight,
} from '@mui/icons-material';
import api from '../../../utils/api';

const SearchBar = styled('div')(({ theme, focused }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.common.white, focused ? 0.9 : 0.8),
  '&:hover': { 
    backgroundColor: alpha(theme.palette.common.white, 0.95),
    transform: 'scale(1.02)',
  },
  marginLeft: 0,
  width: '100%',
  maxWidth: 400,
  minWidth: 300,
  transition: 'all 0.3s ease',
  border: focused ? '2px solid rgba(51, 51, 51, 0.3)' : '2px solid transparent',
  boxShadow: focused ? '0 0 20px rgba(51,51,51,0.1)' : 'none',
  [theme.breakpoints.down('sm')]: { 
    maxWidth: 250,
    minWidth: 200,
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'rgba(51, 51, 51, 0.8)',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: '#333',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 3, 1.5, 0), 
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create(['width', 'border-color']),
    width: '100%',
    fontSize: '1rem',
    fontWeight: 500,
    '&::placeholder': {
      color: 'rgba(51, 51, 51, 0.7)',
      opacity: 1,
    },
    [theme.breakpoints.up('sm')]: { 
      width: '25ch', 
      '&:focus': { 
        width: '35ch',
      } 
    },
  },
}));

const SuggestionItem = styled(MenuItem)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'rgba(31, 33, 34, 0.12)',
    transform: 'translateX(5px)',
  },
}));

export default function NavbarSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchRef = useRef();
  const navigate = useNavigate();
  const debounceTimerRef = useRef(null);

  // Debounce amélioré pour éviter trop d'appels API
  useEffect(() => {
    // Nettoyer le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Ne faire la recherche que si le terme a au moins 2 caractères
    if (searchTerm.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else if (searchTerm.trim().length === 0) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setError(null);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  const performSearch = async () => {
    if (searchTerm.trim().length < 2) return;

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Recherche en cours pour:', searchTerm);
      const res = await api.get(`/products/search?q=${encodeURIComponent(searchTerm.trim())}`);
      
      console.log('✅ Résultats de recherche:', res.data);
      
      if (res.data.success) {
        setFilteredSuggestions(res.data.data || []);
        setShowSuggestions(true);
      } else {
        setError(res.data.message || 'Erreur lors de la recherche');
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('❌ Erreur recherche :', err);
      setError('Erreur de connexion. Vérifiez votre connexion internet.');
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setError(null);
  };

  const handleSelect = (productId) => {
    console.log('🎯 Navigation vers le produit:', productId);
    console.log('📍 URL de navigation:', `/product/${productId}`);
    
    // Fermer le menu de suggestions
    setSearchTerm('');
    setShowSuggestions(false);
    setError(null);
    
    // Navigation avec React Router
    navigate(`/product/${productId}`);
  };

  const handleClickOutside = (e) => {
    // Vérifier si le clic est en dehors du menu de recherche
    const searchElement = searchRef.current;
    const isClickInSearch = searchElement && searchElement.contains(e.target);
    
    // Vérifier si le clic est dans le portail (menu de suggestions)
    const suggestionsElement = document.querySelector('[data-suggestions-portal]');
    const isClickInSuggestions = suggestionsElement && suggestionsElement.contains(e.target);
    
    if (!isClickInSearch && !isClickInSuggestions) {
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredSuggestions.length > 0) {
      handleSelect(filteredSuggestions[0]._id);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getProductPrice = (product) => {
    if (product.discount > 0) {
      const discountedPrice = product.price * (1 - product.discount / 100);
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              textDecoration: 'line-through', 
              color: 'text.secondary',
              fontSize: '0.8rem'
            }}
          >
            {product.price.toFixed(2)}€
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'error.main', 
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          >
            {discountedPrice.toFixed(2)}€
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
      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {product.price.toFixed(2)}€
      </Typography>
    );
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    setIsFocused(false);
  };

  // Image placeholder sécurisée
  const getPlaceholderImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjBGMDBGMCIvPgo8cGF0aCBkPSJNMTIgMTJIMjhWMjhIMTJWMjJaIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0xNiAxNkgyNFYyNEgxNlYxNloiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+';
  };

  return (
    <Box ref={searchRef} sx={{ position: 'relative', width: '100%' }}>
      <SearchBar focused={isFocused}>
        <SearchIconWrapper>
          {isLoading ? (
            <CircularProgress size={20} sx={{ color: 'rgba(255,255,255,0.8)' }} />
          ) : (
            <Search />
          )}
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Rechercher un produit..."
          inputProps={{ 'aria-label': 'search' }}
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (searchTerm.length >= 2 && filteredSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => setIsFocused(false)}
          className="search-input"
        />
        {searchTerm && (
          <Tooltip title="Effacer la recherche">
            <IconButton
              size="small"
              onClick={clearSearch}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255,255,255,0.7)',
                zIndex: 10,
                '&:hover': {
                  color: 'white',
                  transform: 'translateY(-50%) scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <Close fontSize="small" sx={{color:'red'}} />
            </IconButton>
          </Tooltip>
        )}
      </SearchBar>

      {/* Suggestions avec Portail React */}
      {showSuggestions && createPortal(
        <Fade in={true}>
          <Box
            data-suggestions-portal="true"
            sx={{
              position: 'fixed',
              top: '80px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 99999, // Z-index très élevé
              backgroundColor: 'white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: 2,
              width: '90vw',
              maxWidth: 600,
              maxHeight: 400,
              overflowY: 'auto',
              color: 'black',
              border: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            {error ? (
              <Alert severity="error" sx={{ m: 1 }}>
                {error}
              </Alert>
            ) : filteredSuggestions.length > 0 ? (
              <>
                <Box sx={{ p: 1, borderBottom: '1px solid #eee' }}>
                  <Typography variant="caption" color="text.secondary">
                    {filteredSuggestions.length} résultat{filteredSuggestions.length > 1 ? 's' : ''} trouvé{filteredSuggestions.length > 1 ? 's' : ''}
                  </Typography>
                </Box>
                {filteredSuggestions.map((product, index) => (
                  <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }} key={product._id}>
                    <SuggestionItem 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🖱️ Clic sur produit:', product._id);
                        handleSelect(product._id);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                        <Box
                          component="img"
                          src={product.images?.[0]?.url || getPlaceholderImage()}
                          alt={product.name}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            objectFit: 'cover',
                            border: '1px solid #eee',
                          }}
                          onError={(e) => {
                            e.target.src = getPlaceholderImage();
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {product.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={product.category} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            {product.discount > 0 && (
                              <LocalOffer sx={{ fontSize: 16, color: 'error.main' }} />
                            )}
                            {product.stock <= 5 && product.stock > 0 && (
                              <Chip 
                                label={`Stock: ${product.stock}`} 
                                size="small" 
                                color="warning"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getProductPrice(product)}
                        <KeyboardArrowRight sx={{ fontSize: 16, color: 'text.secondary' }} />
                      </Box>
                    </SuggestionItem>
                  </Zoom>
                ))}
              </>
            ) : searchTerm.length >= 2 && !isLoading && filteredSuggestions.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Aucun produit trouvé pour "{searchTerm}"
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Essayez avec d'autres mots-clés
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Fade>,
        document.body // Rendu directement dans le body
      )}
    </Box>
  );
}
