// components/common/Navbar/Navbar.js
import React, { useContext, useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Tooltip,
  Chip,
} from '@mui/material';
import { 
  ShoppingCart, 
  ShoppingBag,
  Logout,
  Login,
  PersonAdd,
  Favorite,
  AdminPanelSettings,
  AccountCircle
} from '@mui/icons-material';
import { AuthContext } from '../../../context/AuthContext';
import { CartContext } from '../../../context/CartContext';
import { useFavorites } from '../../../context/FavoritesContext';
import NavbarSearch from './NavbarSearch';
import './Navbar.css';
import CategoryMenu from './CategoryMenu';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { getFavoritesCount } = useFavorites();
  const [guestCartItems, setGuestCartItems] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const location = useLocation();

  useEffect(() => {
    if (!user) {
      // Récupérer le panier invité depuis localStorage
      const guestCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
      setGuestCartItems(guestCart);
    } else {
      setGuestCartItems([]);
    }
  }, [user, cart]);

  // Calcul du nombre d'articles dans le panier (connecté ou invité)
  const itemCount = user
    ? (cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0)
    : guestCartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <Box>
      <AppBar 
        position="fixed"
        elevation={2}
        sx={{
          background: 'linear-gradient(135deg, #e9e5da 0%, #f5f5dc 100%)', 
          color: '#333',
          backdropFilter: 'blur(10px)',
          top: 0,
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ minHeight: '64px', position: 'relative' }}>
          {/* Logo */}
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            className="navbar-logo"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.5px',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 1,
            }}
          >
            🛍️ E-Shop
          </Typography>

          {/* Barre de recherche parfaitement centrée */}
          <Box sx={{ 
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}>
            {!(user && user.role === 'admin' && location.pathname.startsWith('/admin/')) && <NavbarSearch />}
          </Box>

          {/* Navigation et actions utilisateur */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto', zIndex: 1 }}>
            {/* Bouton Boutique */}
            {(!user || user.role !== 'admin') && (
              <Tooltip title="Parcourir nos produits">
                <Button 
                  component={RouterLink} 
                  to="/shop" 
                  color="inherit"
                  className="nav-button"
                  startIcon={<ShoppingBag />}
                  sx={{
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 2,
                  }}
                >
                  Boutique
                </Button>
              </Tooltip>
            )}

            {/* Menu utilisateur */}
            <Tooltip title={user ? (user.role === 'admin' ? "Admin" : "Mon compte") : "Se connecter"}>
              <IconButton 
                onClick={handleOpen} 
                color="inherit"
                className="user-avatar"
                sx={{
                  border: '2px solid transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.5)',
                    transform: 'scale(1.1)',
                  }
                }}
              >
                {user?.avatar ? (
                  <Avatar 
                    src={user.avatar} 
                    alt={user.name}
                    sx={{ width: 32, height: 32 }}
                  >
                    {user?.role === 'admin' && <AdminPanelSettings fontSize="meduim" sx={{ ml: 0.5,color:'rgba(231, 223, 223, 0.73)' }} />}
                  </Avatar>
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
                    {user?.role === 'admin' ? <AdminPanelSettings fontSize="meduim" sx={{ ml: 0.5,color:'rgba(26, 24, 24, 0.2)' }}/> : <AccountCircle sx={{ color: '#333' }} />}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>

            {/* Menu déroulant utilisateur */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              className="menu-dropdown"
              PaperProps={{
                elevation: 8,
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  '& .MuiMenuItem-root': {
                    borderRadius: 1,
                    mx: 1,
                    my: 0.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      transform: 'translateX(5px)',
                    }
                  }
                }
              }}
            >
              {!user ? [
                <MenuItem 
                  key="login"
                  component={RouterLink} 
                  to="/login" 
                  onClick={handleClose}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Login fontSize="small" />
                  Connexion
                </MenuItem>,
                <MenuItem 
                  key="register"
                  component={RouterLink} 
                  to="/register" 
                  onClick={handleClose}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <PersonAdd fontSize="small" />
                  Inscription
                </MenuItem>
              ] : [
                <MenuItem 
                  key="profile"
                  component={RouterLink} 
                  to="/profile" 
                  onClick={handleClose}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <AccountCircle fontSize="small" sx={{ color: '#333' }} />
                  Mon Profil
                </MenuItem>,
                user.role === 'admin' ? (
                  <MenuItem 
                    key="admin-dashboard"
                    component={RouterLink} 
                    to="/admin/dashboard" 
                    onClick={handleClose}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <AdminPanelSettings fontSize="small" />
                    Dashboard Admin
                  </MenuItem>
                ) : null,
                user.role !== 'admin' && (
                  <MenuItem 
                    key="orders"
                    component={RouterLink} 
                    to="/orders" 
                    onClick={handleClose}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <ShoppingBag fontSize="small" />
                    Mes Commandes
                  </MenuItem>
                ),
                user.role !== 'admin' && (
                  <MenuItem 
                    key="favorites"
                    component={RouterLink} 
                    to="/favorites" 
                    onClick={handleClose}
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Favorite fontSize="small" />
                    Mes Favoris
                    {getFavoritesCount() > 0 && (
                      <Chip 
                        label={getFavoritesCount()} 
                        size="small" 
                        color="error"
                        sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </MenuItem>
                ),
                <Divider key="divider" sx={{ my: 1 }} />,
                <MenuItem 
                  key="logout"
                  onClick={handleLogout}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'white',
                    }
                  }}
                >
                  <Logout fontSize="small" />
                  Se déconnecter
                </MenuItem>
              ]}
            </Menu>

            {/* Panier */}
            {(!user || user.role !== 'admin') && (
              <Tooltip title={`Panier (${itemCount} articles)`}>
                <IconButton
                  component={RouterLink}
                  to="/cart"
                  size="large"
                  aria-label={`panier avec ${itemCount} articles`}
                  color="inherit"
                  className="cart-badge"
                  sx={{ 
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <Badge 
                    badgeContent={itemCount} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        animation: itemCount > 0 ? 'pulse 2s infinite' : 'none',
                        top: '8px',
                        right: '8px',
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: '10px',
                      }
                    }}
                  >
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      {/* Menu de catégories - affiché pour tous sauf les admins */}
      {(!user || user.role !== 'admin') && <CategoryMenu />}
    </Box>
  );
}
