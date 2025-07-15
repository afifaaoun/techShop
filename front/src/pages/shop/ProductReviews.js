import { useEffect, useState, useContext } from 'react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import {
  Typography,
  TextField,
  Button,
  Rating,
  Box,
  Divider,
  Link,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';

export default function ProductReviews({ productId, onReviewsUpdate }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/product/${productId}`);
      const fetchedReviews = res.data.data;
      setReviews(fetchedReviews);

      if (isAuthenticated && user?.id) {
        const existing = fetchedReviews.find(r => {
          const reviewUserId = r.user?._id || r.user;
          const userId = user.id;
          return reviewUserId?.toString() === userId.toString();
        });
        setUserReview(existing || null);

        if (existing) {
          setRating(existing.rating);
          setComment(existing.comment);
          setIsEditing(false);
        } else {
          setRating(0);
          setComment('');
          setIsEditing(true); // show form if no review yet
        }
      } else {
        setUserReview(null);
        setRating(0);
        setComment('');
        setIsEditing(false);
      }

      if (onReviewsUpdate) {
        const avg =
          fetchedReviews.reduce((acc, r) => acc + r.rating, 0) /
          (fetchedReviews.length || 1);
        onReviewsUpdate({
          avgRating: avg,
          numOfReviews: fetchedReviews.length,
        });
      }
    } catch (err) {
      console.error('Erreur fetch avis:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, isAuthenticated, user?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !comment) return alert('Veuillez remplir tous les champs');

    try {
      setLoading(true);
      await api.post('/reviews', { productId, rating, comment });
      await fetchReviews();
      setIsEditing(false);
    } catch (err) {
      console.error('Erreur envoi avis:', err);
      alert('Erreur lors de l’envoi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userReview?._id) return;
    if (!window.confirm('Supprimer votre avis ?')) return;

    try {
      await api.delete(`/reviews/me/${productId}`);
      setUserReview(null);
      setRating(0);
      setComment('');
      setIsEditing(true);
      await fetchReviews();
    } catch (err) {
      console.error('Erreur suppression avis:', err);
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h6" gutterBottom>
        Les avis
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {reviews.length === 0 && (
        <Typography>Aucun avis pour ce produit.</Typography>
      )}

      {/* Liste des avis, sauf l'avis de l'utilisateur (affiché séparément) */}
      {reviews
        .filter(r => {
          const reviewUserId = r.user?._id || r.user;
          const userId = user?.id;
          // Only filter out user's review if user is authenticated and has an ID
          if (!userId) return true;
          return reviewUserId?.toString() !== userId.toString();
        })
        .map(r => (
          <Box key={r._id} mb={2} borderBottom="1px solid #eee" pb={1}>
            <Typography variant="subtitle2">{r.user?.name || 'Utilisateur inconnu'}</Typography>
            <Rating value={r.rating} readOnly size="small" />
            <Typography>{r.comment}</Typography>
          </Box>
        ))}

      {isAuthenticated && userReview && !isEditing && (
        // Affiche l'avis existant + boutons modifier/supprimer à droite
        <Box
          mt={4}
          mb={2}
          p={2}
          border="1px solid #ccc"
          borderRadius={1}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              Votre avis
            </Typography>
            <Rating value={userReview.rating} readOnly />
            <Typography>{userReview.comment}</Typography>
          </Box>
          <Box>
  <Tooltip title="Modifier avis">
    <Button
      variant="text"
      onClick={() => setIsEditing(true)}
      sx={{ minWidth: 'auto', p: 1 }}
    >
      <Edit />
    </Button>
  </Tooltip>
  <Tooltip title="Supprimer avis">
    <Button
      variant="text"
      color="error"
      onClick={handleDelete}
      disabled={loading}
      sx={{ minWidth: 'auto', p: 1 }}
    >
      <Delete />
    </Button>
  </Tooltip>
</Box>

        </Box>
      )}

      {isAuthenticated && (isEditing || !userReview) && (
        // Formulaire d'ajout / modification
        <Box mt={4}>
          <Typography variant="subtitle1" gutterBottom>
            {userReview ? 'Modifier votre avis' : 'Laisser un avis'}
          </Typography>
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
            />
            <TextField
              multiline
              rows={3}
              label="Votre commentaire"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              required
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading
                  ? 'Envoi...'
                  : userReview
                  ? 'Modifier l\'avis'
                  : 'Envoyer'}
              </Button>
              
              <Button
                variant="text"
                onClick={() => {
                  // Annuler la modification
                  setIsEditing(false);
                  setRating(userReview.rating);
                  setComment(userReview.comment);
                }}
              >
                Annuler
              </Button>
            </Box>
          </form>
        </Box>
      )}

      {!isAuthenticated && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid grey.200' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Connectez-vous pour laisser un avis
          </Typography>
          <Button
            component={Link}
            href="/login"
            variant="outlined"
            size="small"
          >
            Se connecter
          </Button>
        </Box>
      )}
    </Box>
  );
}
