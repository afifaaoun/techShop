import styled from '@emotion/styled';
import PropTypes from 'prop-types';

// Définition des couleurs pour chaque statut
const statusColors = {
  pending: '#f39c12',    // Orange
  processing: '#3498db', // Bleu
  shipped: '#2ecc71',    // Vert
  delivered: '#27ae60',  // Vert foncé
  cancelled: '#e74c3c',  // Rouge
  default: '#95a5a6'     // Gris
};

const StyledBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  color: white;
  background-color: ${props => statusColors[props.status] || statusColors.default};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

/**
 * Composant Badge pour afficher les statuts
 * @param {string} status - Statut à afficher (pending|processing|shipped|delivered|cancelled)
 * @param {string} [className] - Classes CSS supplémentaires
 * @param {ReactNode} [children] - Contenu alternatif
 */
function Badge({ status, className, children }) {
  return (
    <StyledBadge 
      status={status} 
      className={`badge ${className || ''}`}
    >
      {children || status}
    </StyledBadge>
  );
}

Badge.propTypes = {
  status: PropTypes.oneOf([
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ]),
  className: PropTypes.string,
  children: PropTypes.node
};

export default Badge;
