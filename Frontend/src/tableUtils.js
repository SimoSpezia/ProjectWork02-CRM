export const TABLE_STYLES = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        tableLayout: 'fixed'
    },
    headerRow: {
        borderBottom: '2px solid #ddd'
    },
    headerCell: {
        padding: '10px',
        textAlign: 'left'
    },
    row: {
        borderBottom: '1px solid #ddd'
    },
    cell: {
        padding: '10px',
        wordBreak: 'break-word'
    },
    cellCenter: {
        padding: '10px',
        textAlign: 'center',
        wordBreak: 'break-word'
    },
    cellBold: {
        padding: '10px',
        fontWeight: 'bold',
        wordBreak: 'break-word'
    }
};
export const DELETEBUTTON_STYLES = {
    // bigger and more visible delete button styles
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease'
};
export const EDITBUTTON_STYLES = {
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease'
};
export function applyTableStyles(table) {
    Object.assign(table.style, TABLE_STYLES.table);
    const thead = table.querySelector('thead');
    if (thead) {
        const headerRow = thead.querySelector('tr');
        if (headerRow) {
            // Non applicare stili al header - lasciare fare al CSS
            const headers = headerRow.querySelectorAll('th');
            headers.forEach(h => {
                // Applicare solo padding, non background color
                h.style.padding = TABLE_STYLES.headerCell.padding;
                h.style.textAlign = TABLE_STYLES.headerCell.textAlign;
            });
        }
    }
}
export function createStyledWebsiteCell(content) {
    const cell = document.createElement('td');
    const link = document.createElement('a');
    link.href = content;
    link.target = '_blank';
    link.textContent = content;
    link.style.color = '#3498db';
    link.style.textDecoration = 'none';
    link.addEventListener('mouseover', () => {
        link.style.textDecoration = 'underline';
    });
    link.addEventListener('mouseout', () => {
        link.style.textDecoration = 'none';
    });
    link.style.fontSize = '0.9em';
    cell.appendChild(link);
    return cell;
}
// Utility per fare una cella apposita per l'address per fare un dropdown e vedere tutte le info 
export function createStyledAddressCell(address) {
    const cell = document.createElement('td');
    const addressDiv = document.createElement('div');
    addressDiv.textContent = `${address.street} ${address.streetNumber}`;
    addressDiv.style.cursor = 'pointer';
    addressDiv.style.color = '#3498db';
    addressDiv.addEventListener('click', () => {
        var _a, _b;
        // Toggle display of full address info verso il basso allungando verticalmente la cella
        if (addressDiv.nextSibling) {
            (_a = addressDiv.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(addressDiv.nextSibling);
        }
        else {
            const fullAddressDiv = document.createElement('div');
            fullAddressDiv.style.marginTop = '5px';
            fullAddressDiv.style.fontSize = '0.9em';
            fullAddressDiv.style.color = '#555';
            fullAddressDiv.textContent = `${address.city ? `– ${address.city} (${address.province})` : ''} ${address.zip} ${address.country}`;
            (_b = addressDiv.parentElement) === null || _b === void 0 ? void 0 : _b.appendChild(fullAddressDiv);
        }
    });
    cell.appendChild(addressDiv);
    return cell;
}
export function createStyledCell(content, options) {
    const cell = document.createElement('td');
    cell.textContent = content;
    if (options === null || options === void 0 ? void 0 : options.isBold) {
        Object.assign(cell.style, TABLE_STYLES.cellBold);
    }
    else if (options === null || options === void 0 ? void 0 : options.isCenter) {
        Object.assign(cell.style, TABLE_STYLES.cellCenter);
    }
    else {
        Object.assign(cell.style, TABLE_STYLES.cell);
    }
    return cell;
}
export function createStyledRow() {
    const row = document.createElement('tr');
    Object.assign(row.style, TABLE_STYLES.row);
    return row;
}
