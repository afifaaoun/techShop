import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';

import Navbar from './components/common/Navbar/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import Profile from './pages/user/Profile';
import OrdersUser from './pages/user/OrdersUser';
import Favorites from './pages/user/Favorites';
import ProductList from './pages/shop/ProductList';
import Cart from './pages/user/Cart';
import Order from './pages/user/Order';
import ProductDetailWrapper from './pages/shop/ProductDetailWrapper';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ProtectedRoute from './components/common/ProtectedRoute';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Users from './pages/admin/Users';
import Orders from './pages/admin/Orders';
import ProductForm from './pages/admin/ProductForm';
import AdminNav from './components/common/AdminNav';
import AdminQuickNav from './components/common/AdminQuickNav';
import ScrollToTop from './components/common/ScrollToTop';
import { AuthContext } from './context/AuthContext';
import './App.css'

function HomeOrRedirect() {
  const { user } = React.useContext(AuthContext);
  
  // Éviter les redirections automatiques si l'utilisateur est déjà sur la page
  if (user && user.role === 'admin' && window.location.pathname === '/') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <Home />;
}

function App() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin/');

  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <ToastProvider>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: '100vh'
            }}>
              <ScrollToTop />
              <Navbar />
              
              {/* Menu classique pour les pages admin */}
              {isAdminPage && <AdminNav />}
              
              {/* Navigation rapide pour les pages admin */}
              {isAdminPage && <AdminQuickNav />}
              
              {/* Contenu principal avec flex grow pour pousser le footer vers le bas */}
              <Box sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                pt: isAdminPage ? '80px' : '120px',
                // Empêcher les redirections automatiques de scroll
                scrollBehavior: 'auto'
              }}>
                <Routes>
                  <Route path="/" element={<HomeOrRedirect />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email/:token" element={<VerifyEmail />} />
                  <Route path="/shop" element={<ProductList />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/order" element={<Order />} />
                  <Route path="/product/:id" element={<ProductDetailWrapper />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />

                  <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/orders" element={<OrdersUser />} />
                    <Route path="/favorites" element={<Favorites />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/products" element={<Products />} />
                    <Route path="/admin/products/new" element={<ProductForm mode="create" />} />
                    <Route path="/admin/products/:id/edit" element={<ProductForm mode="edit" />} />
                    <Route path="/admin/users" element={<Users />} />
                    <Route path="/admin/orders" element={<Orders />} />
                  </Route>
                </Routes>
              </Box>
              
              {/* Footer sur toutes les pages */}
              <Footer />
            </Box>
          </ToastProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
