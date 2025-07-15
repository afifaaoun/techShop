import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Skeleton,
  Alert,
  Button,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  Clear,
} from '@mui/icons-material';
import api from '../../utils/api';
import ProductCard from './ProductCard';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Hook pour debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [pagesCount, setPagesCount] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);

  const query = useQuery();
  const category = query.get('category');
  const navigate = useNavigate();

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (sort) params.append('sort', sort);
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        params.append('page', page);
        params.append('limit', 12);

        console.log('🔍 Fetching products with params:', params.toString());
        const res = await api.get(`/products?${params.toString()}`);
        console.log('✅ Products response:', res.data);
        
        setProducts(res.data.data);
        setPagesCount(res.data.pages);
        setTotalProducts(res.data.total || 0);
      } catch (err) {
        console.error('❌ Erreur chargement produits', err);
        setProducts([]);
        setPagesCount(1);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category, sort, page, debouncedSearchTerm]);

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSort('');
    setSearchTerm('');
    setPage(1);
    // Rediriger vers la page shop sans filtres
    navigate('/shop');
  };

  const getSortLabel = (value) => {
    const sortOptions = {
      'price': 'Prix croissant',
      '-price': 'Prix décroissant',
      'name': 'Nom (A → Z)',
      '-name': 'Nom (Z → A)',
      'rating': 'Note décroissante',
      '-rating': 'Note croissante',
      'createdAt': 'Plus récents',
      '-createdAt': 'Plus anciens',
    };
    return sortOptions[value] || 'Trier par...';
  };

  const renderSkeletons = () => {
    return Array.from({ length: 12 }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <Box
          sx={{
            width: 300,
            height: 550,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden',
            backgroundColor: 'background.paper',
          }}
        >
          {/* Image skeleton */}
          <Box sx={{ height: 280, backgroundColor: '#f5f5f5' }}>
            <Skeleton variant="rectangular" height={280} />
          </Box>
          
          {/* Content skeleton */}
          <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', height: 200 }}>
            {/* Category skeleton */}
            <Skeleton variant="rectangular" width={80} height={24} sx={{ mb: 1, borderRadius: 1 }} />
            
            {/* Rating skeleton */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Skeleton variant="rectangular" width={100} height={20} />
              <Skeleton variant="text" width={40} />
            </Box>
            
            {/* Title skeleton */}
            <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
            
            {/* Price skeleton */}
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
            
            {/* Button skeleton */}
            <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1.5 }} />
          </Box>
        </Box>
      </Grid>
    ));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* En-tête avec titre et statistiques */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
          }}
        >
          {category ? `${category}` : 'Tous nos produits'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Chip
            label={`${totalProducts} produit${totalProducts > 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
          />
          {category && (
            <Chip
              label={`Catégorie: ${category}`}
              color="secondary"
              variant="outlined"
              onDelete={() => navigate('/shop')}
            />
          )}
        </Box>
      </Box>

      {/* Filtres et recherche */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          {/* Barre de recherche */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={handleSearchChange}
              slotProps={{
                inputAdornment: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Grid>

          {/* Tri */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Sort fontSize="small" />
                  Trier par
                </Box>
              </InputLabel>
              <Select
                value={sort}
                onChange={handleSortChange}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Sort fontSize="small" />
                    Trier par
                  </Box>
                }
              >
                <MenuItem value="">Trier par...</MenuItem>
                <MenuItem value="price">Prix croissant</MenuItem>
                <MenuItem value="-price">Prix décroissant</MenuItem>
                <MenuItem value="name">Nom (A → Z)</MenuItem>
                <MenuItem value="-name">Nom (Z → A)</MenuItem>
                <MenuItem value="rating">Note décroissante</MenuItem>
                <MenuItem value="-rating">Note croissante</MenuItem>
                <MenuItem value="createdAt">Plus récents</MenuItem>
                <MenuItem value="-createdAt">Plus anciens</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Effacer les filtres */}
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<FilterList />}
              disabled={!sort && !searchTerm && !category}
              fullWidth
              sx={{
                borderColor: 'error.main',
                color: 'error.main',
                '&:hover': {
                  borderColor: 'error.dark',
                  backgroundColor: 'error.light',
                  color: 'error.contrastText',
                },
              }}
            >
              Effacer les filtres
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Grille de produits */}
      {loading ? (
        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
          {renderSkeletons()}
        </Grid>
      ) : products.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Aucun produit trouvé. Essayez de modifier vos critères de recherche.
        </Alert>
      ) : (
        <>
          <Grid
            container
            spacing={3}
            sx={{
              mb: 4,
              justifyContent: 'center',
            }}
          >
            {products.map((product) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={product._id}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagesCount > 1 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 4,
              }}
            >
              <Pagination
                count={pagesCount}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
