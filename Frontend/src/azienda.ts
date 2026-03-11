import { applyTableStyles, createStyledCell, createStyledRow, TABLE_STYLES, DELETEBUTTON_STYLES, EDITBUTTON_STYLES } from './tableUtils.js';
import { Company, getCompanies, addCompany, setupAddEntityForm } from './common.js';

// consolidated type for a list of companies
type CompanyData = Company[];

let companyData: CompanyData = [];

// bootstrap the page behaviour       
initialize();

async function initialize(): Promise<void> {
    setupAddEntityForm<Company>(
        'add-company-btn',
        'add-company-panel',
        'cancel-add-company',
        'add-company-form',
        () => ({
            name: (document.getElementById('company-name') as HTMLInputElement).value,
            address:{
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

function openEditForm(company: Company): void {
    // Popola il form di modifica con i dati attuali
    (document.getElementById('edit-company-name') as HTMLInputElement).value = company.name;

    (document.getElementById('edit-company-address-street') as HTMLInputElement).value = company.address.street;
    (document.getElementById('edit-company-address-streetNumber') as HTMLInputElement).value = company.address.streetNumber;
    (document.getElementById('edit-company-address-city') as HTMLInputElement).value = company.address.city;
    (document.getElementById('edit-company-address-province') as HTMLInputElement).value = company.address.province;
    (document.getElementById('edit-company-address-region') as HTMLInputElement).value = company.address.region;
    (document.getElementById('edit-company-address-zip') as HTMLInputElement).value = company.address.zip;
    (document.getElementById('edit-company-address-country') as HTMLInputElement).value = company.address.country;

    (document.getElementById('edit-company-website') as HTMLInputElement).value = company.website;
    (document.getElementById('edit-company-partitaIVA') as HTMLInputElement).value = company.partitaIVA;
    (document.getElementById('edit-company-size') as HTMLInputElement).value = company.size;
    (document.getElementById('edit-company-notes') as HTMLTextAreaElement).value = company.notes;

    // Mostra il pannello di modifica
    const panel = document.getElementById('edit-company-panel') as HTMLElement;
    panel.style.display = 'block';
    document.body.classList.add('modal-open');

    // Gestisci la chiusura
    const cancelBtn = document.getElementById('cancel-edit-company') as HTMLButtonElement;
    const form = document.getElementById('edit-company-form') as HTMLFormElement;

    const closeHandler = () => {
        panel.style.display = 'none';
        document.body.classList.remove('modal-open');
        form.reset();
        cancelBtn.removeEventListener('click', closeHandler);
        form.removeEventListener('submit', submitHandler);
    };

    const submitHandler = async (e: Event) => {
        e.preventDefault();
        const updatedCompany: Company = {
            name: (document.getElementById('edit-company-name') as HTMLInputElement).value,
            address: {
                street: (document.getElementById('edit-company-address-street') as HTMLInputElement).value,
                streetNumber: (document.getElementById('edit-company-address-streetNumber') as HTMLInputElement).value,
                city: (document.getElementById('edit-company-address-city') as HTMLInputElement).value,
                province: (document.getElementById('edit-company-address-province') as HTMLInputElement).value,
                region: (document.getElementById('edit-company-address-region') as HTMLInputElement).value,
                zip: (document.getElementById('edit-company-address-zip') as HTMLInputElement).value,
                country: (document.getElementById('edit-company-address-country') as HTMLInputElement).value,
            },
            website: (document.getElementById('edit-company-website') as HTMLInputElement).value,
            partitaIVA: (document.getElementById('edit-company-partitaIVA') as HTMLInputElement).value,
            size: (document.getElementById('edit-company-size') as HTMLInputElement).value,
            notes: (document.getElementById('edit-company-notes') as HTMLTextAreaElement).value,
        };

        try {
            // Qui dovresti chiamare l'API per aggiornare l'azienda
            // Per ora, simula un aggiornamento locale
            console.log('Aggiornamento azienda:', updatedCompany);
            await loadCompanyData(); // Ricarica i dati
            closeHandler();
        } catch (err) {
            console.error('Errore nell\'aggiornamento azienda:', err);
        }
    };

    cancelBtn.addEventListener('click', closeHandler);
    form.addEventListener('submit', submitHandler);
}

function showCompany(data: CompanyData) {
    const tableBody = document.getElementById('table-company-body') as HTMLTableSectionElement;
    const table = tableBody.closest('table') as HTMLTableElement;

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


