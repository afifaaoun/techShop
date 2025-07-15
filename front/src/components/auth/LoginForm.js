import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import { FormControlLabel, Checkbox, Box, Button } from '@mui/material';

const LoginForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Mot de passe"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <Box sx={{ mt: 2, mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              color="primary"
            />
          }
          label="Se souvenir de moi"
        />
      </Box>
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        fullWidth
        sx={{ py: 1.5, fontWeight: 600, borderRadius: 2, fontSize: '1.1rem', mt: 2 }}
      >
        {loading ? 'Connexion...' : 'Se connecter'}
      </Button>
    </form>
  );
};

export default LoginForm;
