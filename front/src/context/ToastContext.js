import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const timeoutRef = useRef(null);

  const showToast = useCallback((message, severity = 'info') => {
    // Annuler le timeout précédent s'il existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Fermer le toast actuel avant d'en afficher un nouveau
    setToast(prev => ({
      ...prev,
      open: false,
    }));

    // Attendre un peu avant d'afficher le nouveau toast
    timeoutRef.current = setTimeout(() => {
      setToast({
        open: true,
        message,
        severity,
      });
    }, 100);
  }, []);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToast(prev => ({
      ...prev,
      open: false,
    }));
  }, []);

  const showSuccess = useCallback((message) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message) => {
    showToast(message, 'error');
  }, [showToast]);

  const showWarning = useCallback((message) => {
    showToast(message, 'warning');
  }, [showToast]);

  const showInfo = useCallback((message) => {
    showToast(message, 'info');
  }, [showToast]);

  return (
    <ToastContext.Provider value={{
      showToast,
      hideToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
    }}>
      {children}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 