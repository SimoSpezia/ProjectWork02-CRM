import { applyTableStyles, createStyledCell, createStyledRow, TABLE_STYLES, DELETEBUTTON_STYLES,EDITBUTTON_STYLES } from './tableUtils.js';

// Interfaccia per i dati azienda
interface Company {
    name: string;
    address: string;
    website: string;
    partitaIVA: string;
    size: string;
    notes: string;
}

type CompanyData = Company[];

let companyData: CompanyData = [];

// Initialize event listeners
initializeEventListeners();

getCompanyData().catch(err => console.error('Errore nel recupero dati azienda:', err));

function initializeEventListeners(): void {
    // Open form
    const addCompanyBtn = document.getElementById('add-company-btn') as HTMLButtonElement;
    const addCompanyPanel = document.getElementById('add-company-panel') as HTMLDivElement;
    const cancelBtn = document.getElementById('cancel-add-company') as HTMLButtonElement;
    const addCompanyForm = document.getElementById('add-company-form') as HTMLFormElement;

    addCompanyBtn.addEventListener('click', () => {
        addCompanyPanel.style.display = 'block';
        addCompanyBtn.style.display = 'none';
    });

    // Close form
    cancelBtn.addEventListener('click', () => {
        addCompanyPanel.style.display = 'none';
        addCompanyBtn.style.display = 'block';
        addCompanyForm.reset();
    });

    // Handle form submission
    addCompanyForm.addEventListener('submit', (e: Event) => {
        e.preventDefault();
        handleAddCompany();
    });
}

function handleAddCompany(): void {
    const form = document.getElementById('add-company-form') as HTMLFormElement;
    const newCompany: Company = {
        name: (document.getElementById('company-name') as HTMLInputElement).value,
        address: (document.getElementById('company-address') as HTMLInputElement).value,
        website: (document.getElementById('company-website') as HTMLInputElement).value,
        partitaIVA: (document.getElementById('company-partitaIVA') as HTMLInputElement).value,
        size: (document.getElementById('company-size') as HTMLInputElement).value,
        notes: (document.getElementById('company-notes') as HTMLTextAreaElement).value,
    };

    // POST the new company to the backend
    fetch('/api/companies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompany),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Close panel and reset form
            const addCompanyPanel = document.getElementById('add-company-panel') as HTMLDivElement;
            const addCompanyBtn = document.getElementById('add-company-btn') as HTMLButtonElement;
            addCompanyPanel.style.display = 'none';
            addCompanyBtn.style.display = 'block';
            form.reset();
            // Refresh data
            return getCompanyData();
        })
        .catch(err => console.error('Errore nell\'aggiunta azienda:', err));
}

async function getCompanyData(): Promise<void> {
    const response = await fetch('/api/companies');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CompanyData = await response.json();
    companyData = data;
    showCompany(companyData);
}

function showCompany(data: CompanyData) {
    const tableBody = document.getElementById('table-company-body') as HTMLTableSectionElement;
    const table = tableBody.closest('table') as HTMLTableElement;

    tableBody.innerHTML = '';

    applyTableStyles(table);

    data.forEach(company => {
        const row = createStyledRow();

        row.appendChild(createStyledCell(company.name));

        row.appendChild(createStyledCell(company.address));

        row.appendChild(createStyledCell(company.website));

        row.appendChild(createStyledCell(company.partitaIVA));

        row.appendChild(createStyledCell(company.size));

        row.appendChild(createStyledCell(company.notes));

        const deleteButton = document.createElement('button');
        deleteButton.addEventListener('click', () => {
            tableBody.removeChild(row);
        });
        Object.assign(deleteButton.style, DELETEBUTTON_STYLES);
        deleteButton.textContent = 'Elimina';
        row.appendChild(deleteButton);

        const editButton = document.createElement('button');
        editButton.addEventListener('click', () => {
        // apri il popup di modifica con i dati correnti dell'azienda
        });
        Object.assign(editButton.style, EDITBUTTON_STYLES);
        editButton.textContent = 'Modifica';
        row.appendChild(editButton);

        tableBody.appendChild(row);
    });
}

