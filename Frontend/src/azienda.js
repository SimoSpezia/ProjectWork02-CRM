import { applyTableStyles, createStyledCell, createStyledRow, DELETEBUTTON_STYLES } from './tableUtils.js';
// Inizializza con dati di esempio
const companyData = [
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
function showCompany(data) {
    const tableBody = document.getElementById('table-company-body');
    const table = tableBody.closest('table');
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
