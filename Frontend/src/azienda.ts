import {
    CompanySimpleDto,
    CompanyUpsertPayload,
    ContactDto,
    createCompany,
    deleteCompany,
    getCompanies,
    getCompanyContacts,
    updateCompany
} from "./apiAzienda.js";
import { hidePanel, showPanel } from "./common.js";

const tableBody = document.getElementById("table-company-body") as HTMLTableSectionElement | null;

const addButton = document.getElementById("add-company-btn") as HTMLButtonElement | null;
const addPanel = document.getElementById("add-company-panel") as HTMLElement | null;
const addForm = document.getElementById("add-company-form") as HTMLFormElement | null;
const addCancelButton = document.getElementById("cancel-add-company") as HTMLButtonElement | null;
const addError = document.getElementById("add-company-error") as HTMLParagraphElement | null;
const addContactsList = document.getElementById("add-company-contacts-list") as HTMLDivElement | null;
const addContactRowButton = document.getElementById("add-company-contact-row") as HTMLButtonElement | null;

const editPanel = document.getElementById("edit-company-panel") as HTMLElement | null;
const editForm = document.getElementById("edit-company-form") as HTMLFormElement | null;
const editCancelButton = document.getElementById("cancel-edit-company") as HTMLButtonElement | null;
const editError = document.getElementById("edit-company-error") as HTMLParagraphElement | null;
const editContactsList = document.getElementById("edit-company-contacts-list") as HTMLDivElement | null;
const editContactRowButton = document.getElementById("edit-company-contact-row") as HTMLButtonElement | null;

const popupOverlay = document.getElementById("company-popup-overlay") as HTMLDivElement | null;
const popupTitle = document.getElementById("company-popup-title") as HTMLHeadingElement | null;
const popupMessage = document.getElementById("company-popup-message") as HTMLParagraphElement | null;
const popupCancelButton = document.getElementById("company-popup-cancel") as HTMLButtonElement | null;
const popupConfirmButton = document.getElementById("company-popup-confirm") as HTMLButtonElement | null;

let editingCompanyId: number | null = null;
let popupResolver: ((result: boolean) => void) | null = null;
let popupMode: "confirm" | "message" | null = null;

function elementValue(id: string): string {
    const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
    return element?.value.trim() ?? "";
}

function setElementValue(id: string, value: string): void {
    const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
    if (element) {
        element.value = value;
    }
}

function showError(errorElement: HTMLParagraphElement | null, message: string): void {
    if (!errorElement) {
        return;
    }
    errorElement.textContent = message;
}

function clearError(errorElement: HTMLParagraphElement | null): void {
    if (!errorElement) {
        return;
    }
    errorElement.textContent = "";
}

function closePopup(result: boolean): void {
    if (!popupOverlay) {
        popupResolver?.(result);
        popupResolver = null;
        popupMode = null;
        return;
    }

    popupOverlay.classList.remove("visible");
    window.setTimeout(() => {
        popupOverlay.hidden = true;
    }, 180);

    popupResolver?.(result);
    popupResolver = null;
    popupMode = null;
}

function openPopup(options: {
    mode: "confirm" | "message";
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    destructive?: boolean;
}): Promise<boolean> {
    if (!popupOverlay || !popupTitle || !popupMessage || !popupConfirmButton || !popupCancelButton) {
        return Promise.resolve(options.mode === "message");
    }

    popupMode = options.mode;
    popupTitle.textContent = options.title;
    popupMessage.textContent = options.message;

    popupConfirmButton.textContent = options.confirmText;
    popupConfirmButton.classList.toggle("is-danger", options.destructive === true);

    if (options.mode === "confirm") {
        popupCancelButton.hidden = false;
        popupCancelButton.textContent = options.cancelText ?? "Annulla";
    } else {
        popupCancelButton.hidden = true;
    }

    popupOverlay.hidden = false;
    window.requestAnimationFrame(() => {
        popupOverlay.classList.add("visible");
    });

    popupConfirmButton.focus();

    return new Promise<boolean>((resolve) => {
        popupResolver = resolve;
    });
}

async function showMessagePopup(title: string, message: string): Promise<void> {
    await openPopup({
        mode: "message",
        title,
        message,
        confirmText: "Chiudi"
    });
}

function setupPopup(): void {
    popupConfirmButton?.addEventListener("click", () => {
        closePopup(true);
    });

    popupCancelButton?.addEventListener("click", () => {
        closePopup(false);
    });

    popupOverlay?.addEventListener("click", (event) => {
        if (event.target !== popupOverlay) {
            return;
        }

        closePopup(popupMode === "message");
    });

    document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || !popupMode) {
            return;
        }

        closePopup(popupMode === "message");
    });
}

function getCreateCompanyErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) {
        return "Compila i campi obbligatori mancanti e riprova.";
    }

    if (error.message.startsWith("MISSING_FIELDS:")) {
        const rawFields = error.message.slice("MISSING_FIELDS:".length).trim();
        if (!rawFields) {
            return "Compila i campi obbligatori mancanti e riprova.";
        }

        const fields = rawFields
            .split("|")
            .map((field) => field.trim())
            .filter(Boolean);

        if (fields.length === 0) {
            return "Compila i campi obbligatori mancanti e riprova.";
        }

        return `Campi mancanti: ${fields.join(", ")}.`;
    }

    // Mantiene il messaggio di validazione locale dei contatti.
    if (error.message.includes("Compila Nome, Cognome")) {
        return error.message;
    }

    return "Compila i campi obbligatori mancanti e riprova.";
}

function toIsoDate(value: string): string {
    if (!value) {
        return new Date().toISOString();
    }
    return new Date(`${value}T00:00:00`).toISOString();
}

function toDateInputValue(value: string): string {
    if (!value) {
        return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }
    return date.toISOString().slice(0, 10);
}

function createContactEditorRow(contact?: ContactDto): HTMLDivElement {
    const row = document.createElement("div");
    row.className = "contact-editor-row";

    const id = contact?.contactId ?? 0;
    const dateAdded = contact?.dateAdded ?? new Date().toISOString();

    row.innerHTML = `
        <input type="hidden" data-field="contactId" value="${id}">
        <input type="hidden" data-field="dateAdded" value="${dateAdded}">

        <label>Nome</label>
        <input type="text" data-field="name" value="${contact?.name ?? ""}" required>

        <label>Cognome</label>
        <input type="text" data-field="surname" value="${contact?.surname ?? ""}" required>

        <label>Titolo</label>
        <input type="text" data-field="title" value="${contact?.title ?? ""}">

        <label>Ruolo</label>
        <input type="text" data-field="workRole" value="${contact?.workRole ?? ""}">

        <label>Genere</label>
        <input type="text" data-field="gender" value="${contact?.gender ?? ""}">

        <label>Data di nascita</label>
        <input type="date" data-field="birthday" value="${toDateInputValue(contact?.birthday ?? "")}" required>

        <label>Note contatto</label>
        <textarea data-field="note" rows="2">${contact?.note ?? ""}</textarea>
    `;

    return row;
}

function getFieldValue(row: HTMLElement, fieldName: string): string {
    const field = row.querySelector(`[data-field='${fieldName}']`) as HTMLInputElement | HTMLTextAreaElement | null;
    return field?.value.trim() ?? "";
}

function readContacts(listElement: HTMLDivElement | null): ContactDto[] {
    if (!listElement) {
        return [];
    }

    const rows = Array.from(listElement.querySelectorAll(".contact-editor-row")) as HTMLDivElement[];
    const parsed: ContactDto[] = [];

    for (const row of rows) {
        const name = getFieldValue(row, "name");
        const surname = getFieldValue(row, "surname");
        const birthdayRaw = getFieldValue(row, "birthday");

        if (!name && !surname && !birthdayRaw) {
            continue;
        }

        if (!name || !surname || !birthdayRaw) {
            throw new Error("Compila Nome, Cognome e Data di nascita per ogni contatto inserito.");
        }

        parsed.push({
            contactId: Number(getFieldValue(row, "contactId")) || 0,
            name,
            surname,
            title: getFieldValue(row, "title") || undefined,
            workRole: getFieldValue(row, "workRole") || undefined,
            gender: getFieldValue(row, "gender") || undefined,
            birthday: toIsoDate(birthdayRaw),
            note: getFieldValue(row, "note") || undefined,
            dateAdded: getFieldValue(row, "dateAdded") || new Date().toISOString()
        });
    }

    return parsed;
}

function buildCompanyPayload(contactList: HTMLDivElement | null): CompanyUpsertPayload {
    return {
        denomination: elementValue("company-name") || elementValue("edit-company-name"),
        website: elementValue("company-website") || elementValue("edit-company-website") || undefined,
        vatNumber: elementValue("company-partitaIVA") || elementValue("edit-company-partitaIVA"),
        size: elementValue("company-size") || elementValue("edit-company-size") || undefined,
        note: elementValue("company-notes") || elementValue("edit-company-notes") || undefined,
        address: {
            street: elementValue("company-address-street") || elementValue("edit-company-address-street"),
            streetNumber: elementValue("company-address-streetNumber") || elementValue("edit-company-address-streetNumber"),
            zip: elementValue("company-address-zip") || elementValue("edit-company-address-zip"),
            city: elementValue("company-address-city") || elementValue("edit-company-address-city"),
            province: elementValue("company-address-province") || elementValue("edit-company-address-province") || undefined,
            region: elementValue("company-address-region") || elementValue("edit-company-address-region") || undefined,
            country: elementValue("company-address-country") || elementValue("edit-company-address-country")
        },
        contacts: readContacts(contactList)
    };
}

function buildAddCompanyPayload(): CompanyUpsertPayload {
    return {
        denomination: elementValue("company-name"),
        website: elementValue("company-website") || undefined,
        vatNumber: elementValue("company-partitaIVA"),
        size: elementValue("company-size") || undefined,
        note: elementValue("company-notes") || undefined,
        address: {
            street: elementValue("company-address-street"),
            streetNumber: elementValue("company-address-streetNumber"),
            zip: elementValue("company-address-zip"),
            city: elementValue("company-address-city"),
            province: elementValue("company-address-province") || undefined,
            region: elementValue("company-address-region") || undefined,
            country: elementValue("company-address-country")
        },
        contacts: readContacts(addContactsList)
    };
}

function buildEditCompanyPayload(): CompanyUpsertPayload {
    return {
        denomination: elementValue("edit-company-name"),
        website: elementValue("edit-company-website") || undefined,
        vatNumber: elementValue("edit-company-partitaIVA"),
        size: elementValue("edit-company-size") || undefined,
        note: elementValue("edit-company-notes") || undefined,
        address: {
            street: elementValue("edit-company-address-street"),
            streetNumber: elementValue("edit-company-address-streetNumber"),
            zip: elementValue("edit-company-address-zip"),
            city: elementValue("edit-company-address-city"),
            province: elementValue("edit-company-address-province") || undefined,
            region: elementValue("edit-company-address-region") || undefined,
            country: elementValue("edit-company-address-country")
        },
        contacts: readContacts(editContactsList)
    };
}

function buildAddressCell(company: CompanySimpleDto): HTMLTableCellElement {
    const cell = document.createElement("td");
    const summary = document.createElement("button");
    summary.type = "button";
    summary.className = "address-toggle";
    summary.textContent = `${company.address.street} ${company.address.streetNumber}`.trim();

    const details = document.createElement("div");
    details.className = "address-details";
    details.hidden = true;
    details.textContent = `${company.address.street} ${company.address.streetNumber}, ${company.address.zip} ${company.address.city} (${company.address.province ?? ""}), ${company.address.region ?? ""}, ${company.address.country}`;

    summary.addEventListener("click", () => {
        details.hidden = !details.hidden;
    });

    cell.appendChild(summary);
    cell.appendChild(details);
    return cell;
}

function buildWebsiteCell(website?: string): HTMLTableCellElement {
    const cell = document.createElement("td");
    if (!website) {
        cell.textContent = "-";
        return cell;
    }

    const link = document.createElement("a");
    let linkLabel = website;

    try {
        linkLabel = new URL(website).hostname.replace(/^www\./, "");
    } catch {
        linkLabel = website;
    }

    link.href = website;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "company-website-link";
    link.title = website;
    link.textContent = linkLabel;
    cell.appendChild(link);
    return cell;
}

function buildNoteCell(note?: string): HTMLTableCellElement {
    const cell = document.createElement("td");
    const wrapper = document.createElement("div");
    wrapper.className = "note-cell";
    wrapper.textContent = note || "-";
    cell.appendChild(wrapper);
    return cell;
}

function buildActionsCell(company: CompanySimpleDto): HTMLTableCellElement {
    const cell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "row-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-action-btn";
    editButton.textContent = "Modifica";
    editButton.addEventListener("click", () => openEditPanel(company));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-action-btn";
    deleteButton.textContent = "Elimina";
    deleteButton.addEventListener("click", async () => {
        const confirmed = await openPopup({
            mode: "confirm",
            title: "Conferma eliminazione",
            message: `Vuoi eliminare l'azienda ${company.denomination}?`,
            confirmText: "Elimina",
            cancelText: "Annulla",
            destructive: true
        });

        if (!confirmed) {
            return;
        }

        try {
            await deleteCompany(company.companyId);
            await loadCompanies();
        } catch (error) {
            await showMessagePopup("Errore", `Errore durante eliminazione: ${(error as Error).message}`);
        }
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    cell.appendChild(actions);
    return cell;
}

function renderTable(companies: CompanySimpleDto[]): void {
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    for (const company of companies) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = company.denomination;

        const vatCell = document.createElement("td");
        vatCell.textContent = company.vatNumber;

        const sizeCell = document.createElement("td");
        sizeCell.textContent = company.size || "-";

        row.appendChild(nameCell);
        row.appendChild(buildAddressCell(company));
        row.appendChild(buildWebsiteCell(company.website));
        row.appendChild(vatCell);
        row.appendChild(sizeCell);
        row.appendChild(buildNoteCell(company.note));
        row.appendChild(buildActionsCell(company));

        tableBody.appendChild(row);
    }
}

async function loadCompanies(): Promise<void> {
    const companies = await getCompanies();
    renderTable(companies);
}

function clearAddContactRows(): void {
    if (addContactsList) {
        addContactsList.innerHTML = "";
    }
}

function clearEditContactRows(): void {
    if (editContactsList) {
        editContactsList.innerHTML = "";
    }
}

function openAddPanel(): void {
    if (!addPanel || !addButton) {
        return;
    }
    clearError(addError);
    clearAddContactRows();
    showPanel(addPanel, addButton);
}

async function openEditPanel(company: CompanySimpleDto): Promise<void> {
    if (!editPanel || !addButton) {
        return;
    }

    editingCompanyId = company.companyId;
    clearError(editError);

    setElementValue("edit-company-name", company.denomination);
    setElementValue("edit-company-address-street", company.address.street ?? "");
    setElementValue("edit-company-address-streetNumber", company.address.streetNumber ?? "");
    setElementValue("edit-company-address-zip", company.address.zip ?? "");
    setElementValue("edit-company-address-city", company.address.city ?? "");
    setElementValue("edit-company-address-province", company.address.province ?? "");
    setElementValue("edit-company-address-region", company.address.region ?? "");
    setElementValue("edit-company-address-country", company.address.country ?? "");
    setElementValue("edit-company-partitaIVA", company.vatNumber);
    setElementValue("edit-company-size", company.size ?? "");
    setElementValue("edit-company-website", company.website ?? "");
    setElementValue("edit-company-notes", company.note ?? "");

    clearEditContactRows();

    try {
        const contacts = await getCompanyContacts(company.companyId);
        if (editContactsList) {
            contacts.forEach((contact) => {
                editContactsList.appendChild(createContactEditorRow(contact));
            });
        }
    } catch {
        if (editContactsList) {
            editContactsList.innerHTML = "";
        }
    }

    showPanel(editPanel, addButton);
}

function setupAddForm(): void {
    if (!addForm || !addPanel || !addButton) {
        return;
    }

    addForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearError(addError);

        try {
            const payload = buildAddCompanyPayload();
            await createCompany(payload);
            addForm.reset();
            clearAddContactRows();
            hidePanel(addPanel, addButton);
            await loadCompanies();
        } catch (error) {
            showError(addError, getCreateCompanyErrorMessage(error));
        }
    });
}

function setupEditForm(): void {
    if (!editForm || !editPanel || !addButton) {
        return;
    }

    editForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearError(editError);

        if (editingCompanyId == null) {
            showError(editError, "Azienda non selezionata.");
            return;
        }

        try {
            const payload = buildEditCompanyPayload();
            await updateCompany(editingCompanyId, payload);
            hidePanel(editPanel, addButton);
            await loadCompanies();
        } catch (error) {
            showError(editError, (error as Error).message);
        }
    });
}

function setupButtons(): void {
    addButton?.addEventListener("click", openAddPanel);

    addCancelButton?.addEventListener("click", () => {
        if (addPanel && addButton && addForm) {
            hidePanel(addPanel, addButton);
            addForm.reset();
            clearAddContactRows();
        }
    });

    editCancelButton?.addEventListener("click", () => {
        if (editPanel && addButton) {
            hidePanel(editPanel, addButton);
            clearEditContactRows();
            editingCompanyId = null;
        }
    });

    addContactRowButton?.addEventListener("click", () => {
        addContactsList?.appendChild(createContactEditorRow());
    });

    editContactRowButton?.addEventListener("click", () => {
        editContactsList?.appendChild(createContactEditorRow());
    });
}

async function init(): Promise<void> {
    setupPopup();
    setupButtons();
    setupAddForm();
    setupEditForm();
    await loadCompanies();
}

init().catch(async (error: Error) => {
    await showMessagePopup("Errore inizializzazione", `Errore inizializzazione pagina aziende: ${error.message}`);
});
