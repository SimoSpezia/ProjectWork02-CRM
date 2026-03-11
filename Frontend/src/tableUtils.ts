

export const TABLE_STYLES = {
    table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        marginTop: '20px',
        tableLayout: 'fixed' as const
    },
    headerRow: {
        borderBottom: '2px solid #ddd'
    },
    headerCell: {
        padding: '10px',
        textAlign: 'left' as const
    },
    row: {
        borderBottom: '1px solid #ddd'
    },
    cell: {
        padding: '10px',
        wordBreak: 'break-word' as const
    },
    cellCenter: {
        padding: '10px',
        textAlign: 'center' as const,
        wordBreak: 'break-word' as const
    },
    cellBold: {
        padding: '10px',
        fontWeight: 'bold' as const,
        wordBreak: 'break-word' as const
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


export function applyTableStyles(table: HTMLTableElement): void {
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

export function createStyledCell(
    content: string,
    options?: {
        isBold?: boolean;
        isCenter?: boolean;
    }
): HTMLTableCellElement {
    const cell = document.createElement('td');
    cell.textContent = content;
    
    if (options?.isBold) {
        Object.assign(cell.style, TABLE_STYLES.cellBold);
    } else if (options?.isCenter) {
        Object.assign(cell.style, TABLE_STYLES.cellCenter);
    } else {
        Object.assign(cell.style, TABLE_STYLES.cell);
    }
    
    return cell;
}

export function createStyledRow(): HTMLTableRowElement {
    const row = document.createElement('tr');
    Object.assign(row.style, TABLE_STYLES.row);
    return row;
}