import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { MenuItem } from '@mui/material';

export default function LogoutButton() {
  const { logout } = useContext(AuthContext);
  const { clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ? Votre panier sera vidé.")) {
      clearCart();  // Vider panier invité et connecté
      logout();     // Déconnexion normale
      navigate('/login'); // Redirection si nécessaire (déjà faite dans logout ?)
    }
  };

  return (
    <MenuItem onClick={handleLogout}>
      Se déconnecter
    </MenuItem>
  );
}
