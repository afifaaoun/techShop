import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Paper, MenuItem,
  CircularProgress, Alert, IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import api from '../../utils/api';

export default function ProductForm({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = mode === 'edit';

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/products/categories');
        if (response.data && response.data.categories) {
          setCategories(response.data.categories.map(cat => cat.key));
        }
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err);
      }
    };
    
    fetchCategories();
  }, []);

  const [form, setForm] = useState({
    name: '',
    price: '',
    discount: '',
    description: '',
    category: '',
    stock: '',
    tags: '',
    images: [{ url: '' }],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      api.get(`/products/${id}`)
        .then(res => {
          const prod = res.data.data;
          setForm({
            name: prod.name || '',
            price: prod.price || '',
            discount: prod.discount || '',
            description: prod.description || '',
            category: prod.category || '',
            stock: prod.stock || '',
            tags: prod.tags ? prod.tags.join(', ') : '',
            images: prod.images?.length ? prod.images : [{ url: '' }],
          });
        })
        .catch(() => setError('Erreur lors du chargement du produit'))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (idx, value) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === idx ? { ...img, url: value } : img
      ),
    }));
  };

  const handleAddImage = () => {
    setForm(prev => ({
      ...prev,
      images: [...prev.images, { url: '' }],
    }));
  };

  const handleRemoveImage = (idx) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        discount: parseFloat(form.discount),
        stock: parseInt(form.stock, 10),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: form.images.filter(img => img.url).map(img => ({
          public_id: '',
          url: img.url
        })),
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category
      };

      if (!payload.name || !payload.price || !payload.description || !payload.category || isNaN(payload.stock)) {
        setError('Merci de remplir tous les champs obligatoires.');
        setLoading(false);
        return;
      }

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        setSuccess('Produit modifié avec succès');
      } else {
        await api.post('/products', payload);
        setSuccess('Produit ajouté avec succès');
        setForm({
          name: '', price: '', discount: '', description: '',
          category: '', stock: '', tags: '', images: [{ url: '' }]
        });
      }

      setTimeout(() => navigate('/admin/products'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4, position: 'relative' }}>
      <Paper
        sx={{
          p: { xs: 2, md: 4 },
          position: 'relative',
          boxShadow: 8,
          borderRadius: 3
                }}
      >
        <IconButton
          size="small"
          onClick={() => navigate('/admin/products')}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'error.main',
            background: 'white',
            boxShadow: 2,
            '&:hover': { background: '#f8d7da' }
          }}
          aria-label="Fermer"
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" fontWeight={700} mb={1} align="center">
          {isEdit ? 'Modifier un produit' : 'Ajouter un produit'}
        </Typography>
        <Box
          sx={{
            width: '100%',
            height: 3,
            background: 'linear-gradient(90deg, #1976d2 30%, #42a5f5 100%)',
            borderRadius: 2,
            mb: 3
          }}
        />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress />
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Nom"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 3 }}
          />
          <TextField
            label="Prix (DT)"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 3 }}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            label="Réduction (%)"
            name="discount"
            type="number"
            value={form.discount}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 3 }}
            inputProps={{ min: 0, max: 100, step: 1 }}
          />
          <TextField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            required
            rows={3}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Catégorie"
            name="category"
            value={form.category}
            onChange={handleChange}
            select
            fullWidth
            required
            sx={{ mb: 3 }}
          >
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Stock"
            name="stock"
            type="number"
            value={form.stock}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 3 }}
            inputProps={{ min: 0, step: 1 }}
          />
          <TextField
            label="Tags (séparés par des virgules)"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" fontWeight={600} mt={3} mb={1}>
            Images du produit (URLs)
          </Typography>

{form.images.map((img, idx) => (
  <Box key={idx} sx={{ mb: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TextField
        label={`Image #${idx + 1}`}
        value={img.url}
        onChange={e => handleImageChange(idx, e.target.value)}
        fullWidth
        placeholder="https://exemple.com/image.jpg"
      />
      {form.images.length > 1 && (
        <Button color="error" onClick={() => handleRemoveImage(idx)}>-</Button>
      )}
      {idx === form.images.length - 1 && (
        <Button color="primary" onClick={handleAddImage}>+</Button>
      )}
    </Box>

    {/* Aperçu de l'image */}
    {img.url && (
      <Box
        sx={{
          mt: 1,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #ccc',
          maxHeight: 200,
          maxWidth: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src={img.url}
          alt={`preview-${idx}`}
          style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Image+invalide';
          }}
        />
      </Box>
    )}
  </Box>
))}


          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              mt: 3,
              fontWeight: 700,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 2,
              boxShadow: 3,
              letterSpacing: 1
            }}
          >
            {isEdit ? 'Enregistrer les modifications' : 'Ajouter le produit'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
