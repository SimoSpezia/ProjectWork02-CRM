import { createCompany, deleteCompany, getCompanies, getCompanyContacts, updateCompany } from "./apiAzienda.js";
import { createContactWithCompany, deleteContact, updateContact } from "./apiContact.js";
import { createAddressSelectBinding } from "./address.js";
import { hidePanel, initializeMenuAndTheme, showPanel } from "./common.js";
const tableBody = document.getElementById("table-company-body");
const addButton = document.getElementById("add-company-btn");
const addPanel = document.getElementById("add-company-panel");
const addForm = document.getElementById("add-company-form");
const addCancelButton = document.getElementById("cancel-add-company");
const addError = document.getElementById("add-company-error");
const addContactsList = document.getElementById("add-company-contacts-list");
const addContactRowButton = document.getElementById("add-company-contact-row");
const editPanel = document.getElementById("edit-company-panel");
const editForm = document.getElementById("edit-company-form");
const editCancelButton = document.getElementById("cancel-edit-company");
const editError = document.getElementById("edit-company-error");
const editContactsList = document.getElementById("edit-company-contacts-list");
const editContactRowButton = document.getElementById("edit-company-contact-row");
const popupOverlay = document.getElementById("company-popup-overlay");
const popupTitle = document.getElementById("company-popup-title");
const popupMessage = document.getElementById("company-popup-message");
const popupCancelButton = document.getElementById("company-popup-cancel");
const popupConfirmButton = document.getElementById("company-popup-confirm");
let editingCompanyId = null;
let editingCompanySnapshot = null;
let popupResolver = null;
let popupMode = null;
let allCompanies = [];
let companyNameFilter = "";
let companySortField = "denomination";
let companySortDirection = "asc";

let companyNameFilterInput = null;
let companySortFieldSelect = null;
let companySortDirectionButton = null;
const addAddressBinding = createAddressSelectBinding({
    countryId: "company-address-country",
    regionId: "company-address-region",
    provinceId: "company-address-province",
    cityId: "company-address-city"
});
const editAddressBinding = createAddressSelectBinding({
    countryId: "edit-company-address-country",
    regionId: "edit-company-address-region",
    provinceId: "edit-company-address-province",
    cityId: "edit-company-address-city"
});
function elementValue(id) {
    var _a;
    const element = document.getElementById(id);
    return (_a = element === null || element === void 0 ? void 0 : element.value.trim()) !== null && _a !== void 0 ? _a : "";
}
function setElementValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
    }
}
function showError(errorElement, message) {
    if (!errorElement) {
        return;
    }
    errorElement.textContent = message;
}
function clearError(errorElement) {
    if (!errorElement) {
        return;
    }
    errorElement.textContent = "";
}
function closePopup(result) {
    if (!popupOverlay) {
        popupResolver === null || popupResolver === void 0 ? void 0 : popupResolver(result);
        popupResolver = null;
        popupMode = null;
        return;
    }
    popupOverlay.classList.remove("visible");
    window.setTimeout(() => {
        popupOverlay.hidden = true;
    }, 180);
    popupResolver === null || popupResolver === void 0 ? void 0 : popupResolver(result);
    popupResolver = null;
    popupMode = null;
}
function openPopup(options) {
    var _a;
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
        popupCancelButton.textContent = (_a = options.cancelText) !== null && _a !== void 0 ? _a : "Annulla";
    }
    else {
        popupCancelButton.hidden = true;
    }
    popupOverlay.hidden = false;
    window.requestAnimationFrame(() => {
        popupOverlay.classList.add("visible");
    });
    popupConfirmButton.focus();
    return new Promise((resolve) => {
        popupResolver = resolve;
    });
}
async function showMessagePopup(title, message) {
    await openPopup({
        mode: "message",
        title,
        message,
        confirmText: "Chiudi"
    });
}
function getUpsertContactErrorMessage(error) {
    if (!(error instanceof Error)) {
        return "Compila i campi obbligatori del contatto e riprova.";
    }
    if (error.message.startsWith("MISSING_FIELDS:")) {
        const rawFields = error.message.slice("MISSING_FIELDS:".length).trim();
        if (!rawFields) {
            return "Compila i campi obbligatori del contatto e riprova.";
        }
        const fields = rawFields
            .split("|")
            .map((field) => field.trim())
            .filter(Boolean);
        if (fields.length === 0) {
            return "Compila i campi obbligatori del contatto e riprova.";
        }
        return `Campi contatto mancanti: ${fields.join(", ")}.`;
    }
    return error.message;
}
function setupPopup() {
    popupConfirmButton === null || popupConfirmButton === void 0 ? void 0 : popupConfirmButton.addEventListener("click", () => {
        closePopup(true);
    });
    popupCancelButton === null || popupCancelButton === void 0 ? void 0 : popupCancelButton.addEventListener("click", () => {
        closePopup(false);
    });
    popupOverlay === null || popupOverlay === void 0 ? void 0 : popupOverlay.addEventListener("click", (event) => {
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
function getCreateCompanyErrorMessage(error) {
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
function toIsoDate(value) {
    if (!value) {
        return new Date().toISOString().slice(0, 10);
    }
    return value;
}
function toDateInputValue(value) {
    if (!value) {
        return "";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }
    return date.toISOString().slice(0, 10);
}
function readContactFromRow(row) {
    const name = getFieldValue(row, "name");
    const surname = getFieldValue(row, "surname");
    const birthdayRaw = getFieldValue(row, "birthday");
    if (!name && !surname && !birthdayRaw) {
        return null;
    }
    if (!name || !surname || !birthdayRaw) {
        throw new Error("Compila Nome, Cognome e Data di nascita per ogni contatto inserito.");
    }
    return {
        contactId: Number(getFieldValue(row, "contactId")) || 0,
        name,
        surname,
        title: getFieldValue(row, "title") || undefined,
        workRole: getFieldValue(row, "workRole") || undefined,
        gender: getFieldValue(row, "gender") || undefined,
        birthday: toIsoDate(birthdayRaw),
        note: getFieldValue(row, "note") || undefined,
        dateAdded: getFieldValue(row, "dateAdded") || new Date().toISOString()
    };
}
async function loadEditContactRows(companyId) {
    if (!editContactsList) {
        return;
    }
    clearEditContactRows();
    try {
        const contacts = await getCompanyContacts(companyId);
        contacts.forEach((contact) => {
            editContactsList.appendChild(createContactEditorRow(contact));
        });
    }
    catch (_a) {
        editContactsList.innerHTML = "";
    }
}
function createContactEditorRow(contact) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const row = document.createElement("div");
    row.className = "contact-editor-row";
    const id = (_a = contact === null || contact === void 0 ? void 0 : contact.contactId) !== null && _a !== void 0 ? _a : 0;
    const dateAdded = (_b = contact === null || contact === void 0 ? void 0 : contact.dateAdded) !== null && _b !== void 0 ? _b : new Date().toISOString();
    row.innerHTML = `
        <input type="hidden" data-field="contactId" value="${id}">

        <label>Nome</label>
        <input type="text" data-field="name" value="${(_c = contact === null || contact === void 0 ? void 0 : contact.name) !== null && _c !== void 0 ? _c : ""}" required>

        <label>Cognome</label>
        <input type="text" data-field="surname" value="${(_d = contact === null || contact === void 0 ? void 0 : contact.surname) !== null && _d !== void 0 ? _d : ""}" required>

        <label>Titolo</label>
        <input type="text" data-field="title" value="${(_e = contact === null || contact === void 0 ? void 0 : contact.title) !== null && _e !== void 0 ? _e : ""}">

        <label>Ruolo</label>
        <input type="text" data-field="workRole" value="${(_f = contact === null || contact === void 0 ? void 0 : contact.workRole) !== null && _f !== void 0 ? _f : ""}">

        <label>Genere</label>
        <input type="text" data-field="gender" value="${(_g = contact === null || contact === void 0 ? void 0 : contact.gender) !== null && _g !== void 0 ? _g : ""}">

        <label>Data di nascita</label>
        <input type="date" data-field="birthday" value="${toDateInputValue((_h = contact === null || contact === void 0 ? void 0 : contact.birthday) !== null && _h !== void 0 ? _h : "")}" required>

        <label>Note contatto</label>
        <textarea data-field="note" rows="2">${(_j = contact === null || contact === void 0 ? void 0 : contact.note) !== null && _j !== void 0 ? _j : ""}</textarea>

        <button type="button" class="edit-action-btn" data-action="save-contact-row">${id > 0 ? "Aggiorna contatto" : "Salva contatto"}</button>

        <button type="button" class="delete-action-btn" data-action="remove-contact-row">Rimuovi contatto</button>
    `;
    const removeButton = row.querySelector("[data-action='remove-contact-row']");
    removeButton === null || removeButton === void 0 ? void 0 : removeButton.addEventListener("click", () => {
        row.remove();
        if (id > 0) {
            deleteContact(id).catch(async (error) => {
                await showMessagePopup("Errore", `Errore durante rimozione contatto: ${error.message}`);
            });
        }
    });
    const saveButton = row.querySelector("[data-action='save-contact-row']");
    saveButton === null || saveButton === void 0 ? void 0 : saveButton.addEventListener("click", async () => {
        if (editingCompanyId == null) {
            await showMessagePopup("Errore", "Azienda non selezionata.");
            return;
        }
        try {
            const parsedContact = readContactFromRow(row);
            if (!parsedContact) {
                await showMessagePopup("Errore", "Inserisci almeno Nome, Cognome e Data di nascita.");
                return;
            }
            const payload = toContactUpsertPayload(parsedContact);
            if (parsedContact.contactId > 0) {
                await updateContact(parsedContact.contactId, payload);
            }
            else {
                await createContactWithCompany(editingCompanyId, payload);
            }
            await loadEditContactRows(editingCompanyId);
        }
        catch (error) {
            showError(editError, getUpsertContactErrorMessage(error));
        }
    });
    return row;
}
function getFieldValue(row, fieldName) {
    var _a;
    const field = row.querySelector(`[data-field='${fieldName}']`);
    return (_a = field === null || field === void 0 ? void 0 : field.value.trim()) !== null && _a !== void 0 ? _a : "";
}
function readContacts(listElement) {
    if (!listElement) {
        return [];
    }
    const rows = Array.from(listElement.querySelectorAll(".contact-editor-row"));
    const parsed = [];
    for (const row of rows) {
        const parsedContact = readContactFromRow(row);
        if (parsedContact) {
            parsed.push(parsedContact);
        }
    }
    return parsed;
}
function resolveCompanyAddress(company) {
    var _a, _b;
    const source = (_a = company.address) !== null && _a !== void 0 ? _a : null;
    return {
        street: (_b = source === null || source === void 0 ? void 0 : source.street) !== null && _b !== void 0 ? _b : "",
        streetNumber: (source === null || source === void 0 ? void 0 : source.streetNumber) || "",
        zip: (source === null || source === void 0 ? void 0 : source.zip) || "",
        city: (source === null || source === void 0 ? void 0 : source.city) || "",
        province: (source === null || source === void 0 ? void 0 : source.province) || undefined,
        region: (source === null || source === void 0 ? void 0 : source.region) || undefined,
        country: (source === null || source === void 0 ? void 0 : source.country) || ""
    };
}
function mapCompanyToPayload(company) {
    const address = resolveCompanyAddress(company);
    return {
        denomination: company.denomination,
        website: company.website || undefined,
        vatNumber: company.vatNumber,
        size: company.size || undefined,
        note: company.note || undefined,
        address
    };
}
function normalized(value) {
    return (value !== null && value !== void 0 ? value : "").trim();
}

function normalizedLower(value) {
    return normalized(value).toLowerCase();
}

function compareText(a, b) {
    return a.localeCompare(b, "it", { sensitivity: "base" });
}

function companySortValue(company, field) {
    switch (field) {
    case "vatNumber":
        return normalizedLower(company.vatNumber);
    case "size":
        return normalizedLower(company.size || "");
    case "city": {
        const address = resolveCompanyAddress(company);
        return normalizedLower(address.city);
    }
    case "denomination":
    default:
        return normalizedLower(company.denomination);
    }
}

function updateCompanySortDirectionButton() {
    if (!companySortDirectionButton) {
        return;
    }

    companySortDirectionButton.textContent = companySortDirection === "asc" ? "Ordine: crescente" : "Ordine: decrescente";
}

function setupCompanyListControls() {
    const contentSection = document.querySelector(".content-section");
    const tableWrapper = document.querySelector(".table-wrapper");
    if (!contentSection || !tableWrapper) {
        return;
    }

    const controls = document.createElement("div");
    controls.id = "company-list-controls";
    controls.className = "list-controls";

    const nameFilter = document.createElement("input");
    nameFilter.type = "search";
    nameFilter.className = "list-control-input";
    nameFilter.id = "company-name-filter";
    nameFilter.placeholder = "Filtra per nome azienda...";
    nameFilter.setAttribute("aria-label", "Filtra aziende per nome");

    const sortField = document.createElement("select");
    sortField.className = "list-control-select";
    sortField.id = "company-sort-field";
    sortField.setAttribute("aria-label", "Ordina aziende per");
    sortField.innerHTML = `
        <option value="denomination">Ordina per nome azienda</option>
        <option value="vatNumber">Ordina per partita IVA</option>
        <option value="size">Ordina per dimensione</option>
        <option value="city">Ordina per città</option>
    `;

    const sortDirection = document.createElement("button");
    sortDirection.type = "button";
    sortDirection.className = "list-control-button";
    sortDirection.id = "company-sort-direction";

    controls.appendChild(nameFilter);
    controls.appendChild(sortField);
    controls.appendChild(sortDirection);
    contentSection.insertBefore(controls, tableWrapper);

    companyNameFilterInput = nameFilter;
    companySortFieldSelect = sortField;
    companySortDirectionButton = sortDirection;

    nameFilter.addEventListener("input", () => {
        companyNameFilter = normalizedLower(nameFilter.value);
        applyCompanyFilterAndSort();
    });

    sortField.addEventListener("change", () => {
        companySortField = sortField.value;
        applyCompanyFilterAndSort();
    });

    sortDirection.addEventListener("click", () => {
        companySortDirection = companySortDirection === "asc" ? "desc" : "asc";
        updateCompanySortDirectionButton();
        applyCompanyFilterAndSort();
    });

    sortField.value = companySortField;
    updateCompanySortDirectionButton();
}

function applyCompanyFilterAndSort() {
    const filtered = allCompanies.filter((company) => normalizedLower(company.denomination).includes(companyNameFilter));
    const sorted = [...filtered].sort((a, b) => {
        const valueA = companySortValue(a, companySortField);
        const valueB = companySortValue(b, companySortField);
        const result = compareText(String(valueA), String(valueB));
        return companySortDirection === "asc" ? result : -result;
    });

    renderTable(sorted);
}
function hasCompanyChanges(current, original) {
    if (!original) {
        return true;
    }
    return (normalized(current.denomination) !== normalized(original.denomination) ||
        normalized(current.website) !== normalized(original.website) ||
        normalized(current.vatNumber) !== normalized(original.vatNumber) ||
        normalized(current.size) !== normalized(original.size) ||
        normalized(current.note) !== normalized(original.note) ||
        normalized(current.address.street) !== normalized(original.address.street) ||
        normalized(current.address.streetNumber) !== normalized(original.address.streetNumber) ||
        normalized(current.address.zip) !== normalized(original.address.zip) ||
        normalized(current.address.city) !== normalized(original.address.city) ||
        normalized(current.address.province) !== normalized(original.address.province) ||
        normalized(current.address.region) !== normalized(original.address.region) ||
        normalized(current.address.country) !== normalized(original.address.country));
}
function toContactUpsertPayload(contact) {
    return {
        contactId: contact.contactId > 0 ? contact.contactId : undefined,
        name: contact.name,
        surname: contact.surname,
        title: contact.title,
        workRole: contact.workRole,
        gender: contact.gender,
        birthday: contact.birthday,
        note: contact.note
    };
}
async function upsertCompanyContacts(editedContacts, companyId) {
    if (editedContacts.length === 0) {
        return;
    }
    for (const contact of editedContacts) {
        const payload = toContactUpsertPayload(contact);
        if (contact.contactId > 0) {
            await updateContact(contact.contactId, payload);
            continue;
        }
        await createContactWithCompany(companyId, payload);
    }
}
function buildAddCompanyPayload() {
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
        }
    };
}
function buildEditCompanyPayload() {
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
        }
    };
}
function buildAddressCell(company) {
    var _a, _b;
    const address = resolveCompanyAddress(company);
    const cell = document.createElement("td");
    const summary = document.createElement("button");
    summary.type = "button";
    summary.className = "address-toggle";
    summary.textContent = `${address.street} ${address.streetNumber}`.trim() || "-";
    const details = document.createElement("div");
    details.className = "address-details";
    details.hidden = true;
    details.textContent = `${address.street} ${address.streetNumber}, ${address.zip} ${address.city} (${(_a = address.province) !== null && _a !== void 0 ? _a : ""}), ${(_b = address.region) !== null && _b !== void 0 ? _b : ""}, ${address.country}`;
    summary.addEventListener("click", () => {
        details.hidden = !details.hidden;
    });
    cell.appendChild(summary);
    cell.appendChild(details);
    return cell;
}
function buildWebsiteCell(website) {
    const cell = document.createElement("td");
    if (!website) {
        cell.textContent = "-";
        return cell;
    }
    const link = document.createElement("a");
    let linkLabel = website;
    try {
        linkLabel = new URL(website).hostname.replace(/^www\./, "");
    }
    catch (_a) {
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
function buildNoteCell(note) {
    const cell = document.createElement("td");
    const wrapper = document.createElement("div");
    wrapper.className = "note-cell";
    wrapper.textContent = note || "-";
    cell.appendChild(wrapper);
    return cell;
}
function buildActionsCell(company) {
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
        }
        catch (error) {
            await showMessagePopup("Errore", `Errore durante eliminazione: ${error.message}`);
        }
    });
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    cell.appendChild(actions);
    return cell;
}
function renderTable(companies) {
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
async function loadCompanies() {
    const companies = await getCompanies();
    allCompanies = companies;
    applyCompanyFilterAndSort();
}
function clearAddContactRows() {
    if (addContactsList) {
        addContactsList.innerHTML = "";
    }
}
function clearEditContactRows() {
    if (editContactsList) {
        editContactsList.innerHTML = "";
    }
}
function openAddPanel() {
    if (!addPanel || !addButton) {
        return;
    }
    clearError(addError);
    clearAddContactRows();
    addAddressBinding === null || addAddressBinding === void 0 ? void 0 : addAddressBinding.setAddress({
        country: "",
        region: "",
        province: "",
        city: ""
    }).catch((error) => {
        console.error("Errore reset indirizzo (add)", error);
    });
    showPanel(addPanel, addButton);
}
async function openEditPanel(company) {
    var _a, _b, _c;
    if (!editPanel || !addButton) {
        return;
    }
    const address = resolveCompanyAddress(company);
    editingCompanyId = company.companyId;
    editingCompanySnapshot = mapCompanyToPayload(company);
    clearError(editError);
    setElementValue("edit-company-name", company.denomination);
    setElementValue("edit-company-address-street", address.street);
    setElementValue("edit-company-address-streetNumber", address.streetNumber);
    setElementValue("edit-company-address-zip", address.zip);
    await (editAddressBinding === null || editAddressBinding === void 0 ? void 0 : editAddressBinding.setAddress({
        country: address.country,
        region: (_a = address.region) !== null && _a !== void 0 ? _a : "",
        province: (_b = address.province) !== null && _b !== void 0 ? _b : "",
        city: address.city
    }));
    setElementValue("edit-company-partitaIVA", company.vatNumber);
    setElementValue("edit-company-size", (_c = company.size) !== null && _c !== void 0 ? _c : "");
    setElementValue("edit-company-website", company.website !== null && company.website !== void 0 ? company.website : "");
    setElementValue("edit-company-notes", company.note !== null && company.note !== void 0 ? company.note : "");
    await loadEditContactRows(company.companyId);
    showPanel(editPanel, addButton);
}
function setupAddForm() {
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
            await (addAddressBinding === null || addAddressBinding === void 0 ? void 0 : addAddressBinding.setAddress({
                country: "",
                region: "",
                province: "",
                city: ""
            }));
            clearAddContactRows();
            hidePanel(addPanel, addButton);
            await loadCompanies();
        }
        catch (error) {
            showError(addError, getCreateCompanyErrorMessage(error));
        }
    });
}
function setupEditForm() {
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
            const contacts = readContacts(editContactsList);
            if (hasCompanyChanges(payload, editingCompanySnapshot)) {
                try {
                    await updateCompany(editingCompanyId, payload);
                }
                catch (error) {
                    if (!(error instanceof Error) || !error.message.includes("HTTP 422")) {
                        throw error;
                    }
                }
            }
            await upsertCompanyContacts(contacts, editingCompanyId);
            hidePanel(editPanel, addButton);
            editingCompanyId = null;
            editingCompanySnapshot = null;
            await loadCompanies();
        }
        catch (error) {
            const companyMessage = getCreateCompanyErrorMessage(error);
            if (companyMessage !== "Compila i campi obbligatori mancanti e riprova.") {
                showError(editError, companyMessage);
                return;
            }
            showError(editError, getUpsertContactErrorMessage(error));
        }
    });
}
function setupButtons() {
    addButton === null || addButton === void 0 ? void 0 : addButton.addEventListener("click", openAddPanel);
    addCancelButton === null || addCancelButton === void 0 ? void 0 : addCancelButton.addEventListener("click", () => {
        if (addPanel && addButton && addForm) {
            hidePanel(addPanel, addButton);
            addForm.reset();
            addAddressBinding === null || addAddressBinding === void 0 ? void 0 : addAddressBinding.setAddress({
                country: "",
                region: "",
                province: "",
                city: ""
            }).catch((error) => {
                console.error("Errore reset indirizzo (cancel add)", error);
            });
            clearAddContactRows();
        }
    });
    editCancelButton === null || editCancelButton === void 0 ? void 0 : editCancelButton.addEventListener("click", () => {
        if (editPanel && addButton) {
            hidePanel(editPanel, addButton);
            clearEditContactRows();
            editingCompanyId = null;
            editingCompanySnapshot = null;
            editAddressBinding === null || editAddressBinding === void 0 ? void 0 : editAddressBinding.setAddress({
                country: "",
                region: "",
                province: "",
                city: ""
            }).catch((error) => {
                console.error("Errore reset indirizzo (cancel edit)", error);
            });
        }
    });
    addContactRowButton === null || addContactRowButton === void 0 ? void 0 : addContactRowButton.addEventListener("click", () => {
        addContactsList === null || addContactsList === void 0 ? void 0 : addContactsList.appendChild(createContactEditorRow());
    });
    editContactRowButton === null || editContactRowButton === void 0 ? void 0 : editContactRowButton.addEventListener("click", () => {
        editContactsList === null || editContactsList === void 0 ? void 0 : editContactsList.appendChild(createContactEditorRow());
    });
}
async function init() {
    initializeMenuAndTheme();
    await (addAddressBinding === null || addAddressBinding === void 0 ? void 0 : addAddressBinding.initialize());
    await (editAddressBinding === null || editAddressBinding === void 0 ? void 0 : editAddressBinding.initialize());
    setupPopup();
    setupButtons();
    setupAddForm();
    setupEditForm();
    setupCompanyListControls();
    await loadCompanies();
}
init().catch(async (error) => {
    await showMessagePopup("Errore inizializzazione", `Errore inizializzazione pagina aziende: ${error.message}`);
});
