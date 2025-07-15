import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import LoginForm from '../../components/auth/LoginForm';

export default function Login() {
  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password, formData.rememberMe);
      if (result.success) {
        showSuccess('Connexion réussie');
        // Rediriger selon le rôle de l'utilisateur
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        showError(result.error || 'Erreur de connexion');
      }
    } catch (err) {
      showError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f5dc 0%, #e9e5da 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, minWidth: 340, width: '100%', maxWidth: 400 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={2}>Connexion</Typography>
        <LoginForm onSubmit={handleSubmit} loading={loading} />
        <Typography variant="body2" align="center" mt={3}>
          <Link to="/forgot-password" style={{ textDecoration: 'underline', color: '#1976d2' }}>
            Mot de passe oublié ?
          </Link>
        </Typography>
        <Typography variant="body2" align="center" mt={1}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ textDecoration: 'underline', color: '#1976d2' }}>
            S'inscrire
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
