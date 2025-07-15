import React, { useState, useContext, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import LogoutButton from '../auth/LogoutButton';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function Order() {
  const { user } = useContext(AuthContext);
  const { cart, clearCart, cartLoading } = useContext(CartContext);
  const { showSuccess, showError } = useToast();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  // États pour les étapes
  const [expanded, setExpanded] = useState('panel1');
  const [stepCompleted, setStepCompleted] = useState({
    step1: false, // Connexion
    step2: false, // Adresse
    step3: false, // Livraison
    step4: false, // Paiement
  });

  // États pour les formulaires
  const [authForm, setAuthForm] = useState({ email: '', password: '', nom: '' });
  const [shippingForm, setShippingForm] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    phone: '',
  });
  const [shippingMethod, setShippingMethod] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // Marquer automatiquement l'étape 1 comme complétée si l'utilisateur est déjà connecté
  useEffect(() => {
    if (user && !stepCompleted.step1) {
      setStepCompleted(prev => ({ ...prev, step1: true }));
      setExpanded('panel2'); // Ouvrir automatiquement l'étape 2
    }
  }, [user, stepCompleted.step1]);

  // Validation des étapes
  const canAccessStep2 = stepCompleted.step1 && user;
  const canAccessStep3 = stepCompleted.step2 && shippingForm.address && shippingForm.city && shippingForm.postalCode && shippingForm.phone;
  const canAccessStep4 = stepCompleted.step3 && shippingMethod;

  const handleChange = (panel) => (event, isExpanded) => {
    // Vérifier si l'étape peut être ouverte
    if (panel === 'panel2' && !canAccessStep2) return;
    if (panel === 'panel3' && !canAccessStep3) return;
    if (panel === 'panel4' && !canAccessStep4) return;
    
    setExpanded(isExpanded ? panel : false);
  };

  const handleAuthInput = (e) => {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  };

  const handleShippingInput = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!authForm.email || !authForm.password) {
      setErrorMsg('Veuillez remplir votre email et mot de passe.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await login(authForm.email, authForm.password);
      setStepCompleted(prev => ({ ...prev, step1: true }));
      setExpanded('panel2');
    } catch (err) {
      setErrorMsg('Email ou mot de passe incorrect');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!authForm.nom || !authForm.email || !authForm.password) {
      setErrorMsg('Merci de remplir tous les champs requis');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await register({
        name: authForm.nom,
        email: authForm.email,
        password: authForm.password,
      });
      setStepCompleted(prev => ({ ...prev, step1: true }));
      setExpanded('panel2');
    } catch (err) {
      setErrorMsg('Erreur lors de la création du compte');
    }
    setLoading(false);
  };

  const handleShippingComplete = () => {
    if (shippingForm.address && shippingForm.city && shippingForm.postalCode && shippingForm.phone) {
      setStepCompleted(prev => ({ ...prev, step2: true }));
      setExpanded('panel3');
    }
  };

  const handleShippingMethodSelect = (method) => {
    setShippingMethod(method);
    setStepCompleted(prev => ({ ...prev, step3: true }));
    setExpanded('panel4');
  };

  const handleConfirmOrder = async () => {
    if (!paymentMethod) {
      showError('Veuillez sélectionner une méthode de paiement');
      return;
    }

    setOrderLoading(true);
    try {
      const orderData = {
        shippingInfo: shippingForm,
        paymentMethod: paymentMethod,
      };

      console.log('📦 Création de la commande:', orderData);

      const response = await api.post('/orders', orderData);
      
      console.log('✅ Commande créée:', response.data);

      // Vider le panier
      await clearCart();

      // Afficher le succès
      showSuccess('Commande confirmée ! Un email de confirmation vous a été envoyé.');

      // Rediriger vers la page des commandes
      navigate('/orders');

    } catch (error) {
      console.error('❌ Erreur création commande:', error);
      showError(error.response?.data?.message || 'Erreur lors de la confirmation de la commande');
    } finally {
      setOrderLoading(false);
    }
  };

  // Vérifier si le panier est vide
  if (cartLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Chargement du panier...</Typography>
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6">Votre panier est vide.</Typography>
        <Button variant="contained" href="/shop" sx={{ mt: 2 }}>
          Continuer mes achats
        </Button>
      </Container>
    );
  }

  const products = cart.items || [];
  const subTotal = cart.total || 0;
  const shippingPrice = shippingMethod === 'express' ? 5.99 : 2.99;
  const total = subTotal + shippingPrice;

  console.log('🛒 Order - Cart data:', cart);
  console.log('💰 Order - Subtotal:', subTotal, 'Shipping:', shippingPrice, 'Total:', total);

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Vous devez être connecté pour voir votre commande.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {/* Colonne gauche */}
        <Grid item xs={12} md={8}>
          {/* Étape 1 : Connexion / Inscription */}
          <Accordion 
            expanded={expanded === 'panel1'} 
            onChange={handleChange('panel1')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6">1. Informations Personnelles</Typography>
                {stepCompleted.step1 && (
                  <Box sx={{ ml: 'auto', color: 'success.main' }}>
                    ✅ Complété
                  </Box>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {user ? (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Connecté en tant que <strong>{user.name}</strong>
                  </Alert>
                  <Typography color="error" fontSize="0.9rem">
                    Ce n'est pas vous ?{' '}
                    <LogoutButton onLogout={() => {
                      setStepCompleted(prev => ({ ...prev, step1: false }));
                      setExpanded('panel1');
                    }} />
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box mb={2}>
                    <Button
                      variant={!isRegister ? 'contained' : 'outlined'}
                      onClick={() => setIsRegister(false)}
                      sx={{ mr: 2 }}
                    >
                      Déjà client ?
                    </Button>
                    <Button
                      variant={isRegister ? 'contained' : 'outlined'}
                      onClick={() => setIsRegister(true)}
                    >
                      Nouveau client ?
                    </Button>
                  </Box>

                  <Box component="form" noValidate autoComplete="off">
                    {isRegister && (
                      <TextField
                        fullWidth
                        label="Nom complet"
                        name="nom"
                        value={authForm.nom}
                        onChange={handleAuthInput}
                        margin="normal"
                        required
                      />
                    )}
                    <TextField
                      fullWidth
                      label="E-mail"
                      type="email"
                      name="email"
                      value={authForm.email}
                      onChange={handleAuthInput}
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Mot de passe"
                      type="password"
                      name="password"
                      value={authForm.password}
                      onChange={handleAuthInput}
                      margin="normal"
                      required
                    />
                    {errorMsg && (
                      <Typography color="error" sx={{ mt: 1 }}>
                        {errorMsg}
                      </Typography>
                    )}
                    <Box sx={{ textAlign: 'right', mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={isRegister ? handleRegister : handleLogin}
                        disabled={loading}
                      >
                        {loading ? 'Chargement...' : 'Continuer'}
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Étape 2 : Adresse */}
          <Accordion
            expanded={expanded === 'panel2'}
            onChange={handleChange('panel2')}
            disabled={!canAccessStep2}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6">2. Adresse de Livraison</Typography>
                {stepCompleted.step2 && (
                  <Box sx={{ ml: 'auto', color: 'success.main' }}>
                    ✅ Complété
                  </Box>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="form" noValidate autoComplete="off">
                <TextField
                  fullWidth
                  label="Adresse"
                  name="address"
                  value={shippingForm.address}
                  onChange={handleShippingInput}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Ville"
                  name="city"
                  value={shippingForm.city}
                  onChange={handleShippingInput}
                  margin="normal"
                  required
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Code postal"
                      name="postalCode"
                      value={shippingForm.postalCode}
                      onChange={handleShippingInput}
                      margin="normal"
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Pays"
                      name="country"
                      value={shippingForm.country}
                      onChange={handleShippingInput}
                      margin="normal"
                      required
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="phone"
                  value={shippingForm.phone}
                  onChange={handleShippingInput}
                  margin="normal"
                  required
                />
                <Box sx={{ textAlign: 'right', mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleShippingComplete}
                    disabled={!shippingForm.address || !shippingForm.city || !shippingForm.postalCode || !shippingForm.phone}
                  >
                    Continuer
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Étape 3 : Livraison */}
          <Accordion
            expanded={expanded === 'panel3'}
            onChange={handleChange('panel3')}
            disabled={!canAccessStep3}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6">3. Mode de Livraison</Typography>
                {stepCompleted.step3 && (
                  <Box sx={{ ml: 'auto', color: 'success.main' }}>
                    ✅ Complété
                  </Box>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <RadioGroup
                value={shippingMethod}
                onChange={(e) => setShippingMethod(e.target.value)}
              >
                <FormControlLabel
                  value="standard"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Livraison standard</Typography>
                      <Typography variant="body2" color="text.secondary">
                        3-5 jours ouvrables - 2.99 DT
                      </Typography>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="express"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">Livraison express</Typography>
                      <Typography variant="body2" color="text.secondary">
                        1-2 jours ouvrables - 5.99 DT
                      </Typography>
                    </Box>
                  }
                />
              </RadioGroup>
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => handleShippingMethodSelect(shippingMethod)}
                  disabled={!shippingMethod}
                >
                  Continuer
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Étape 4 : Paiement */}
          <Accordion
            expanded={expanded === 'panel4'}
            onChange={handleChange('panel4')}
            disabled={!canAccessStep4}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="h6">4. Paiement</Typography>
                {stepCompleted.step4 && (
                  <Box sx={{ ml: 'auto', color: 'success.main' }}>
                    ✅ Complété
                  </Box>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  // Marquer l'étape 4 comme complétée quand on sélectionne une méthode de paiement
                  if (e.target.value) {
                    setStepCompleted(prev => ({ ...prev, step4: true }));
                  }
                }}
              >
                <FormControlLabel
                  value="card"
                  control={<Radio />}
                  label="Carte bancaire"
                />
                <FormControlLabel
                  value="paypal"
                  control={<Radio />}
                  label="PayPal"
                />
              </RadioGroup>
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Button
                  variant="contained"
                  disabled={!paymentMethod}
                  onClick={handleConfirmOrder}
                >
                  Confirmer la commande
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Colonne droite - Résumé */}
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Résumé de la commande
            </Typography>

            <List>
              {products.map((item, index) => {
                const product = item.product && typeof item.product === 'object' ? item.product : null;
                return (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemText
                      primary={product?.name || 'Produit inconnu'}
                      secondary={`Quantité: ${item.quantity} × ${item.price?.toFixed(2) || '0.00'} DT`}
                    />
                    <Typography variant="body2" fontWeight="bold">
                      {((item.price || 0) * item.quantity).toFixed(2)} DT
                    </Typography>
                  </ListItem>
                );
              })}
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Sous-total:</Typography>
              <Typography>{subTotal.toFixed(2)} DT</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Frais de livraison:</Typography>
              <Typography>{shippingPrice.toFixed(2)} DT</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {total.toFixed(2)} DT
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              disabled={!user || !stepCompleted.step4 || !paymentMethod || orderLoading}
              onClick={handleConfirmOrder}
              sx={{ mb: 2 }}
            >
              {orderLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Confirmation en cours...
                </Box>
              ) : (
                'Confirmer la commande'
              )}
            </Button>

            {orderLoading && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Votre commande est en cours de traitement. Un email de confirmation vous sera envoyé.
                </Typography>
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
