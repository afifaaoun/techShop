import { useEffect } from 'react';
import styled from '@emotion/styled';

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1300;
  overflow: hidden;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  max-width: 95vw;
  max-height: 90vh;
  width: 100%;
  box-sizing: border-box;
  position: relative;
  overflow-y: auto;
`;

export default function Modal({ open, onClose, children }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      // Sauvegarder l'état actuel du scroll
      const scrollY = window.scrollY;
      const bodyStyle = document.body.style;
      
      // Utiliser une approche plus sûre pour bloquer le scroll
      bodyStyle.overflow = 'hidden';
      bodyStyle.position = 'fixed';
      bodyStyle.top = `-${scrollY}px`;
      bodyStyle.left = '0';
      bodyStyle.right = '0';
      
      // Ajouter l'écouteur pour la touche Escape
      document.addEventListener('keydown', handleEscape);
      
      // Stocker la position pour la restaurer plus tard
      sessionStorage.setItem('modalScrollPosition', scrollY.toString());
    } else {
      // Restaurer l'état du scroll de manière plus sûre
      const bodyStyle = document.body.style;
      const savedScrollY = sessionStorage.getItem('modalScrollPosition');
      
      bodyStyle.overflow = '';
      bodyStyle.position = '';
      bodyStyle.top = '';
      bodyStyle.left = '';
      bodyStyle.right = '';
      
      if (savedScrollY) {
        // Restaurer la position de scroll
        window.scrollTo(0, parseInt(savedScrollY));
        sessionStorage.removeItem('modalScrollPosition');
      }
      
      // Retirer l'écouteur
      document.removeEventListener('keydown', handleEscape);
    }

    return () => {
      // Nettoyage en cas de démontage du composant
      const bodyStyle = document.body.style;
      bodyStyle.overflow = '';
      bodyStyle.position = '';
      bodyStyle.top = '';
      bodyStyle.left = '';
      bodyStyle.right = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        {children}
      </ModalContent>
    </ModalBackdrop>
  );
}
