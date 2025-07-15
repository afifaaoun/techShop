import styled from '@emotion/styled';
import PropTypes from 'prop-types';

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin: 1.5rem 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-radius: 8px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  thead {
    background-color: #f8f9fa;
    border-bottom: 2px solid #e9ecef;
  }

  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #495057;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
    color: #212529;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background-color: #f8f9fa;
  }

  /* Style spécial pour les cellules d'actions */
  td.actions {
    display: flex;
    gap: 0.5rem;
  }
`;

/**
 * Composant Table pour afficher des données tabulaires
 * @param {Array} columns - Configuration des colonnes
 * @param {Array} data - Données à afficher
 * @param {function} renderRow - Fonction de rendu personnalisée
 * @param {string} className - Classes CSS supplémentaires
 */
function Table({ columns, data, renderRow, className }) {
  return (
    <TableContainer>
      <StyledTable className={`data-table ${className || ''}`}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={column.style || {}}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            renderRow ? (
              renderRow(item, index)
            ) : (
              <tr key={item.id || index}>
                {columns.map((column) => (
                  <td 
                    key={column.key}
                    className={column.key === 'actions' ? 'actions' : ''}
                  >
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            )
          ))}
        </tbody>
      </StyledTable>
    </TableContainer>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      render: PropTypes.func,
      style: PropTypes.object
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  renderRow: PropTypes.func,
  className: PropTypes.string
};

export default Table;
