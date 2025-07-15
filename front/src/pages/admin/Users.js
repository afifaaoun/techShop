import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../../utils/api';

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = `/users?page=${page + 1}&limit=${rowsPerPage}`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      if (roleFilter) {
        url += `&role=${encodeURIComponent(roleFilter)}`;
      }

      const response = await api.get(url);
      setUsers(response.data.data || []);
      setTotalUsers(response.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await api.delete(`/users/${userToDelete._id}`);
      setUsers(users.filter(u => u._id !== userToDelete._id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/users/${userId}`, {
        isActive: !currentStatus
      });
      
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, isActive: !currentStatus }
          : user
      ));
      setStatusMessage('Statut modifié avec succès');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la modification du statut');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'user': return 'primary';
      default: return 'default';
    }
  };

  // Ajoute une fonction utilitaire pour le statut actif
  const isUserActive = (user) => {
    if (!user.lastLogin) return false;
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    return (new Date() - new Date(user.lastLogin)) < THIRTY_DAYS;
  };

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'row', gap: 3 }}>
      <Box sx={{ flex: 2, transition: 'margin 0.3s', minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Gestion des Utilisateurs
          </Typography>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {statusMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setStatusMessage(null)}>
            {statusMessage}
          </Alert>
        )}
        {/* Filtres et recherche */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Rechercher un utilisateur"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 250 }}
              slotProps={{
                inputAdornment: {
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={roleFilter}
                label="Rôle"
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(0); // Remettre la pagination à la page 1 lors du tri
                }}
              >
                <MenuItem value="">Tous les rôles</MenuItem>
                <MenuItem value="user">Utilisateur</MenuItem>
                <MenuItem value="admin">Administrateur</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>
        {/* Tableau des utilisateurs */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date d'inscription</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={user.avatar?.url}
                          alt={user.name}
                          sx={{ width: 40, height: 40 }}
                        >
                          {user.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user._id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                        color={getRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isUserActive(user) ? 'Actif' : 'Inactif'}
                        color={isUserActive(user) ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => setSelectedUser(user)}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color={user.isActive ? 'warning' : 'success'}
                          onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                          title={user.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {user.isActive ? <BlockIcon /> : <UnblockIcon />}
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalUsers}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </Paper>
        {/* Dialog de confirmation de suppression */}
        <Dialog 
          open={deleteDialogOpen} 
          onClose={() => setDeleteDialogOpen(false)}
          sx={{ zIndex: 1300 }}
        >
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>
              Êtes-vous sûr de vouloir supprimer l'utilisateur "{userToDelete?.name}" ?
              Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleDeleteUser} color="error" variant="contained">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* Panneau latéral de détails utilisateur */}
      {selectedUser && (
        <Paper sx={{ flex: 1, p: 3, minWidth: 320, maxWidth: 400, position: 'relative', boxShadow: 4, height: 'fit-content', transition: 'right 0.3s' }}>
          <IconButton
            size="small"
            onClick={() => setSelectedUser(null)}
            sx={{ position: 'absolute', top: 8, right: 8 }}
            aria-label="Fermer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24"><path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"/></svg>
          </IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={selectedUser.avatar?.url}
              alt={selectedUser.name}
              sx={{ width: 80, height: 80, mb: 2 }}
            >
              {selectedUser.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {selectedUser.name}
            </Typography>
            <Chip label={selectedUser.role === 'admin' ? 'Administrateur' : 'Utilisateur'} color={getRoleColor(selectedUser.role)} size="small" sx={{ mb: 1 }} />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              {selectedUser.email}
            </Typography>
          </Box>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <li><strong>ID :</strong> {selectedUser._id}</li>
            <li><strong>Statut :</strong> {isUserActive(selectedUser) ? 'Actif' : 'Inactif'}</li>
            <li><strong>Date d'inscription :</strong> {formatDate(selectedUser.createdAt)}</li>
            <li><strong>Dernière connexion :</strong> {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Jamais'}</li>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setUserToDelete(selectedUser);
                setDeleteDialogOpen(true);
              }}
              startIcon={<DeleteIcon />}
              fullWidth
            >
              Supprimer
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
} 