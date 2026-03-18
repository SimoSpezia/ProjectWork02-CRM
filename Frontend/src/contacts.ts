import { hidePanel, initializeMenuAndTheme, showPanel } from "./common.js";
import { createAddressSelectBinding } from "./address.js";
import {
    ContactDetailsDto,
    ContactDto,
    ContactUpsertPayload,
    MailAddressDto,
    PhoneNumberDto,
    createContact,
    createContactWithCompany,
    createMailAddress,
    createPhoneNumber,
    deleteContact,
    deleteMailAddress,
    deletePhoneNumber,
    getContact,
    getContactWithDetails,
    updateContact,
    updateMailAddress,
    updatePhoneNumber
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

const emailListContainer = document.getElementById("edit-contact-emails-list") as HTMLDivElement | null;
const addEmailButton = document.getElementById("edit-contact-email-add-btn") as HTMLButtonElement | null;
const phoneListContainer = document.getElementById("edit-contact-phones-list") as HTMLDivElement | null;
const addPhoneButton = document.getElementById("edit-contact-phone-add-btn") as HTMLButtonElement | null;

const popupOverlay = document.getElementById("company-popup-overlay") as HTMLDivElement | null;
const popupTitle = document.getElementById("company-popup-title") as HTMLHeadingElement | null;
const popupMessage = document.getElementById("company-popup-message") as HTMLParagraphElement | null;
const popupCancelButton = document.getElementById("company-popup-cancel") as HTMLButtonElement | null;
const popupConfirmButton = document.getElementById("company-popup-confirm") as HTMLButtonElement | null;

let editingContactId: number | null = null;
let editingContactDetails: ContactDetailsDto | null = null;
let popupResolver: ((result: boolean) => void) | null = null;
let popupMode: "confirm" | "message" | null = null;
let companyOptions: CompanySimpleDto[] = [];
let allContacts: ContactDto[] = [];
let contactNameFilter = "";
let contactSortField: "name" | "surname" | "company" | "birthday" = "name";
let contactSortDirection: "asc" | "desc" = "asc";

let contactNameFilterInput: HTMLInputElement | null = null;
let contactSortFieldSelect: HTMLSelectElement | null = null;
let contactSortDirectionButton: HTMLButtonElement | null = null;

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

function populateCompanySelect(selectId: string, selectedDenomination = ""): void {
    const select = document.getElementById(selectId) as HTMLSelectElement | null;
    if (!select) {
        return;
    }

    select.innerHTML = "";

    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = "Seleziona azienda";
    select.appendChild(placeholderOption);

    for (const company of companyOptions) {
        const option = document.createElement("option");
        option.value = String(company.companyId);
        option.textContent = company.denomination;
        select.appendChild(option);
    }

    const normalizedSelected = selectedDenomination.trim().toLowerCase();
    if (normalizedSelected) {
        const selectedCompany = companyOptions.find(
            (company) => company.denomination.trim().toLowerCase() === normalizedSelected
        );
        if (selectedCompany) {
            select.value = String(selectedCompany.companyId);
            return;
        }

        select.value = "";
        return;
    }

    select.value = "";
}

function getSelectedCompanyId(selectId: string): number | null {
    const rawValue = elementValue(selectId);
    const parsed = Number(rawValue);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

async function loadCompanyOptions(): Promise<void> {
    const companies: CompanySimpleDto[] = await getCompanies();
    companyOptions = companies
        .filter((company) => company.denomination?.trim().length > 0)
        .sort((a, b) => a.denomination.localeCompare(b.denomination, "it", { sensitivity: "base" }));

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
        return new Date().toISOString().slice(0, 10);
    }
    return value;
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

function normalizeText(value?: string): string {
    return (value || "").trim().toLowerCase();
}

function compareText(a: string, b: string): number {
    return a.localeCompare(b, "it", { sensitivity: "base" });
}

function contactSortValue(contact: ContactDto, field: "name" | "surname" | "company" | "birthday"): string | number {
    switch (field) {
    case "surname":
        return normalizeText(contact.surname);
    case "company":
        return normalizeText(contact.companyDenomination || "");
    case "birthday": {
        const timestamp = new Date(contact.birthday || "").getTime();
        return Number.isNaN(timestamp) ? Number.MIN_SAFE_INTEGER : timestamp;
    }
    case "name":
    default:
        return normalizeText(contact.name);
    }
}

function updateContactSortDirectionButton(): void {
    if (!contactSortDirectionButton) {
        return;
    }

    contactSortDirectionButton.textContent = contactSortDirection === "asc" ? "Ordinamento \u2191" : "Ordinamento \u2193";
}

function setupContactsListControls(): void {
    const contentSection = document.querySelector(".content-section");
    const tableWrapper = document.querySelector(".table-wrapper");
    if (!contentSection || !tableWrapper) {
        return;
    }

    const controls = document.createElement("div");
    controls.id = "contact-list-controls";
    controls.className = "list-controls";

    const nameFilter = document.createElement("input");
    nameFilter.type = "search";
    nameFilter.className = "list-control-input";
    nameFilter.id = "contact-name-filter";
    nameFilter.placeholder = "Filtra per nome...";
    nameFilter.setAttribute("aria-label", "Filtra contatti per nome");

    const sortField = document.createElement("select");
    sortField.className = "list-control-select";
    sortField.id = "contact-sort-field";
    sortField.setAttribute("aria-label", "Ordina contatti per");
    sortField.innerHTML = `
        <option value="name">Nome \u2191\u2193</option>
        <option value="surname">Cognome \u2191\u2193</option>
        <option value="company">Azienda \u2191\u2193</option>
        <option value="birthday">Data di nascita \u2191\u2193</option>
    `;

    const sortDirection = document.createElement("button");
    sortDirection.type = "button";
    sortDirection.className = "list-control-button";
    sortDirection.id = "contact-sort-direction";

    controls.appendChild(nameFilter);
    controls.appendChild(sortField);
    controls.appendChild(sortDirection);
    contentSection.insertBefore(controls, tableWrapper);

    contactNameFilterInput = nameFilter;
    contactSortFieldSelect = sortField;
    contactSortDirectionButton = sortDirection;

    nameFilter.addEventListener("input", () => {
        contactNameFilter = normalizeText(nameFilter.value);
        applyContactsFilterAndSort();
    });

    sortField.addEventListener("change", () => {
        contactSortField = sortField.value as "name" | "surname" | "company" | "birthday";
        applyContactsFilterAndSort();
    });

    sortDirection.addEventListener("click", () => {
        contactSortDirection = contactSortDirection === "asc" ? "desc" : "asc";
        updateContactSortDirectionButton();
        applyContactsFilterAndSort();
    });

    sortField.value = contactSortField;
    updateContactSortDirectionButton();
}

function applyContactsFilterAndSort(): void {
    const filtered = allContacts.filter((contact) => normalizeText(contact.name).includes(contactNameFilter));
    const sorted = [...filtered].sort((a, b) => {
        const valueA = contactSortValue(a, contactSortField);
        const valueB = contactSortValue(b, contactSortField);
        let result = 0;

        if (typeof valueA === "number" && typeof valueB === "number") {
            result = valueA - valueB;
        } else {
            result = compareText(String(valueA), String(valueB));
        }

        return contactSortDirection === "asc" ? result : -result;
    });

    renderTable(sorted);
}

function buildAddPayload(): ContactUpsertPayload {
    return {
        name: elementValue("contact-name"),
        surname: elementValue("contact-surname"),
        title: elementValue("contact-title") || undefined,
        workRole: elementValue("contact-work-role") || undefined,
        gender: elementValue("contact-gender") || undefined,
        birthday: toIsoDate(elementValue("contact-birthday")),
        note: elementValue("contact-note") || undefined,
    };
}

function buildEditPayload(): ContactUpsertPayload {
    return {
        contactId: editingContactId ?? undefined,
        name: elementValue("edit-contact-name"),
        surname: elementValue("edit-contact-surname"),
        title: elementValue("edit-contact-title-input") || undefined,
        workRole: elementValue("edit-contact-work-role") || undefined,
        gender: elementValue("edit-contact-gender") || undefined,
        birthday: toIsoDate(elementValue("edit-contact-birthday")),
        note: elementValue("edit-contact-note") || undefined,
    };
}

function fillEditForm(contact: ContactDto): void {
    setElementValue("edit-contact-id", String(contact.contactId));
    setElementValue("edit-contact-name", contact.name);
    setElementValue("edit-contact-surname", contact.surname);
    populateCompanySelect("edit-contact-company", contact.companyDenomination ?? "");
    setElementValue("edit-contact-title-input", contact.title ?? "");
    setElementValue("edit-contact-work-role", contact.workRole ?? "");
    setElementValue("edit-contact-gender", contact.gender ?? "");
    setElementValue("edit-contact-birthday", toDateInputValue(contact.birthday ?? ""));
    setElementValue("edit-contact-note", contact.note ?? "");
}

function ensureSubitemsPlaceholder(container: HTMLDivElement | null, message: string): void {
    if (!container) {
        return;
    }

    const hasRows = container.querySelector(".contact-subitem-row") != null;
    const emptyElement = container.querySelector<HTMLParagraphElement>(".contact-subitems-empty");

    if (hasRows) {
        emptyElement?.remove();
        return;
    }

    if (emptyElement) {
        return;
    }

    const empty = document.createElement("p");
    empty.className = "contact-subitems-empty";
    empty.textContent = message;
    container.appendChild(empty);
}

function setEmailRowEditMode(row: HTMLDivElement, isEditing: boolean): void {
    const input = row.querySelector<HTMLInputElement>(".contact-subitem-input");
    const editButton = row.querySelector<HTMLButtonElement>(".contact-email-edit");
    const saveButton = row.querySelector<HTMLButtonElement>(".contact-email-save");

    if (input) {
        input.disabled = !isEditing;
    }

    if (editButton) {
        editButton.disabled = isEditing;
    }

    if (saveButton) {
        saveButton.disabled = !isEditing;
    }
}

function setPhoneRowEditMode(row: HTMLDivElement, isEditing: boolean): void {
    const inputs = row.querySelectorAll<HTMLInputElement>(".contact-subitem-input");
    const editButton = row.querySelector<HTMLButtonElement>(".contact-phone-edit");
    const saveButton = row.querySelector<HTMLButtonElement>(".contact-phone-save");

    for (const input of inputs) {
        input.disabled = !isEditing;
    }

    if (editButton) {
        editButton.disabled = isEditing;
    }

    if (saveButton) {
        saveButton.disabled = !isEditing;
    }
}

async function refreshEditContactChannels(): Promise<void> {
    if (editingContactId == null) {
        return;
    }

    const details = await getContactWithDetails(editingContactId);
    editingContactDetails = {
        ...(editingContactDetails ?? details),
        mailAddresses: details.mailAddresses ?? [],
        phoneNumbers: details.phoneNumbers ?? []
    };

    renderMailAddressRows(editingContactDetails.mailAddresses ?? []);
    renderPhoneRows(editingContactDetails.phoneNumbers ?? []);
}

function createEmailRow(item: MailAddressDto): HTMLDivElement {
    const row = document.createElement("div");
    row.className = "contact-subitem-row";
    row.dataset.id = String(item.mailAddressId ?? 0);

    const input = document.createElement("input");
    input.type = "email";
    input.className = "contact-subitem-input";
    input.placeholder = "email@esempio.it";
    input.value = item.mail ?? "";

    const actions = document.createElement("div");
    actions.className = "contact-subitem-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-action-btn mini-action contact-email-edit";
    editButton.textContent = "Modifica";

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "save-action-btn mini-action contact-email-save";
    saveButton.textContent = "Salva";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "delete-action-btn mini-action mini-delete";
    removeButton.textContent = "Elimina";

    editButton.addEventListener("click", () => {
        clearError(editError);
        setEmailRowEditMode(row, true);
    });

    saveButton.addEventListener("click", async () => {
        clearError(editError);

        if (editingContactId == null) {
            showError(editError, "Contatto non selezionato.");
            return;
        }

        const mail = input.value.trim();
        if (!mail) {
            showError(editError, "Inserisci una email valida prima di salvare.");
            return;
        }

        try {
            const mailAddressId = Number(row.dataset.id ?? "0");
            if (mailAddressId > 0) {
                await updateMailAddress(mailAddressId, {
                    mailAddressId,
                    mail,
                    contactId: editingContactId
                });

                const list = editingContactDetails?.mailAddresses ?? [];
                const current = list.find((entry) => entry.mailAddressId === mailAddressId);
                if (current) {
                    current.mail = mail;
                }
                setEmailRowEditMode(row, false);
                return;
            }

            await createMailAddress({
                mailAddressId: 0,
                mail,
                contactId: editingContactId
            });
            await refreshEditContactChannels();
        } catch (error) {
            showError(editError, getUpsertErrorMessage(error));
        }
    });

    removeButton.addEventListener("click", async () => {
        clearError(editError);

        const mailAddressId = Number(row.dataset.id ?? "0");
        if (mailAddressId <= 0) {
            row.remove();
            ensureSubitemsPlaceholder(emailListContainer, "Nessuna email presente.");
            return;
        }

        const confirmed = await openPopup({
            mode: "confirm",
            title: "Conferma eliminazione",
            message: "Vuoi eliminare questa email?",
            confirmText: "Elimina",
            cancelText: "Annulla",
            destructive: true
        });

        if (!confirmed) {
            return;
        }

        try {
            await deleteMailAddress(mailAddressId);
            await refreshEditContactChannels();
        } catch (error) {
            showError(editError, getUpsertErrorMessage(error));
        }
    });

    row.appendChild(input);
    actions.appendChild(editButton);
    actions.appendChild(saveButton);
    actions.appendChild(removeButton);
    row.appendChild(actions);

    setEmailRowEditMode(row, (item.mailAddressId ?? 0) <= 0);
    return row;
}

function createPhoneRow(item: PhoneNumberDto): HTMLDivElement {
    const row = document.createElement("div");
    row.className = "contact-subitem-row contact-phone-row";
    row.dataset.id = String(item.phoneNumberId ?? 0);

    const prefixInput = document.createElement("input");
    prefixInput.type = "text";
    prefixInput.className = "contact-subitem-input contact-phone-prefix";
    prefixInput.placeholder = "+39";
    prefixInput.value = item.prefix ?? "";

    const numberInput = document.createElement("input");
    numberInput.type = "text";
    numberInput.className = "contact-subitem-input contact-phone-number";
    numberInput.placeholder = "3331234567";
    numberInput.value = item.number ?? "";

    const nationalityInput = document.createElement("input");
    nationalityInput.type = "text";
    nationalityInput.className = "contact-subitem-input contact-phone-nationality";
    nationalityInput.placeholder = "IT";
    nationalityInput.value = item.nationality ?? "IT";

    const actions = document.createElement("div");
    actions.className = "contact-subitem-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-action-btn mini-action contact-phone-edit";
    editButton.textContent = "Modifica";

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "save-action-btn mini-action contact-phone-save";
    saveButton.textContent = "Salva";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "delete-action-btn mini-action mini-delete";
    removeButton.textContent = "Elimina";

    editButton.addEventListener("click", () => {
        clearError(editError);
        setPhoneRowEditMode(row, true);
    });

    saveButton.addEventListener("click", async () => {
        clearError(editError);

        if (editingContactId == null) {
            showError(editError, "Contatto non selezionato.");
            return;
        }

        const number = numberInput.value.trim();
        const nationality = nationalityInput.value.trim() || "IT";
        const prefix = prefixInput.value.trim() || undefined;

        if (!number) {
            showError(editError, "Inserisci un numero di telefono prima di salvare.");
            return;
        }

        try {
            const phoneNumberId = Number(row.dataset.id ?? "0");
            if (phoneNumberId > 0) {
                await updatePhoneNumber(phoneNumberId, {
                    phoneNumberId,
                    number,
                    prefix,
                    nationality,
                    contactId: editingContactId
                });

                const list = editingContactDetails?.phoneNumbers ?? [];
                const current = list.find((entry) => entry.phoneNumberId === phoneNumberId);
                if (current) {
                    current.number = number;
                    current.prefix = prefix;
                    current.nationality = nationality;
                }
                setPhoneRowEditMode(row, false);
                return;
            }

            await createPhoneNumber({
                phoneNumberId: 0,
                number,
                prefix,
                nationality,
                contactId: editingContactId
            });
            await refreshEditContactChannels();
        } catch (error) {
            showError(editError, getUpsertErrorMessage(error));
        }
    });

    removeButton.addEventListener("click", async () => {
        clearError(editError);

        const phoneNumberId = Number(row.dataset.id ?? "0");
        if (phoneNumberId <= 0) {
            row.remove();
            ensureSubitemsPlaceholder(phoneListContainer, "Nessun numero presente.");
            return;
        }

        const confirmed = await openPopup({
            mode: "confirm",
            title: "Conferma eliminazione",
            message: "Vuoi eliminare questo numero di telefono?",
            confirmText: "Elimina",
            cancelText: "Annulla",
            destructive: true
        });

        if (!confirmed) {
            return;
        }

        try {
            await deletePhoneNumber(phoneNumberId);
            await refreshEditContactChannels();
        } catch (error) {
            showError(editError, getUpsertErrorMessage(error));
        }
    });

    row.appendChild(prefixInput);
    row.appendChild(numberInput);
    row.appendChild(nationalityInput);
    actions.appendChild(editButton);
    actions.appendChild(saveButton);
    actions.appendChild(removeButton);
    row.appendChild(actions);

    setPhoneRowEditMode(row, (item.phoneNumberId ?? 0) <= 0);
    return row;
}

function renderMailAddressRows(items: MailAddressDto[]): void {
    if (!emailListContainer) {
        return;
    }

    emailListContainer.innerHTML = "";

    if (items.length === 0) {
        const empty = document.createElement("p");
        empty.className = "contact-subitems-empty";
        empty.textContent = "Nessuna email presente.";
        emailListContainer.appendChild(empty);
        return;
    }

    for (const item of items) {
        emailListContainer.appendChild(createEmailRow(item));
    }

    ensureSubitemsPlaceholder(emailListContainer, "Nessuna email presente.");
}

function renderPhoneRows(items: PhoneNumberDto[]): void {
    if (!phoneListContainer) {
        return;
    }

    phoneListContainer.innerHTML = "";

    if (items.length === 0) {
        const empty = document.createElement("p");
        empty.className = "contact-subitems-empty";
        empty.textContent = "Nessun numero presente.";
        phoneListContainer.appendChild(empty);
        return;
    }

    for (const item of items) {
        phoneListContainer.appendChild(createPhoneRow(item));
    }
    ensureSubitemsPlaceholder(phoneListContainer, "Nessun numero presente.");
}

async function openEditPanel(contact: ContactDto): Promise<void> {
    if (!editPanel || !addButton) {
        return;
    }

    editingContactId = contact.contactId;
    clearError(editError);
    fillEditForm(contact);
    renderMailAddressRows([]);
    renderPhoneRows([]);

    try {
        const details = await getContactWithDetails(contact.contactId);
        editingContactDetails = details;
        fillEditForm(details);
        renderMailAddressRows(details.mailAddresses ?? []);
        renderPhoneRows(details.phoneNumbers ?? []);
        showPanel(editPanel, addButton);
    } catch (error) {
        editingContactDetails = null;
        editingContactId = null;
        await showMessagePopup("Errore", `Impossibile caricare i dettagli del contatto: ${(error as Error).message}`);
    }
}

function buildActionsCell(contact: ContactDto): HTMLTableCellElement {
    const cell = document.createElement("td");
    const actions = document.createElement("div");
    actions.className = "row-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-action-btn";
    editButton.textContent = "Modifica";
    editButton.addEventListener("click", async () => {
        await openEditPanel(contact);
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
        birthdayCell.textContent = toDisplayDate(contact.birthday ?? "");

        const noteCell = document.createElement("td");
        const noteWrapper = document.createElement("div");
        noteWrapper.className = "note-cell";
        noteWrapper.textContent = contact.note || "-";
        noteCell.appendChild(noteWrapper);

        row.appendChild(nameCell);
        row.appendChild(surnameCell);
        row.appendChild(companyCell);
        row.appendChild(titleCell);
        row.appendChild(roleCell);
        row.appendChild(genderCell);
        row.appendChild(birthdayCell);
        row.appendChild(noteCell);
        row.appendChild(buildActionsCell(contact));

        tableBody.appendChild(row);
    }
}

async function loadContacts(): Promise<void> {
    const contacts = await getContact();
    allContacts = contacts;
    applyContactsFilterAndSort();
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
            const selectedCompanyId = getSelectedCompanyId("contact-company");

            if (selectedCompanyId != null) {
                await createContactWithCompany(selectedCompanyId, payload);
            } else {
                await createContact(payload);
            }

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
            const selectedCompanyId = getSelectedCompanyId("edit-contact-company");
            const selectedCompanyName = selectedCompanyId == null
                ? ""
                : (companyOptions.find((company) => company.companyId === selectedCompanyId)?.denomination ?? "").trim().toLowerCase();
            const currentCompanyName = (editingContactDetails?.companyDenomination ?? "").trim().toLowerCase();

            if (selectedCompanyName !== currentCompanyName) {
                showError(editError, "Cambio azienda su contatto esistente non supportato da questa API. Crea un nuovo contatto con l'azienda corretta.");
                return;
            }

            await updateContact(editingContactId, payload);
            hidePanel(editPanel, addButton);
            editingContactId = null;
            editingContactDetails = null;
            await loadContacts();
        } catch (error) {
            showError(editError, getUpsertErrorMessage(error));
        }
    });
}

function setupEditSubitemButtons(): void {
    addEmailButton?.addEventListener("click", () => {
        if (!emailListContainer) {
            return;
        }

        const emptyElement = emailListContainer.querySelector(".contact-subitems-empty");
        if (emptyElement) {
            emptyElement.remove();
        }

        const row = createEmailRow({
            mailAddressId: 0,
            mail: ""
        });
        emailListContainer.appendChild(row);
        ensureSubitemsPlaceholder(emailListContainer, "Nessuna email presente.");
    });

    addPhoneButton?.addEventListener("click", () => {
        if (!phoneListContainer) {
            return;
        }

        const emptyElement = phoneListContainer.querySelector(".contact-subitems-empty");
        if (emptyElement) {
            emptyElement.remove();
        }

        const row = createPhoneRow({
            phoneNumberId: 0,
            number: "",
            prefix: "+39",
            nationality: "IT"
        });
        phoneListContainer.appendChild(row);
        ensureSubitemsPlaceholder(phoneListContainer, "Nessun numero presente.");
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
            renderMailAddressRows([]);
            renderPhoneRows([]);
            editingContactId = null;
            editingContactDetails = null;
        }
    });
}

async function init(): Promise<void> {
    initializeMenuAndTheme();
    await addAddressBinding?.initialize();
    await editAddressBinding?.initialize();
    setupPopup();
    await loadCompanyOptions();
    setupButtons();
    setupAddForm();
    setupEditForm();
    setupEditSubitemButtons();
    setupContactsListControls();
    await loadContacts();
}

init().catch(async (error: Error) => {
    await showMessagePopup("Errore inizializzazione", `Errore inizializzazione pagina contatti: ${error.message}`);
});
