import React, { useState } from 'react';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { Box, Container } from '@mui/material';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async ({ email }) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      console.log('✅ Réponse forgot password:', response.data);
      showSuccess(`Un lien a été envoyé à ${email}. Vérifiez votre boîte mail.`);
    } catch (error) {
      console.error('❌ Erreur forgot password:', error);
      showError(error.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <ForgotPasswordForm onSubmit={handleSubmit} loading={loading} />
      </Box>
    </Container>
  );
}
