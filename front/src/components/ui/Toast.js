import React from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

function SlideTransition(props) {
  return <Slide {...props} direction="up" />;
}

export default function Toast({ open, message, severity = 'info', onClose, autoHideDuration = 4000 }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbar-root': {
          zIndex: 9999,
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
          minWidth: '300px',
          '& .MuiAlert-message': {
            fontWeight: 500,
            fontSize: '0.95rem',
          },
          '& .MuiAlert-icon': {
            fontSize: '1.2rem',
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
} 