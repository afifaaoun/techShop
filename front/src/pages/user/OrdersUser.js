import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

export default function OrdersUser() {
  const { user } = useContext(AuthContext);
  
  // console.log('🔍 Orders - user:', user);
  // console.log('🔍 Orders - user type:', typeof user);
  // console.log('🔍 Orders - user is null:', user === null);
  // console.log('🔍 Orders - user is undefined:', user === undefined);
  
  // Tous les hooks doivent être appelés avant tout return conditionnel
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    console.log('📡 Orders - Début fetchOrders');
    try {
      setLoading(true);
      const response = await api.get('/orders/my-orders');
      console.log('✅ Orders - Réponse API:', response.data);
      setOrders(response.data.data);
    } catch (error) {
      console.error('❌ Orders - Erreur API:', error);
      console.error('❌ Orders - Erreur response:', error.response);
      setError('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 Orders - useEffect déclenché, user:', user);
    if (user) {
      console.log('✅ Orders - User existe, appel fetchOrders');
      fetchOrders();
    } else {
      console.log('❌ Orders - User n\'existe pas, pas d\'appel API');
    }
  }, [user]);

  // Affichage si non connecté (après tous les hooks)
  if (!user) {
    console.log('❌ Orders - User non connecté, affichage message d\'erreur');
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Vous devez être connecté pour voir vos commandes.
        </Typography>
      </Container>
    );
  }

  console.log('✅ Orders - User connecté, affichage des commandes');
  console.log('📊 Orders - orders:', orders);
  console.log('📊 Orders - loading:', loading);
  console.log('📊 Orders - error:', error);

  const statusLabels = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  };
  const statusColors = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
  };

  const getStatusColor = (order) => statusColors[order.status] || 'default';
  const getStatusText = (order) => statusLabels[order.status] || order.status;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement de vos commandes...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchOrders}>
          Réessayer
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mes Commandes
      </Typography>

      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Vous n'avez pas encore de commandes
          </Typography>
          <Button variant="contained" href="/shop" sx={{ mt: 2 }}>
            Découvrir nos produits
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Commande #{order._id.slice(-8)}
                    </Typography>
                    <Chip
                      label={getStatusText(order)}
                      color={getStatusColor(order)}
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Passée le {formatDate(order.createdAt)}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Produits */}
                  <Typography variant="subtitle1" gutterBottom>
                    Produits commandés :
                  </Typography>
                  {order.orderItems.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        {item.name} × {item.quantity}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {(item.price * item.quantity).toFixed(2)} DT
                      </Typography>
                    </Box>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  {/* Adresse de livraison */}
                  <Typography variant="subtitle2" gutterBottom>
                    Adresse de livraison :
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.shippingInfo.address}<br />
                    {order.shippingInfo.postalCode} {order.shippingInfo.city}<br />
                    {order.shippingInfo.country}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {/* Totaux */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Sous-total :</Typography>
                    <Typography>{order.itemsPrice.toFixed(2)} DT</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Frais de livraison :</Typography>
                    <Typography>{order.shippingPrice.toFixed(2)} DT</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>TVA :</Typography>
                    <Typography>{order.taxPrice.toFixed(2)} DT</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight="bold">
                      Total :
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {order.totalPrice.toFixed(2)} DT
                    </Typography>
                  </Box>

                  {/* Méthode de paiement */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Méthode de paiement : {order.paymentMethod}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
} 