import React, { useState, useContext } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Modal,
  TextField,
  Stack,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Alert,
  Paper,
  Fade,
  Zoom,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  AccountCircle,
  Email,
  Lock,
  Delete,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Security,
  AccountCircle as AccountCircleIcon,
  VerifiedUser,
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';

const styleModal = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 450 },
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflow: 'auto',
};

export default function Profile() {
  const { user, setUser, logout } = useContext(AuthContext);
  const { showSuccess, showError } = useToast();

  // Tous les hooks doivent être appelés avant tout return conditionnel
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar || '');
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  // Affichage si non connecté (après tous les hooks)
  if (!user) {
    return (
      <Fade in={true} timeout={800}>
        <Box 
          maxWidth={600} 
          mx="auto" 
          mt={8} 
          p={4} 
          component={Paper}
          elevation={3}
          borderRadius={3}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Security sx={{ fontSize: 60, mb: 2, opacity: 0.8 }} />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Accès restreint
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Vous devez être connecté pour voir votre profil.
          </Typography>
        </Box>
      </Fade>
    );
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        showError('L\'image doit faire moins de 5MB');
        return;
      }
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatar) return;
    const formData = new FormData();
    formData.append('avatar', avatar);
    try {
      setUploading(true);
      const res = await api.put('/upload/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(res.data.data);
      localStorage.setItem('user', JSON.stringify(res.data.data));
      showSuccess('Avatar mis à jour avec succès !');
      setShowAvatarModal(false);
    } catch (err) {
      console.error(err);
      showError("Erreur lors de l'upload de l'avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (showPasswordModal && password !== confirmPassword) {
      showError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (showPasswordModal && password.length < 6) {
      showError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setUpdating(true);
      const res = await api.put('/auth/profile', {
        name: showNameModal ? name : undefined,
        password: showPasswordModal ? password : undefined,
      });
      setUser(res.data.data);
      localStorage.setItem('user', JSON.stringify(res.data.data));
      showSuccess("Profil mis à jour avec succès !");
      setShowNameModal(false);
      setShowPasswordModal(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      showError("Erreur lors de la mise à jour du profil");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/me');
      showSuccess("Compte supprimé avec succès");
      setShowDeleteModal(false);
      logout();
    } catch (err) {
      console.error(err);
      showError("Erreur lors de la suppression du compte");
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'user': return 'Utilisateur';
      default: return 'Utilisateur';
    }
  };

  return (
    <Fade in={true} timeout={800}>
      <Box maxWidth={800} mx="auto" mt={4} p={3}>
        {/* En-tête du profil */}
        <Zoom in={true} timeout={1000}>
          <Paper
            elevation={4}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Tooltip title="Changer l'avatar">
                  <IconButton
                    size="small"
                    onClick={() => setShowAvatarModal(true)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.9)',
                      '&:hover': { bgcolor: 'white' },
                    }}
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <Avatar
                src={preview || user?.avatar || '/default-avatar.png'}
                alt={user?.name}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  margin: 'auto',
                  border: '4px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
              />
            </Badge>
            
            <Typography variant="h4" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
              {user?.name}
            </Typography>
            
            <Chip
              icon={<VerifiedUser />}
              label={getRoleLabel(user?.role)}
              color={getRoleColor(user?.role)}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </Paper>
        </Zoom>

        {/* Informations du profil */}
        <Grid container spacing={3}>
          {/* Informations personnelles */}
          <Grid item xs={12} md={6}>
            <Zoom in={true} timeout={1200}>
              <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AccountCircle sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Informations personnelles
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    {/* Nom */}
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Nom complet
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {user?.name}
                        </Typography>
                        <Tooltip title="Modifier le nom">
                          <IconButton
                            size="small"
                            onClick={() => setShowNameModal(true)}
                            color="primary"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Email */}
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Adresse email
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {user?.email}
                        </Typography>
                        <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </Box>
                    </Box>

                    {/* Rôle */}
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Rôle
                      </Typography>
                      <Chip
                        label={getRoleLabel(user?.role)}
                        color={getRoleColor(user?.role)}
                        size="small"
                        icon={<AccountCircle />}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>

          {/* Sécurité */}
          <Grid item xs={12} md={6}>
            <Zoom in={true} timeout={1400}>
              <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Security sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                      Sécurité
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    {/* Mot de passe */}
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Mot de passe
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body1" fontWeight="medium">
                          ••••••••
                        </Typography>
                        <Tooltip title="Changer le mot de passe">
                          <IconButton
                            size="small"
                            onClick={() => setShowPasswordModal(true)}
                            color="primary"
                          >
                            <Lock fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Dernière connexion */}
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Membre depuis
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ mt: 'auto' }}>
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        startIcon={<Delete />}
                        onClick={() => setShowDeleteModal(true)}
                        sx={{ mt: 2 }}
                      >
                        Supprimer mon compte
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

        {/* Modals */}
        
        {/* Modal Avatar */}
        <Modal
          open={showAvatarModal}
          onClose={() => setShowAvatarModal(false)}
          aria-labelledby="modal-avatar-title"
        >
          <Box sx={styleModal}>
            <Typography id="modal-avatar-title" variant="h6" mb={3} fontWeight="bold" textAlign="center">
              Changer l'avatar
            </Typography>
            
            {preview && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Avatar
                  src={preview}
                  alt="Aperçu"
                  sx={{ width: 100, height: 100, margin: 'auto' }}
                />
              </Box>
            )}
            
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<PhotoCamera />}
              sx={{ mb: 2 }}
            >
              Choisir une image
              <input
                type="file"
                hidden
                onChange={handleAvatarChange}
                accept="image/*"
              />
            </Button>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Formats acceptés : JPG, PNG, GIF. Taille max : 5MB
            </Alert>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleAvatarUpload}
                disabled={uploading || !avatar}
                startIcon={uploading ? <CircularProgress size={20} /> : <Save />}
                fullWidth
              >
                {uploading ? 'Chargement...' : 'Sauvegarder'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowAvatarModal(false)}
                startIcon={<Cancel />}
                fullWidth
              >
                Annuler
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Modal Nom */}
        <Modal
          open={showNameModal}
          onClose={() => setShowNameModal(false)}
          aria-labelledby="modal-name-title"
        >
          <Box sx={styleModal}>
            <Typography id="modal-name-title" variant="h6" mb={3} fontWeight="bold" textAlign="center">
              Modifier le nom
            </Typography>
            
            <TextField
              fullWidth
              label="Nouveau nom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              autoFocus
            />
            
            <Stack direction="row" spacing={2} mt={3}>
              <Button
                variant="contained"
                onClick={handleUpdateProfile}
                disabled={updating || !name.trim()}
                startIcon={updating ? <CircularProgress size={20} /> : <Save />}
                fullWidth
              >
                {updating ? 'Mise à jour...' : 'Sauvegarder'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowNameModal(false)}
                startIcon={<Cancel />}
                fullWidth
              >
                Annuler
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Modal Mot de passe */}
        <Modal
          open={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          aria-labelledby="modal-password-title"
        >
          <Box sx={styleModal}>
            <Typography id="modal-password-title" variant="h6" mb={3} fontWeight="bold" textAlign="center">
              Changer le mot de passe
            </Typography>
            
            <TextField
              fullWidth
              label="Nouveau mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              autoFocus
              slotProps={{
                inputAdornment: {
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Confirmer le mot de passe"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              error={password !== confirmPassword && confirmPassword !== ''}
              helperText={password !== confirmPassword && confirmPassword !== '' ? 'Les mots de passe ne correspondent pas' : ''}
            />
            
            <Alert severity="info" sx={{ mt: 2 }}>
              Le mot de passe doit contenir au moins 6 caractères
            </Alert>
            
            <Stack direction="row" spacing={2} mt={3}>
              <Button
                variant="contained"
                onClick={handleUpdateProfile}
                disabled={updating || !password || password !== confirmPassword}
                startIcon={updating ? <CircularProgress size={20} /> : <Save />}
                fullWidth
              >
                {updating ? 'Mise à jour...' : 'Sauvegarder'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setConfirmPassword('');
                }}
                startIcon={<Cancel />}
                fullWidth
              >
                Annuler
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Modal Supprimer Compte */}
        <Modal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          aria-labelledby="modal-delete-title"
        >
          <Box sx={styleModal}>
            <Typography id="modal-delete-title" variant="h6" mb={3} fontWeight="bold" textAlign="center" color="error">
              ⚠️ Supprimer mon compte
            </Typography>
            
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="bold">
                Attention ! Cette action est irréversible.
              </Typography>
              <Typography variant="body2">
                Toutes vos données seront définitivement supprimées.
              </Typography>
            </Alert>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteAccount}
                startIcon={<Delete />}
                fullWidth
              >
                Supprimer définitivement
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowDeleteModal(false)}
                startIcon={<Cancel />}
                fullWidth
              >
                Annuler
              </Button>
            </Stack>
          </Box>
        </Modal>
      </Box>
    </Fade>
  );
}
