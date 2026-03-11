import { applyTableStyles, createStyledCell, createStyledRow, DELETEBUTTON_STYLES, EDITBUTTON_STYLES } from './tableUtils.js';
let companyData = [];
// Initialize event listeners
initializeEventListeners();
getCompanyData().catch(err => console.error('Errore nel recupero dati azienda:', err));
function initializeEventListeners() {
    // Open form
    const addCompanyBtn = document.getElementById('add-company-btn');
    const addCompanyPanel = document.getElementById('add-company-panel');
    const cancelBtn = document.getElementById('cancel-add-company');
    const addCompanyForm = document.getElementById('add-company-form');
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
    addCompanyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAddCompany();
    });
}
function handleAddCompany() {
    const form = document.getElementById('add-company-form');
    const newCompany = {
        name: document.getElementById('company-name').value,
        address: document.getElementById('company-address').value,
        website: document.getElementById('company-website').value,
        partitaIVA: document.getElementById('company-partitaIVA').value,
        size: document.getElementById('company-size').value,
        notes: document.getElementById('company-notes').value,
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
        const addCompanyPanel = document.getElementById('add-company-panel');
        const addCompanyBtn = document.getElementById('add-company-btn');
        addCompanyPanel.style.display = 'none';
        addCompanyBtn.style.display = 'block';
        form.reset();
        // Refresh data
        return getCompanyData();
    })
        .catch(err => console.error('Errore nell\'aggiunta azienda:', err));
}
async function getCompanyData() {
    const response = await fetch('/api/companies');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    companyData = data;
    showCompany(companyData);
}
function showCompany(data) {
    const tableBody = document.getElementById('table-company-body');
    const table = tableBody.closest('table');
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
