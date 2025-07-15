import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function useScrollPosition() {
  const location = useLocation();
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };

    // Sauvegarder la position de scroll pour la route actuelle
    const saveScrollPosition = () => {
      const currentPath = location.pathname;
      sessionStorage.setItem(`scroll_${currentPath}`, scrollPositionRef.current.toString());
    };

    // Restaurer la position de scroll pour la route actuelle
    const restoreScrollPosition = () => {
      const currentPath = location.pathname;
      const savedPosition = sessionStorage.getItem(`scroll_${currentPath}`);
      
      if (savedPosition) {
        // Restaurer après un court délai pour s'assurer que le DOM est prêt
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedPosition));
        }, 50);
      } else {
        // Nouvelle page, scroll vers le haut
        window.scrollTo(0, 0);
      }
    };

    // Ajouter les écouteurs
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('beforeunload', saveScrollPosition);

    // Restaurer la position au changement de route
    restoreScrollPosition();

    return () => {
      // Sauvegarder la position avant de nettoyer
      saveScrollPosition();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', saveScrollPosition);
    };
  }, [location.pathname]);

  return scrollPositionRef.current;
} 