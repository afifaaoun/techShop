import { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { Email, Send } from '@mui/icons-material';

export default function ForgotPasswordForm({ onSubmit, loading }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse email');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Veuillez saisir une adresse email valide');
      return;
    }
    
    onSubmit({ email });
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        borderRadius: 2,
        maxWidth: 400,
        mx: 'auto',
        mt: 4
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom textAlign="center" fontWeight="bold">
        Mot de passe oublié
      </Typography>
      
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
        Entrez votre adresse email pour recevoir un lien de réinitialisation
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="Adresse email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
          autoFocus
          slotProps={{
            inputAdornment: {
              startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
            }
          }}
          sx={{ mb: 3 }}
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          sx={{ 
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
        </Button>
      </Box>
    </Paper>
  );
}
