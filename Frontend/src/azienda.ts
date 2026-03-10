import { applyTableStyles, createStyledCell, createStyledRow, TABLE_STYLES, DELETEBUTTON_STYLES } from './tableUtils.js';

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

// Inizializza con dati di esempio
const companyData: CompanyData = [
    {
        name: "Acme Corp",
        address: "Via Roma 123, Milano",
        website: "www.acmecorp.it",
        partitaIVA: "12345678901",
        size: "Grande",
        notes: "Cliente premium con molti contatti"
    },
    {
        name: "TechSolutions srl",
        address: "Corso Vittorio 456, Torino",
        website: "www.techsolutions.it",
        partitaIVA: "98765432109",
        size: "Media",
        notes: "Specializzata in software development"
    },
    {
        name: "GreenEnergy Ltd",
        address: "Via Garibaldi 789, Bologna",
        website: "www.greenenergy.eu",
        partitaIVA: "11223344556",
        size: "Piccola",
        notes: "Certificazioni ambientali internazionali"
    }
];

// Chiama la funzione con i dati
showCompany(companyData);

function showCompany(data: CompanyData) {
    const tableBody = document.getElementById('table-company-body') as HTMLTableSectionElement;
    const table = tableBody.closest('table') as HTMLTableElement;

    tableBody.innerHTML = '';

    applyTableStyles(table);

    // Itera sui dati e crea le righe
    data.forEach(company => {
        const row = createStyledRow();

        // Nome Azienda
        row.appendChild(createStyledCell(company.name));

        // Indirizzo
        row.appendChild(createStyledCell(company.address));

        // Sito Web
        row.appendChild(createStyledCell(company.website));

        // Partita IVA
        row.appendChild(createStyledCell(company.partitaIVA));

        // Dimensione
        row.appendChild(createStyledCell(company.size));

        // Note
        row.appendChild(createStyledCell(company.notes));

        // pulsante per eliminare l'azienda
        const deleteButton = document.createElement('button');
        deleteButton.addEventListener('click', () => {
            tableBody.removeChild(row);
        });
        Object.assign(deleteButton.style, DELETEBUTTON_STYLES);
        deleteButton.textContent = 'Elimina';
        row.appendChild(deleteButton);

        tableBody.appendChild(row);
    });
}