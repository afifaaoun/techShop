import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

export default function RegisterForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <TextField
        label="Nom"
        name="name"
        value={form.name}
        onChange={handleChange}
        required
        fullWidth
        autoFocus
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
        fullWidth
      />
      <TextField
        label="Mot de passe"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        required
        fullWidth
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        fullWidth
        sx={{ py: 1.5, fontWeight: 600, borderRadius: 2, fontSize: '1.1rem', mt: 2 }}
      >
        {loading ? 'Inscription...' : "S'inscrire"}
      </Button>
    </Box>
  );
}
