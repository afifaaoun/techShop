import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

export default function Loader({ message = "Chargement...", fullScreen = false, size = "medium" }) {
  const sizeMap = {
    small: 20,
    medium: 40,
    large: 60
  };

  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  };

  return (
    <Fade in={true} timeout={500}>
      <Box sx={containerStyle}>
        <CircularProgress
          size={sizeMap[size]}
          thickness={4}
          sx={{
            color: 'primary.main',
            mb: 2,
          }}
        />
        {message && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: 'center',
              maxWidth: 300,
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Fade>
  );
}