import React from 'react';
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  People as UsersIcon,
  ShoppingCart as OrdersIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const actions = [
  {
    icon: <DashboardIcon />,
    name: 'Dashboard',
    path: '/admin/dashboard',
    color: 'primary'
  },
  {
    icon: <ProductsIcon />,
    name: 'Produits',
    path: '/admin/products',
    color: 'secondary'
  },
  {
    icon: <UsersIcon />,
    name: 'Utilisateurs',
    path: '/admin/users',
    color: 'success'
  },
  {
    icon: <OrdersIcon />,
    name: 'Commandes',
    path: '/admin/orders',
    color: 'warning'
  },
];

export default function AdminQuickNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleAction = (path) => {
    navigate(path);
  };

  return (
    <SpeedDial
      ariaLabel="Navigation rapide admin"
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
        '& .MuiFab-primary': {
          backgroundColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        },
      }}
      icon={<SpeedDialIcon />}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={() => handleAction(action.path)}
          sx={{
            '& .MuiFab-root': {
              backgroundColor: action.color === 'primary' ? 'primary.main' :
                           action.color === 'secondary' ? 'secondary.main' :
                           action.color === 'success' ? 'success.main' :
                           action.color === 'warning' ? 'warning.main' : 'primary.main',
              '&:hover': {
                backgroundColor: action.color === 'primary' ? 'primary.dark' :
                             action.color === 'secondary' ? 'secondary.dark' :
                             action.color === 'success' ? 'success.dark' :
                             action.color === 'warning' ? 'warning.dark' : 'primary.dark',
              },
            },
          }}
        />
      ))}
    </SpeedDial>
  );
} 