import { applyTableStyles, createStyledCell, createStyledRow, 
        DELETEBUTTON_STYLES, EDITBUTTON_STYLES, createStyledWebsiteCell,createStyledAddressCell } from './tableUtils.js';
import {  setupAddEntityForm } from './common.js';
import { Company, getCompanies, addCompany, deleteCompany, updateCompany, getCompanyWithDetails} from './apiAzienda.js';

type CompanyData = Company[];

let companyData: CompanyData = [];

initialize();

async function initialize(): Promise<void> {
    setupAddEntityForm<Company>(
        'add-company-btn',
        'add-company-panel',
        'cancel-add-company',
        'add-company-form',
        () => ({
            name: (document.getElementById('company-name') as HTMLInputElement).value,
            address: {
                street: (document.getElementById('company-address-street') as HTMLInputElement).value,
                streetNumber: (document.getElementById('company-address-streetNumber') as HTMLInputElement).value,
                city: (document.getElementById('company-address-city') as HTMLInputElement).value,
                province: (document.getElementById('company-address-province') as HTMLInputElement).value,
                region: (document.getElementById('company-address-region') as HTMLInputElement).value,
                zip: (document.getElementById('company-address-zip') as HTMLInputElement).value,
                country: (document.getElementById('company-address-country') as HTMLInputElement).value,
            },
            website: (document.getElementById('company-website') as HTMLInputElement).value,
            partitaIVA: (document.getElementById('company-partitaIVA') as HTMLInputElement).value,
            size: (document.getElementById('company-size') as HTMLInputElement).value,
            notes: (document.getElementById('company-notes') as HTMLTextAreaElement).value,
        }),
        async (c) => {
            await addCompany(c);
            await loadCompanyData();
        }
    );

    await loadCompanyData();
}

async function loadCompanyData(): Promise<void> {
    try {
        const data = await getCompanies();
        companyData = data;
        showCompany(companyData);
    } catch (err) {
        console.error('Errore nel recupero dati azienda:', err);
    }
}

function getField<T extends HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
}

function readAddress(prefix: string): Company['address'] {
    return {
        street: getField<HTMLInputElement>(`${prefix}-street`).value,
        streetNumber: getField<HTMLInputElement>(`${prefix}-streetNumber`).value,
        city: getField<HTMLInputElement>(`${prefix}-city`).value,
        province: getField<HTMLInputElement>(`${prefix}-province`).value,
        region: getField<HTMLInputElement>(`${prefix}-region`).value,
        zip: getField<HTMLInputElement>(`${prefix}-zip`).value,
        country: getField<HTMLInputElement>(`${prefix}-country`).value,
    };
}

function openEditForm(company: Company): void {
    const panel = getField<HTMLElement>('edit-company-panel');
    const form = getField<HTMLFormElement>('edit-company-form');
    const cancelBtn = getField<HTMLButtonElement>('cancel-edit-company');
    const addBtn = getField<HTMLElement>('add-company-btn');

    // Popola il form con i dati dell'azienda selezionata
    getField<HTMLInputElement>('edit-company-name').value = company.name;
    getField<HTMLInputElement>('edit-company-address-street').value = company.address.street;
    getField<HTMLInputElement>('edit-company-address-streetNumber').value = company.address.streetNumber;
    getField<HTMLInputElement>('edit-company-address-city').value = company.address.city;
    getField<HTMLInputElement>('edit-company-address-province').value = company.address.province;
    getField<HTMLInputElement>('edit-company-address-region').value = company.address.region;
    getField<HTMLInputElement>('edit-company-address-zip').value = company.address.zip;
    getField<HTMLInputElement>('edit-company-address-country').value = company.address.country;
    getField<HTMLInputElement>('edit-company-website').value = company.website;
    getField<HTMLInputElement>('edit-company-partitaIVA').value = company.partitaIVA;
    getField<HTMLInputElement>('edit-company-size').value = company.size;
    getField<HTMLTextAreaElement>('edit-company-notes').value = company.notes;

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

    const submitHandler = async (e: Event) => {
        e.preventDefault();

        const updatedCompany: Company = {
            id: company.id,
            name: getField<HTMLInputElement>('edit-company-name').value,
            address: readAddress('edit-company-address'),
            website: getField<HTMLInputElement>('edit-company-website').value,
            partitaIVA: getField<HTMLInputElement>('edit-company-partitaIVA').value,
            size: getField<HTMLInputElement>('edit-company-size').value,
            notes: getField<HTMLTextAreaElement>('edit-company-notes').value,
        };

        try {
                await updateCompany(company.id, updatedCompany); 
            await loadCompanyData();
            closePanel();
        } catch (err) {
            console.error('Errore aggiornamento azienda:', err);
        }
    };

    cancelBtn.addEventListener('click', closePanel);
    form.addEventListener('submit', submitHandler);
}

function populateInfoPanel(company: Company): void {
      const panel = getField<HTMLElement>('company-detail-panel');
    const div = getField<HTMLDivElement>('company-detail-content');
    const nameDiv = getField<HTMLDivElement>('company-detail-name');
    const addressDiv = getField<HTMLDivElement>('company-detail-address');
    const partitaIVADiv = getField<HTMLDivElement>('company-detail-partitaIVA');
    const sizeDiv = getField<HTMLDivElement>('company-detail-size');
    const websiteDiv = getField<HTMLDivElement>('company-detail-website');
    const contactsDiv = getField<HTMLDivElement>('company-detail-contacts');
    const notesDiv = getField<HTMLDivElement>('company-detail-notes');
    const cancelBtn = getField<HTMLButtonElement>('cancel-edit-company');
   
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

function openInfoPanel(company: Company): void {

    // need to fetch full details in case the company list endpoint returns only partial data
        getCompanyWithDetails(company.id)
        .then(fullCompany => {
            populateInfoPanel(fullCompany);
        }
        )
        .catch(err => {
            console.error('Errore nel recupero dettagli azienda:', err);
            // In caso di errore, mostra comunque il pannello con i dati parziali
            populateInfoPanel(company);
        });
  

}

function showCompany(data: CompanyData): void {
    const tableBody = document.getElementById('table-company-body') as HTMLTableSectionElement;
    const table = tableBody.closest('table') as HTMLTableElement;

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
            } catch (err) {
                console.error('Errore eliminazione azienda:', err);
            }
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    });
}