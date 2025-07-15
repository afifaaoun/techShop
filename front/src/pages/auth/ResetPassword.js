import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Lock,
  CheckCircle,
  Error
} from '@mui/icons-material';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { 
        password: formData.password 
      });
      
      setSuccess(true);
      showSuccess('Mot de passe mis à jour avec succès !');
      
      // Redirection après 3 secondes
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      showError(error.response?.data?.error || 'Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f5dc 0%, #e9e5da 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}>
        <Paper elevation={4} sx={{ 
          p: 4, 
          borderRadius: 3, 
          textAlign: 'center',
          minWidth: 340, 
          width: '100%', 
          maxWidth: 500 
        }}>
          <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} mb={2}>
            Mot de passe mis à jour !
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Votre mot de passe a été réinitialisé avec succès. 
            Vous allez être redirigé vers la page de connexion.
          </Typography>
          <CircularProgress size={24} />
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f5dc 0%, #e9e5da 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Paper elevation={4} sx={{ 
        p: 4, 
        borderRadius: 3,
        minWidth: 340, 
        width: '100%', 
        maxWidth: 500 
      }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Lock sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight={700} mb={1}>
            Réinitialiser le mot de passe
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Entrez votre nouveau mot de passe ci-dessous
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            label="Nouveau mot de passe"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            required
          />

          <TextField
            fullWidth
            label="Confirmer le mot de passe"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            fullWidth
            sx={{ 
              py: 1.5, 
              fontWeight: 600, 
              borderRadius: 2, 
              fontSize: '1.1rem',
              mt: 2
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Réinitialisation...
              </>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </Button>

          <Button
            variant="text"
            color="primary"
            onClick={() => navigate('/login')}
            disabled={loading}
            fullWidth
            sx={{ 
              py: 1.5, 
              fontWeight: 600, 
              borderRadius: 2, 
              fontSize: '1.1rem'
            }}
          >
            Retour à la connexion
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
