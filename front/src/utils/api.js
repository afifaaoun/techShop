import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Ajouter automatiquement le token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Gérer automatiquement les erreurs 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      console.warn('⚠️ Token invalide ou expiré, déconnexion...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // ou utilise navigate si tu es dans un composant React
    }
    return Promise.reject(err);
  }
);

export default api;
