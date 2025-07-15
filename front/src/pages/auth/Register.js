import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Box, Typography, Paper, Button } from '@mui/material';
import RegisterForm from '../../components/auth/RegisterForm';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

export default function Register() {
  const { register } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const result = await register({ name, email, password });
      
      if (result.success) {
        setUserEmail(email);
        setRegistrationSuccess(true);
        showSuccess(result.message || 'Inscription réussie ! Veuillez vérifier votre email.');
      } else {
        showError(result.error || 'Erreur lors de la création du compte');
      }
    } catch (err) {
      showError('Erreur lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        showSuccess(data.message);
      } else {
        showError(data.message);
      }
    } catch (error) {
      showError('Erreur lors de l\'envoi de l\'email de vérification');
    }
  };

  if (registrationSuccess) {
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
            Inscription Réussie !
          </Typography>
          
          <Typography variant="body1" textAlign="center" mb={3}>
            Un email de vérification a été envoyé à <strong>{userEmail}</strong>.
            Veuillez vérifier votre boîte de réception et cliquer sur le lien de confirmation pour activer votre compte.
          </Typography>

          <Typography variant="body2" textAlign="center" mb={3} color="text.secondary">
            Si vous ne recevez pas l'email dans les prochaines minutes, vérifiez votre dossier spam.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleResendVerification}
              fullWidth
              sx={{ py: 1.5, fontWeight: 600, borderRadius: 2, fontSize: '1.1rem' }}
            >
              Renvoyer l'email de vérification
            </Button>

            <Button
              variant="text"
              color="primary"
              onClick={() => navigate('/login')}
              fullWidth
              sx={{ py: 1.5, fontWeight: 600, borderRadius: 2, fontSize: '1.1rem' }}
            >
              Aller à la page de connexion
            </Button>
          </Box>
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
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, minWidth: 340, width: '100%', maxWidth: 400 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" mb={2}>Inscription</Typography>
        <RegisterForm onSubmit={handleSubmit} loading={loading} />
        <Typography variant="body2" align="center" mt={3}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ textDecoration: 'underline', color: '#1976d2' }}>
            Se connecter
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
