import { hidePanel, showPanel } from "./common.js";
import { createAddressSelectBinding } from "./address.js";
import {
    ContactDto,
    ContactUpsertPayload,
    getContact,
    createContact,
    deleteContact,
    updateContact
} from "./apiContact.js";
import { CompanySimpleDto, getCompanies } from "./apiAzienda.js";

const tableBody = document.getElementById("table-contact-body") as HTMLTableSectionElement | null;

const addButton = document.getElementById("add-contact-btn") as HTMLButtonElement | null;
const addPanel = document.getElementById("add-contact-panel") as HTMLElement | null;
const addForm = document.getElementById("add-contact-form") as HTMLFormElement | null;
const addCancelButton = document.getElementById("cancel-add-contact") as HTMLButtonElement | null;
const addError = document.getElementById("add-contact-error") as HTMLParagraphElement | null;

const editPanel = document.getElementById("edit-contact-panel") as HTMLElement | null;
const editForm = document.getElementById("edit-contact-form") as HTMLFormElement | null;
const editCancelButton = document.getElementById("cancel-edit-contact") as HTMLButtonElement | null;
const editError = document.getElementById("edit-contact-error") as HTMLParagraphElement | null;

const popupOverlay = document.getElementById("company-popup-overlay") as HTMLDivElement | null;
const popupTitle = document.getElementById("company-popup-title") as HTMLHeadingElement | null;
const popupMessage = document.getElementById("company-popup-message") as HTMLParagraphElement | null;
const popupCancelButton = document.getElementById("company-popup-cancel") as HTMLButtonElement | null;
const popupConfirmButton = document.getElementById("company-popup-confirm") as HTMLButtonElement | null;

let editingContactId: number | null = null;
let popupResolver: ((result: boolean) => void) | null = null;
let popupMode: "confirm" | "message" | null = null;
let companyOptions: string[] = [];

const addAddressBinding = createAddressSelectBinding({
    countryId: "contact-address-country",
    regionId: "contact-address-region",
    provinceId: "contact-address-province",
    cityId: "contact-address-city"
});

const editAddressBinding = createAddressSelectBinding({
    countryId: "edit-contact-address-country",
    regionId: "edit-contact-address-region",
    provinceId: "edit-contact-address-province",
    cityId: "edit-contact-address-city"
});

function elementValue(id: string): string {
    const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    return element?.value.trim() ?? "";
}

function setElementValue(id: string, value: string): void {
    const element = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (element) {
        element.value = value;
    }
}

function ensureSelectOption(selectId: string, value: string): void {
    if (!value) {
        return;
    }

    const select = document.getElementById(selectId) as HTMLSelectElement | null;
    if (!select) {
        return;
    }

    const exists = Array.from(select.options).some((option) => option.value === value);
    if (!exists) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    }
}

function populateCompanySelect(selectId: string, selectedValue = ""): void {
    const select = document.getElementById(selectId) as HTMLSelectElement | null;
    if (!select) {
        return;
    }

    select.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Seleziona azienda";
    select.appendChild(placeholderOption);

    for (const companyName of companyOptions) {
        const option = document.createElement("option");
        option.value = companyName;
        option.textContent = companyName;
        select.appendChild(option);
    }

    if (selectedValue) {
        ensureSelectOption(selectId, selectedValue);
        select.value = selectedValue;
        return;
    }

    select.value = "";
}

async function loadCompanyOptions(): Promise<void> {
    const companies: CompanySimpleDto[] = await getCompanies();
    const uniqueNames = new Set(
        companies
            .map((company) => company.denomination?.trim() ?? "")
            .filter((name) => name.length > 0)
    );

    companyOptions = Array.from(uniqueNames).sort((a, b) => a.localeCompare(b, "it", { sensitivity: "base" }));

    populateCompanySelect("contact-company");
    populateCompanySelect("edit-contact-company");
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

function getUpsertErrorMessage(error: unknown): string {
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

    return error.message || "Compila i campi obbligatori mancanti e riprova.";
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

function toDisplayDate(value: string): string {
    if (!value) {
        return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("it-IT");
}

function buildAddPayload(): ContactUpsertPayload {
    return {
        name: elementValue("contact-name"),
        surname: elementValue("contact-surname"),
        companyDenomination: elementValue("contact-company") || undefined,
        title: elementValue("contact-title") || undefined,
        workRole: elementValue("contact-work-role") || undefined,
        gender: elementValue("contact-gender") || undefined,
        birthday: toIsoDate(elementValue("contact-birthday")),
        note: elementValue("contact-note") || undefined,
        dateAdded: new Date().toISOString()
    };
}

function buildEditPayload(): ContactUpsertPayload {
    return {
        contactId: editingContactId ?? undefined,
        name: elementValue("edit-contact-name"),
        surname: elementValue("edit-contact-surname"),
        companyDenomination: elementValue("edit-contact-company") || undefined,
        title: elementValue("edit-contact-title-input") || undefined,
        workRole: elementValue("edit-contact-work-role") || undefined,
        gender: elementValue("edit-contact-gender") || undefined,
        birthday: toIsoDate(elementValue("edit-contact-birthday")),
        note: elementValue("edit-contact-note") || undefined,
        dateAdded: elementValue("edit-contact-date-added") || new Date().toISOString()
    };
}

function fillEditForm(contact: ContactDto): void {
    setElementValue("edit-contact-id", String(contact.contactId));
    setElementValue("edit-contact-date-added", contact.dateAdded);
    setElementValue("edit-contact-name", contact.name);
    setElementValue("edit-contact-surname", contact.surname);
    populateCompanySelect("edit-contact-company", contact.companyDenomination ?? "");
    setElementValue("edit-contact-title-input", contact.title ?? "");
    setElementValue("edit-contact-work-role", contact.workRole ?? "");
    setElementValue("edit-contact-gender", contact.gender ?? "");
    setElementValue("edit-contact-birthday", toDateInputValue(contact.birthday));
    setElementValue("edit-contact-note", contact.note ?? "");
}

function buildActionsCell(contact: ContactDto): HTMLTableCellElement {
    const cell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "row-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-action-btn";
    editButton.textContent = "Modifica";
    editButton.addEventListener("click", () => {
        if (!editPanel || !addButton) {
            return;
        }

        editingContactId = contact.contactId;
        clearError(editError);
        fillEditForm(contact);
        showPanel(editPanel, addButton);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-action-btn";
    deleteButton.textContent = "Elimina";
    deleteButton.addEventListener("click", async () => {
        const confirmed = await openPopup({
            mode: "confirm",
            title: "Conferma eliminazione",
            message: `Vuoi eliminare il contatto ${contact.name} ${contact.surname}?`,
            confirmText: "Elimina",
            cancelText: "Annulla",
            destructive: true
        });

        if (!confirmed) {
            return;
        }

        try {
            await deleteContact(contact.contactId);
            await loadContacts();
        } catch (error) {
            await showMessagePopup("Errore", `Errore durante eliminazione: ${(error as Error).message}`);
        }
    });

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    cell.appendChild(actions);
    return cell;
}

function renderTable(contacts: ContactDto[]): void {
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    for (const contact of contacts) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = contact.name;

        const surnameCell = document.createElement("td");
        surnameCell.textContent = contact.surname;

        const companyCell = document.createElement("td");
        companyCell.textContent = contact.companyDenomination || "-";

        const titleCell = document.createElement("td");
        titleCell.textContent = contact.title || "-";

        const roleCell = document.createElement("td");
        roleCell.textContent = contact.workRole || "-";

        const genderCell = document.createElement("td");
        genderCell.textContent = contact.gender || "-";

        const birthdayCell = document.createElement("td");
        birthdayCell.textContent = toDisplayDate(contact.birthday);

        const noteCell = document.createElement("td");
        const noteWrapper = document.createElement("div");
        noteWrapper.className = "note-cell";
        noteWrapper.textContent = contact.note || "-";
        noteCell.appendChild(noteWrapper);

        const addedCell = document.createElement("td");
        addedCell.textContent = toDisplayDate(contact.dateAdded);

        row.appendChild(nameCell);
        row.appendChild(surnameCell);
        row.appendChild(companyCell);
        row.appendChild(titleCell);
        row.appendChild(roleCell);
        row.appendChild(genderCell);
        row.appendChild(birthdayCell);
        row.appendChild(noteCell);
        row.appendChild(addedCell);
        row.appendChild(buildActionsCell(contact));

        tableBody.appendChild(row);
    }
}

async function loadContacts(): Promise<void> {
    const contacts = await getContact();
    renderTable(contacts);
}

function openAddPanel(): void {
    if (!addPanel || !addButton) {
        return;
    }

    clearError(addError);
    addForm?.reset();
    populateCompanySelect("contact-company");
    showPanel(addPanel, addButton);
}

function setupAddForm(): void {
    if (!addForm || !addPanel || !addButton) {
        return;
    }

    addForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearError(addError);

        try {
            const payload = buildAddPayload();
            await createContact(payload);
            addForm.reset();
            hidePanel(addPanel, addButton);
            await loadContacts();
        } catch (error) {
            showError(addError, getUpsertErrorMessage(error));
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

        if (editingContactId == null) {
            showError(editError, "Contatto non selezionato.");
            return;
        }

        try {
            const payload = buildEditPayload();
            await updateContact(editingContactId, payload);
            hidePanel(editPanel, addButton);
            editingContactId = null;
            await loadContacts();
        } catch (error) {
            showError(editError, getUpsertErrorMessage(error));
        }
    });
}

function setupButtons(): void {
    addButton?.addEventListener("click", openAddPanel);

    addCancelButton?.addEventListener("click", () => {
        if (addPanel && addButton && addForm) {
            hidePanel(addPanel, addButton);
            addForm.reset();
        }
    });

    editCancelButton?.addEventListener("click", () => {
        if (editPanel && addButton) {
            hidePanel(editPanel, addButton);
            editForm?.reset();
            editingContactId = null;
        }
    });
}

async function init(): Promise<void> {
    await addAddressBinding?.initialize();
    await editAddressBinding?.initialize();
    setupPopup();
    await loadCompanyOptions();
    setupButtons();
    setupAddForm();
    setupEditForm();
    await loadContacts();
}

init().catch(async (error: Error) => {
    await showMessagePopup("Errore inizializzazione", `Errore inizializzazione pagina contatti: ${error.message}`);
});