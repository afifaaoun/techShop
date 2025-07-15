import { useState } from 'react';
import api from '../utils/api';

export default function useApi(apiFunc) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const request = async (...args) => {
    setLoading(true);
    try {
      const result = await apiFunc(...args);
      setData(result.data);
      return result;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur serveur');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, request };
}
