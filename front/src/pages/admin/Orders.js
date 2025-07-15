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
  Alert,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelledIcon
} from '@mui/icons-material';
import api from '../../utils/api';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [totalOrders, setTotalOrders] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orderStatuses = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ];

  const statusColors = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
  };

  const statusLabels = {
    pending: 'En attente',
    processing: 'En traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  };

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/orders?page=${page + 1}&limit=${rowsPerPage}`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      if (statusFilter) {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }

      const response = await api.get(url);
      setOrders(response.data.data || []);
      setTotalOrders(response.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      await api.delete(`/orders/${orderToDelete._id}`);
      setOrders(orders.filter(o => o._id !== orderToDelete._id));
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}`, {
        status: newStatus
      });
      
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'shipped': return <ShippingIcon />;
      case 'delivered': return <DeliveredIcon />;
      case 'cancelled': return <CancelledIcon />;
      default: return null;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'row', gap: 3 }}>
      <Box sx={{ flex: 2, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Gestion des Commandes
          </Typography>
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
              label="Rechercher une commande"
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
              <InputLabel>Statut</InputLabel>
              <Select
                value={statusFilter}
                label="Statut"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">Tous les statuts</MenuItem>
                {orderStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {statusLabels[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Tableau des commandes */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Commande</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Montant</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          #{order._id.slice(-8)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.orderItems?.length || 0} article(s)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={order.user?.avatar?.url}
                          alt={order.user?.name}
                          sx={{ width: 32, height: 32 }}
                        >
                          {order.user?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {order.user?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {order.user?.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {formatPrice(order.totalPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[order.status]}
                        color={statusColors[order.status]}
                        size="small"
                        icon={getStatusIcon(order.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(order.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setOrderToDelete(order);
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
            count={totalOrders}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </Paper>
      </Box>
      {selectedOrder && (
        <Paper sx={{ flex: 1, p: 3, minWidth: 340, maxWidth: 480, position: 'relative', boxShadow: 4, height: 'fit-content' }}>
          <IconButton
            size="small"
            onClick={() => setSelectedOrder(null)}
            sx={{ position: 'absolute', top: 8, right: 8 }}
            aria-label="Fermer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24"><path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"/></svg>
          </IconButton>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Détail de la commande
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2"><strong>ID :</strong> {selectedOrder._id}</Typography>
            <Typography variant="body2"><strong>Date :</strong> {formatDate(selectedOrder.createdAt)}</Typography>
            <Typography variant="body2"><strong>Client :</strong> {selectedOrder.user?.name || 'Utilisateur'} ({selectedOrder.user?.email})</Typography>
            <Typography variant="body2"><strong>Statut :</strong> {statusLabels[selectedOrder.status] || selectedOrder.status}</Typography>
            <Typography variant="body2"><strong>Total :</strong> {formatPrice(selectedOrder.totalPrice)}</Typography>
            <Typography variant="body2"><strong>Méthode de paiement :</strong> {selectedOrder.paymentMethod}</Typography>
            <Typography variant="body2"><strong>Adresse de livraison :</strong> {selectedOrder.shippingInfo?.address}, {selectedOrder.shippingInfo?.city}, {selectedOrder.shippingInfo?.country}</Typography>
          </Box>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Articles</Typography>
          <Box sx={{ maxHeight: 180, overflowY: 'auto', mb: 2 }}>
            {selectedOrder.orderItems?.map(item => (
              <Paper key={item.product} sx={{ p: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <img src={item.image} alt={item.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
                    <Typography variant="caption">x{item.quantity} — {formatPrice(item.price)}</Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={selectedOrder.status}
                label="Statut"
                onChange={e => handleUpdateOrderStatus(selectedOrder._id, e.target.value)}
              >
                {orderStatuses.map(status => (
                  <MenuItem key={status} value={status}>{statusLabels[status]}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setOrderToDelete(selectedOrder);
                setDeleteDialogOpen(true);
              }}
              startIcon={<DeleteIcon />}
              fullWidth
            >
              Supprimer
            </Button>
          </Box>
        </Paper>
      )}

      {/* Dialog de confirmation de suppression */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        sx={{ zIndex: 1300 }}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer la commande #{orderToDelete?._id?.slice(-8)} ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeleteOrder} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 