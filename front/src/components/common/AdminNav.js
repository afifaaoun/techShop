import React from 'react';
import { Box, Tabs, Tab, Paper, Typography, Divider } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Dashboard as DashboardIcon, 
  Inventory as ProductsIcon, 
  People as UsersIcon, 
  ShoppingCart as OrdersIcon 
} from '@mui/icons-material';

const adminTabs = [
  { 
    label: 'Dashboard', 
    path: '/admin/dashboard',
    icon: <DashboardIcon />
  },
  { 
    label: 'Produits', 
    path: '/admin/products',
    icon: <ProductsIcon />
  },
  { 
    label: 'Utilisateurs', 
    path: '/admin/users',
    icon: <UsersIcon />
  },
  { 
    label: 'Commandes', 
    path: '/admin/orders',
    icon: <OrdersIcon />
  },
];

export default function AdminNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = adminTabs.findIndex(tab => location.pathname.startsWith(tab.path));

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        mb: 2, 
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: '1px solid rgba(0,0,0,0.08)'
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <Typography variant="h6" fontWeight={600} color="primary">
          Administration
        </Typography>
      </Box>
      <Tabs
        value={currentTab === -1 ? false : currentTab}
        onChange={(_, idx) => navigate(adminTabs[idx].path)}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            minHeight: 64,
            fontSize: '0.9rem',
            fontWeight: 500,
            textTransform: 'none',
            '&.Mui-selected': {
              fontWeight: 600,
            },
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        {adminTabs.map((tab, index) => (
          <Tab 
            key={tab.path} 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {tab.icon}
                {tab.label}
              </Box>
            }
            sx={{
              minWidth: 'auto',
              px: 3,
            }}
          />
        ))}
      </Tabs>
    </Paper>
  );
} 