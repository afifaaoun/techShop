import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {Container,Typography,Avatar,IconButton,Divider,Box,Button,Card,CardContent,Grid,Chip,Alert,} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { CartContext } from '../../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, loading } = useContext(CartContext);
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Chargement du panier...</Typography>
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Votre panier est vide.</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/shop')}
            sx={{ mt: 2 }}
          >
            Découvrir nos produits
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mon Panier ({cart.count} article{cart.count > 1 ? 's' : ''})
      </Typography>
      <Grid container spacing={3}>
        {/* Liste des produits */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Produits ({cart.items.length})
              </Typography>
              
              {cart.items.map((item, index) => {
                const product = item.product && typeof item.product === 'object' ? item.product : null;
                const productId = product?._id || item.product || Math.random().toString();
                const productName = product?.name || 'Produit inconnu';
                const productImage = product?.images?.[0]?.url || 'https://via.placeholder.com/80';
                const productPrice = item.price || 0;
                const itemTotal = productPrice * item.quantity;

                return (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        {/* Image du produit */}
                        <Grid item xs={3} sm={2}>
                          <Avatar
                            variant="square"
                            src={productImage}
                            alt={productName}
                            sx={{ width: 80, height: 80 }}
                          />
                        </Grid>

                        {/* Informations du produit */}
                        <Grid item xs={9} sm={4}>
                          <Typography variant="h6" noWrap>
                            {productName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {productPrice.toFixed(2)} DT l'unité
                          </Typography>
                          <Chip 
                            label={
                              product?.stock !== undefined && product?.stock !== null
                                ? `Stock: ${product.stock}`
                                : 'Stock: N/A'
                            }
                            size="small"
                            color={
                              product?.stock !== undefined && product?.stock !== null
                                ? (product.stock > 0 ? "success" : "error")
                                : "default"
                            }
                            sx={{ mt: 1 }}
                          />
                          {product?.stock !== undefined && 
                           product?.stock !== null && 
                           product.stock > 0 && 
                           product.stock <= 5 && (
                            <Alert severity="warning" sx={{ mt: 1, fontSize: '0.75rem' }}>
                              Stock limité !
                            </Alert>
                          )}
                        </Grid>

                        {/* Contrôles de quantité */}
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              color="primary"
                            >
                              <RemoveIcon />
                            </IconButton>
                            
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                mx: 2, 
                                minWidth: '40px', 
                                textAlign: 'center',
                                fontWeight: 'bold'
                              }}
                            >
                              {item.quantity}
                            </Typography>
                            
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(productId, item.quantity + 1)}
                              color="primary"
                              disabled={
                                product?.stock !== undefined && 
                                product?.stock !== null && 
                                item.quantity >= product.stock
                              }
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                        </Grid>

                        {/* Prix total de l'article */}
                        <Grid item xs={6} sm={2}>
                          <Typography variant="h6" fontWeight="bold" textAlign="center">
                            {itemTotal.toFixed(2)} DT
                          </Typography>
                        </Grid>

                        {/* Bouton supprimer */}
                        <Grid item xs={6} sm={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <IconButton
                              color="error"
                              onClick={() => removeFromCart(productId)}
                              aria-label="supprimer"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </Card>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>

        {/* Résumé de la commande */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Résumé de la commande
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sous-total ({cart.count} article{cart.count > 1 ? 's' : ''})
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {cart.total?.toFixed(2)} DT
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Total
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {cart.total?.toFixed(2)} DT
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/order')}
                >
                  Passer à la caisse
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/shop')}
                >
                  Continuer mes achats
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
