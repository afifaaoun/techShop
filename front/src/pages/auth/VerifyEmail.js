import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Button, CircularProgress } from '@mui/material';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationCompleted, setVerificationCompleted] = useState(false);

  useEffect(() => {
    if (token && !verificationCompleted) {
      verifyEmail();
    } else if (!token) {
      setLoading(false);
    }
  }, [token, verificationCompleted]);

  const verifyEmail = async () => {
    if (verifying || verificationCompleted) return;
    
    setVerifying(true);
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      if (response.data.success) {
        setVerificationCompleted(true);
        showSuccess(response.data.message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur de vérification:', error);
      // Ne pas afficher d'erreur si c'est déjà vérifié ou si c'est une erreur de réseau temporaire
      if (error.response?.status !== 400) {
        showError(error.response?.data?.message || 'Erreur lors de la vérification de l\'email');
      }
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (verifying) return;
    
    setVerifying(true);
    try {
      const response = await api.post('/auth/resend-verification', { email: '' });
      if (response.data.success) {
        showSuccess(response.data.message);
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f5dc 0%, #e9e5da 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Vérification de votre email...
          </Typography>
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
    }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, minWidth: 340, width: '100%', maxWidth: 500 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={3}>
          Vérification d'Email
        </Typography>
        
        <Typography variant="body1" textAlign="center" mb={3}>
          {verifying ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Vérification en cours...
            </>
          ) : verificationCompleted ? (
            'Vérification réussie ! Redirection en cours...'
          ) : (
            'Cliquez sur le bouton ci-dessous pour vérifier votre email'
          )}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={verifyEmail}
            disabled={verifying || verificationCompleted}
            fullWidth
            sx={{ py: 1.5, fontWeight: 600, borderRadius: 2, fontSize: '1.1rem' }}
          >
            {verifying ? 'Vérification...' : verificationCompleted ? 'Vérifié' : 'Vérifier mon email'}
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={handleResendVerification}
            disabled={verifying || verificationCompleted}
            fullWidth
            sx={{ py: 1.5, fontWeight: 600, borderRadius: 2, fontSize: '1.1rem' }}
          >
            Renvoyer l'email de vérification
          </Button>

          <Button
            variant="text"
            color="primary"
            onClick={() => navigate('/login')}
            disabled={verifying}
            fullWidth
            sx={{ py: 1.5, fontWeight: 600, borderRadius: 2, fontSize: '1.1rem' }}
          >
            Retour à la connexion
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 