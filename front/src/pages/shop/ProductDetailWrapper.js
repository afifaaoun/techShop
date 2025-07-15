import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api'; // ta config axios
import ProductDetail from './ProductDetail';
import Modal from '../../components/ui/Modal';

export default function ProductDetailWrapper() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.data);
      } catch (err) {
        console.error('❌ Erreur chargement produit:', err);
        setError('Produit non trouvé');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleClose = () => {
    navigate(-1); // revenir page précédente
  };

  // Affichage en modal pour la navigation depuis la recherche
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Chargement du produit...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '1.2rem', color: '#d32f2f' }}>
          {error}
        </div>
        <button 
          onClick={() => navigate('/shop')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <Modal open={true} onClose={handleClose}>
      <ProductDetail product={product} onClose={handleClose} />
    </Modal>
  );
}
