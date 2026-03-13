import { applyTableStyles, createStyledCell, createStyledRow, DELETEBUTTON_STYLES, EDITBUTTON_STYLES, createStyledWebsiteCell, createStyledAddressCell } from './tableUtils.js';
import { setupAddEntityForm } from './common.js';
import { getCompanies, addCompany, deleteCompany, updateCompany, getCompanyWithDetails } from './apiAzienda.js';
let companyData = [];
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
function getField(id) {
    return document.getElementById(id);
}
function readAddress(prefix) {
    return {
        street: getField(`${prefix}-street`).value,
        streetNumber: getField(`${prefix}-streetNumber`).value,
        city: getField(`${prefix}-city`).value,
        province: getField(`${prefix}-province`).value,
        region: getField(`${prefix}-region`).value,
        zip: getField(`${prefix}-zip`).value,
        country: getField(`${prefix}-country`).value,
    };
}
function openEditForm(company) {
    const panel = getField('edit-company-panel');
    const form = getField('edit-company-form');
    const cancelBtn = getField('cancel-edit-company');
    const addBtn = getField('add-company-btn');
    // Popola il form con i dati dell'azienda selezionata
    getField('edit-company-name').value = company.name;
    getField('edit-company-address-street').value = company.address.street;
    getField('edit-company-address-streetNumber').value = company.address.streetNumber;
    getField('edit-company-address-city').value = company.address.city;
    getField('edit-company-address-province').value = company.address.province;
    getField('edit-company-address-region').value = company.address.region;
    getField('edit-company-address-zip').value = company.address.zip;
    getField('edit-company-address-country').value = company.address.country;
    getField('edit-company-website').value = company.website;
    getField('edit-company-partitaIVA').value = company.partitaIVA;
    getField('edit-company-size').value = company.size;
    getField('edit-company-notes').value = company.notes;
    // Mostra il pannello con animazione CSS
    panel.style.display = 'block';
    void panel.offsetHeight;
    panel.classList.add('visible');
    document.body.classList.add('modal-open');
    const closePanel = () => {
        panel.classList.remove('visible');
        panel.addEventListener('transitionend', () => {
            panel.style.display = 'none';
        }, { once: true });
        document.body.classList.remove('modal-open');
        form.reset();
        cancelBtn.removeEventListener('click', closePanel);
        form.removeEventListener('submit', submitHandler);
    };
    const submitHandler = async (e) => {
        e.preventDefault();
        const updatedCompany = {
            id: company.id,
            name: getField('edit-company-name').value,
            address: readAddress('edit-company-address'),
            website: getField('edit-company-website').value,
            partitaIVA: getField('edit-company-partitaIVA').value,
            size: getField('edit-company-size').value,
            notes: getField('edit-company-notes').value,
        };
        try {
            await updateCompany(company.id, updatedCompany);
            await loadCompanyData();
            closePanel();
        }
        catch (err) {
            console.error('Errore aggiornamento azienda:', err);
        }
    };
    cancelBtn.addEventListener('click', closePanel);
    form.addEventListener('submit', submitHandler);
}
function populateInfoPanel(company) {
    const panel = getField('company-detail-panel');
    const div = getField('company-detail-content');
    const nameDiv = getField('company-detail-name');
    const addressDiv = getField('company-detail-address');
    const partitaIVADiv = getField('company-detail-partitaIVA');
    const sizeDiv = getField('company-detail-size');
    const websiteDiv = getField('company-detail-website');
    const contactsDiv = getField('company-detail-contacts');
    const notesDiv = getField('company-detail-notes');
    const cancelBtn = getField('cancel-edit-company');
    nameDiv.textContent = `Nome: ${company.name}`;
    addressDiv.textContent = `Indirizzo: ${company.address.street} ${company.address.streetNumber}, ${company.address.city}, ${company.address.province}, ${company.address.region}, ${company.address.zip}, ${company.address.country}`;
    partitaIVADiv.textContent = `Partita IVA: ${company.partitaIVA}`;
    sizeDiv.textContent = `Dimensione: ${company.size}`;
    websiteDiv.textContent = `Sito Web: ${company.website}`;
    contactsDiv.textContent = `Contatti: ${company.contacts ? company.contacts.map(c => `${c.name} (${c.role})`).join(', ') : 'N/A'}`;
    notesDiv.textContent = `Note: ${company.notes}`;
    // Mostra il pannello con animazione CSS
    panel.style.display = 'block';
    void panel.offsetHeight;
    panel.classList.add('visible');
    document.body.classList.add('modal-open');
    const closePanel = () => {
        panel.classList.remove('visible');
        panel.addEventListener('transitionend', () => {
            panel.style.display = 'none';
        }, { once: true });
        document.body.classList.remove('modal-open');
        cancelBtn.removeEventListener('click', closePanel);
    };
    cancelBtn.addEventListener('click', closePanel);
}
function openInfoPanel(company) {
    // need to fetch full details in case the company list endpoint returns only partial data
    getCompanyWithDetails(company.id)
        .then(fullCompany => {
        populateInfoPanel(fullCompany);
    })
        .catch(err => {
        console.error('Errore nel recupero dettagli azienda:', err);
        // In caso di errore, mostra comunque il pannello con i dati parziali
        populateInfoPanel(company);
    });
}
function showCompany(data) {
    const tableBody = document.getElementById('table-company-body');
    const table = tableBody.closest('table');
    tableBody.innerHTML = '';
    applyTableStyles(table);
    data.forEach(company => {
        const row = createStyledRow();
        const nameCell = createStyledCell(company.name);
        nameCell.style.cursor = 'pointer';
        nameCell.addEventListener('click', () => {
            openInfoPanel(company);
        });
        row.appendChild(nameCell);
        row.appendChild(createStyledAddressCell(company.address));
        row.appendChild(createStyledWebsiteCell(company.website));
        row.appendChild(createStyledCell(company.partitaIVA));
        row.appendChild(createStyledCell(company.size));
        const notesCell = document.createElement('td');
        const notesDiv = document.createElement('div');
        notesDiv.className = 'note-cell';
        notesDiv.textContent = company.notes;
        notesCell.appendChild(notesDiv);
        row.appendChild(notesCell);
        const actionsCell = document.createElement('td');
        actionsCell.style.verticalAlign = 'middle';
        actionsCell.style.whiteSpace = 'nowrap';
        actionsCell.style.padding = '0.5rem 0.75rem';
        const editButton = document.createElement('button');
        editButton.textContent = 'Modifica';
        Object.assign(editButton.style, EDITBUTTON_STYLES);
        editButton.style.marginRight = '0.4rem';
        editButton.addEventListener('click', () => openEditForm(company));
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Elimina';
        Object.assign(deleteButton.style, DELETEBUTTON_STYLES);
        deleteButton.addEventListener('click', async () => {
            try {
                await deleteCompany(company.id);
                await loadCompanyData();
            }
            catch (err) {
                console.error('Errore eliminazione azienda:', err);
            }
        });
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
        tableBody.appendChild(row);
    });
}
