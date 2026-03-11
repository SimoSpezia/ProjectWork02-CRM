import { applyTableStyles, createStyledCell, createStyledRow, DELETEBUTTON_STYLES, EDITBUTTON_STYLES } from './tableUtils.js';
import { getCompanies, addCompany, setupAddEntityForm } from './common.js';
let companyData = [];
// bootstrap the page behaviour       
initialize();
async function initialize() {
    setupAddEntityForm('add-company-btn', 'add-company-panel', 'cancel-add-company', 'add-company-form', () => ({
        name: document.getElementById('company-name').value,
        address: {
            street: document.getElementById('company-address-street').value,
            streetNumber: document.getElementById('company-address-streetNumber').value,
            city: document.getElementById('company-address-city').value,
            province: document.getElementById('company-address-province').value,
            region: document.getElementById('company-address-region').value,
            zip: document.getElementById('company-address-zip').value,
            country: document.getElementById('company-address-country').value,
        },
        website: document.getElementById('company-website').value,
        partitaIVA: document.getElementById('company-partitaIVA').value,
        size: document.getElementById('company-size').value,
        notes: document.getElementById('company-notes').value,
    }), async (c) => {
        await addCompany(c);
        await loadCompanyData();
    });
    await loadCompanyData();
}
async function loadCompanyData() {
    try {
        const data = await getCompanies();
        companyData = data;
        showCompany(companyData);
    }
    catch (err) {
        console.error('Errore nel recupero dati azienda:', err);
    }
}
function openEditForm(company) {
    // Popola il form di modifica con i dati attuali
    document.getElementById('edit-company-name').value = company.name;
    document.getElementById('edit-company-address-street').value = company.address.street;
    document.getElementById('edit-company-address-streetNumber').value = company.address.streetNumber;
    document.getElementById('edit-company-address-city').value = company.address.city;
    document.getElementById('edit-company-address-province').value = company.address.province;
    document.getElementById('edit-company-address-region').value = company.address.region;
    document.getElementById('edit-company-address-zip').value = company.address.zip;
    document.getElementById('edit-company-address-country').value = company.address.country;
    document.getElementById('edit-company-website').value = company.website;
    document.getElementById('edit-company-partitaIVA').value = company.partitaIVA;
    document.getElementById('edit-company-size').value = company.size;
    document.getElementById('edit-company-notes').value = company.notes;
    // Mostra il pannello di modifica
    const panel = document.getElementById('edit-company-panel');
    panel.style.display = 'block';
    document.body.classList.add('modal-open');
    // Gestisci la chiusura
    const cancelBtn = document.getElementById('cancel-edit-company');
    const form = document.getElementById('edit-company-form');
    const closeHandler = () => {
        panel.style.display = 'none';
        document.body.classList.remove('modal-open');
        form.reset();
        cancelBtn.removeEventListener('click', closeHandler);
        form.removeEventListener('submit', submitHandler);
    };
    const submitHandler = async (e) => {
        e.preventDefault();
        const updatedCompany = {
            name: document.getElementById('edit-company-name').value,
            address: {
                street: document.getElementById('edit-company-address-street').value,
                streetNumber: document.getElementById('edit-company-address-streetNumber').value,
                city: document.getElementById('edit-company-address-city').value,
                province: document.getElementById('edit-company-address-province').value,
                region: document.getElementById('edit-company-address-region').value,
                zip: document.getElementById('edit-company-address-zip').value,
                country: document.getElementById('edit-company-address-country').value,
            },
            website: document.getElementById('edit-company-website').value,
            partitaIVA: document.getElementById('edit-company-partitaIVA').value,
            size: document.getElementById('edit-company-size').value,
            notes: document.getElementById('edit-company-notes').value,
        };
        try {
            // Qui dovresti chiamare l'API per aggiornare l'azienda
            // Per ora, simula un aggiornamento locale
            console.log('Aggiornamento azienda:', updatedCompany);
            await loadCompanyData(); // Ricarica i dati
            closeHandler();
        }
        catch (err) {
            console.error('Errore nell\'aggiornamento azienda:', err);
        }
    };
    cancelBtn.addEventListener('click', closeHandler);
    form.addEventListener('submit', submitHandler);
}
function showCompany(data) {
    const tableBody = document.getElementById('table-company-body');
    const table = tableBody.closest('table');
    tableBody.innerHTML = '';
    applyTableStyles(table);
    data.forEach(company => {
        const row = createStyledRow();
        row.appendChild(createStyledCell(company.name));
        row.appendChild(createStyledCell(company.address.street + ' '
            + company.address.streetNumber
            + ', '
            + company.address.city
            + ' (' + company.address.province + '), '
            + company.address.region
            + ' - ' + company.address.zip
            + ', ' + company.address.country));
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
            openEditForm(company);
        });
        Object.assign(editButton.style, EDITBUTTON_STYLES);
        editButton.textContent = 'Modifica';
        row.appendChild(editButton);
        tableBody.appendChild(row);
    });
}
