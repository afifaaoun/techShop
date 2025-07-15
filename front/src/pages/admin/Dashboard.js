import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Table, TableBody, TableCell, TableHead, TableRow, Avatar, CircularProgress } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../utils/api';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [salesStats, setSalesStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [latestOrders, setLatestOrders] = useState([]);
  const [latestUsers, setLatestUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const [sales, users, top, orders, newUsers] = await Promise.all([
        api.get('/orders/stats/sales'),
        api.get('/users/stats/registrations'),
        api.get('/products/top'),
        api.get('/orders/latest'),
        api.get('/users/latest')
      ]);
      setSalesStats(sales.data.data);
      setUserStats(users.data.data);
      setTopProducts(top.data.data);
      setLatestOrders(orders.data.data);
      setLatestUsers(newUsers.data.data);
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  // Graphique ventes
  const salesLabels = salesStats.map(s => s.label);
  const salesData = {
    labels: salesLabels,
    datasets: [
      {
        label: 'CA (DT)',
        data: salesStats.map(s => s.total),
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.2)',
        yAxisID: 'y',
      },
      {
        label: 'Commandes',
        data: salesStats.map(s => s.count),
        borderColor: '#43a047',
        backgroundColor: 'rgba(67, 160, 71, 0.2)',
        yAxisID: 'y1',
      }
    ]
  };
  const salesOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Ventes (12 derniers mois)' } },
    scales: {
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'CA (DT)' } },
      y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Commandes' } }
    }
  };

  // Graphique inscriptions
  const userLabels = userStats.map(s => s.label);
  const userData = {
    labels: userLabels,
    datasets: [
      {
        label: 'Nouveaux utilisateurs',
        data: userStats.map(s => s.count),
        backgroundColor: '#1976d2',
      }
    ]
  };
  const userOptions = {
    responsive: true,
    plugins: { legend: { display: false }, title: { display: true, text: 'Inscriptions (12 derniers mois)' } }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" fontWeight={700} mb={3}>Dashboard Admin</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Line data={salesData} options={salesOptions} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Bar data={userData} options={userOptions} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Top Produits</Typography>
            {topProducts.length === 0 ? <Typography>Aucun produit vendu.</Typography> : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Produit</TableCell>
                    <TableCell>Ventes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map(prod => (
                    <TableRow key={prod._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {prod.image && <Avatar src={prod.image} alt={prod.name} sx={{ width: 32, height: 32 }} />}
                          {prod.name}
                        </Box>
                      </TableCell>
                      <TableCell>{prod.totalSold}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Dernières Commandes</Typography>
            {latestOrders.length === 0 ? <Typography>Aucune commande.</Typography> : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestOrders.map(order => (
                    <TableRow key={order._id}>
                      <TableCell>{order._id.slice(-8)}</TableCell>
                      <TableCell>{order.user?.name || 'Utilisateur'}</TableCell>
                      <TableCell>{order.totalPrice?.toFixed(2)} DT</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Nouveaux Utilisateurs</Typography>
            {latestUsers.length === 0 ? <Typography>Aucun nouvel utilisateur.</Typography> : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestUsers.map(user => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 