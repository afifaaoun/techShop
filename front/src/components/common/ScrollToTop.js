import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Sauvegarder la position de scroll pour chaque route
    const savedScrollPosition = sessionStorage.getItem(`scroll_${pathname}`);
    
    if (savedScrollPosition) {
      // Restaurer la position de scroll après un court délai
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
      }, 100);
    } else {
      // Nouvelle page, scroll vers le haut
      window.scrollTo(0, 0);
    }

    // Sauvegarder la position de scroll avant de quitter la page
    const handleBeforeUnload = () => {
      sessionStorage.setItem(`scroll_${pathname}`, window.scrollY.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Sauvegarder la position actuelle
      sessionStorage.setItem(`scroll_${pathname}`, window.scrollY.toString());
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  return null;
} 