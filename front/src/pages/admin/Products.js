import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../../utils/api';

export default function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/products/categories');
        if (response.data && response.data.categories) {
          setCategories(response.data.categories.map(cat => cat.key));
        }
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage, searchTerm, categoryFilter]);

  useEffect(() => {
    if (selectedProduct) {
      setLoadingReviews(true);
      api.get(`/reviews/product/${selectedProduct._id}`)
        .then(res => setProductReviews(res.data.data || []))
        .catch(() => setProductReviews([]))
        .finally(() => setLoadingReviews(false));
    } else {
      setProductReviews([]);
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `/products?page=${page + 1}&limit=${rowsPerPage}`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      if (categoryFilter) {
        url += `&category=${encodeURIComponent(categoryFilter)}`;
      }

      const response = await api.get(url);
      setProducts(response.data.data || []);
      setTotalProducts(response.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await api.delete(`/products/${productToDelete._id}`);
      setProducts(products.filter(p => p._id !== productToDelete._id));
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  };

  const getStockColor = (stock) => {
    if (stock <= 0) return 'error';
    if (stock <= 5) return 'warning';
    return 'success';
  };

  if (loading && products.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'row', gap: 3 }}>
      {/* Partie principale: tableau et filtres */}
      <Box sx={{ flex: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Gestion des Produits
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/products/new')}
          >
            Ajouter un produit
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {/* Filtres et recherche */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Rechercher un produit"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 250 }}
              slotProps={{
                inputAdornment: {
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={categoryFilter}
                label="Catégorie"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">Toutes les catégories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>
        {/* Tableau des produits */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Prix</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Box
                        component="img"
                        src={product.images?.[0]?.url || '/default-product.png'}
                        alt={product.name}
                        sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.description?.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatPrice(product.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.stock}
                        color={getStockColor(product.stock)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2">
                          {product.rating?.toFixed(2) || '0.00'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({product.numReviews || 0})
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setProductToDelete(product);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalProducts}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </Paper>
        {/* Dialog de confirmation de suppression */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          sx={{ zIndex: 1300 }}
        >
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer le produit "{productToDelete?.name}" ?
              Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleDeleteProduct} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* Panneau latéral de détails produit */}
      {selectedProduct && (
        <Paper sx={{ flex: 1, p: 3, minWidth: 320, maxWidth: 400, position: 'relative', boxShadow: 4, height: 'fit-content' }}>
          <IconButton
            size="small"
            onClick={() => setSelectedProduct(null)}
            sx={{ position: 'absolute', top: 8, right: 8 }}
            aria-label="Fermer"
          >
            <CloseIcon />
          </IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Box
              component="img"
              src={selectedProduct.images?.[0]?.url || '/default-product.png'}
              alt={selectedProduct.name}
              sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 2, mb: 2 }}
            />
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {selectedProduct.name}
            </Typography>
            <Chip label={selectedProduct.category} color="primary" size="small" sx={{ mb: 1 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {selectedProduct.description}
            </Typography>
          </Box>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <li><strong>Prix :</strong> {formatPrice(selectedProduct.price)}</li>
            <li><strong>Stock :</strong> {selectedProduct.stock}</li>
                            <li><strong>Note :</strong> {selectedProduct.rating?.toFixed(2) || '0.00'} ({selectedProduct.numReviews || 0} avis)</li>
            <li><strong>Réduction :</strong> {selectedProduct.discount}%</li>
            <li><strong>Tags :</strong> {selectedProduct.tags?.join(', ')}</li>
          </Box>
          {/* Liste des avis */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Avis des clients</Typography>
            {loadingReviews ? (
              <Typography variant="body2">Chargement...</Typography>
            ) : productReviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Aucun avis pour ce produit.</Typography>
            ) : (
              <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {productReviews.map((review) => (
                  <Paper key={review._id} sx={{ p: 1.5, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>{review.user?.name || 'Utilisateur'}</Typography>
                      <Chip label={review.rating} size="small" color="primary" />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{review.comment}</Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            startIcon={<EditIcon />}
            onClick={() => navigate(`/admin/products/${selectedProduct._id}/edit`)}
          >
            Éditer ce produit
          </Button>
        </Paper>
      )}
    </Box>
  );
} 