import { hidePanel, initializeMenuAndTheme, showPanel } from "./common.js";
import { createAddressSelectBinding } from "./address.js";
import { getContact, createContact, deleteContact, updateContact } from "./apiContact.js";
import { getCompanies } from "./apiAzienda.js";
const tableBody = document.getElementById("table-contact-body");
const addButton = document.getElementById("add-contact-btn");
const addPanel = document.getElementById("add-contact-panel");
const addForm = document.getElementById("add-contact-form");
const addCancelButton = document.getElementById("cancel-add-contact");
const addError = document.getElementById("add-contact-error");
const editPanel = document.getElementById("edit-contact-panel");
const editForm = document.getElementById("edit-contact-form");
const editCancelButton = document.getElementById("cancel-edit-contact");
const editError = document.getElementById("edit-contact-error");
const popupOverlay = document.getElementById("company-popup-overlay");
const popupTitle = document.getElementById("company-popup-title");
const popupMessage = document.getElementById("company-popup-message");
const popupCancelButton = document.getElementById("company-popup-cancel");
const popupConfirmButton = document.getElementById("company-popup-confirm");
let editingContactId = null;
let popupResolver = null;
let popupMode = null;
let companyOptions = [];
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
function ensureSelectOption(selectId, value) {
    if (!value) {
        return;
    }
    const select = document.getElementById(selectId);
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
function populateCompanySelect(selectId, selectedValue = "") {
    const select = document.getElementById(selectId);
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
async function loadCompanyOptions() {
    const companies = await getCompanies();
    const uniqueNames = new Set(companies
        .map((company) => { var _a, _b; return (_b = (_a = company.denomination) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : ""; })
        .filter((name) => name.length > 0));
    companyOptions = Array.from(uniqueNames).sort((a, b) => a.localeCompare(b, "it", { sensitivity: "base" }));
    populateCompanySelect("contact-company");
    populateCompanySelect("edit-contact-company");
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
function getUpsertErrorMessage(error) {
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
function toIsoDate(value) {
    if (!value) {
        return new Date().toISOString();
    }
    return new Date(`${value}T00:00:00`).toISOString();
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
function toDisplayDate(value) {
    if (!value) {
        return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }
    return date.toLocaleDateString("it-IT");
}
function buildAddPayload() {
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
function buildEditPayload() {
    return {
        contactId: editingContactId !== null && editingContactId !== void 0 ? editingContactId : undefined,
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
function fillEditForm(contact) {
    var _a, _b, _c, _d, _e;
    setElementValue("edit-contact-id", String(contact.contactId));
    setElementValue("edit-contact-date-added", contact.dateAdded);
    setElementValue("edit-contact-name", contact.name);
    setElementValue("edit-contact-surname", contact.surname);
    populateCompanySelect("edit-contact-company", (_a = contact.companyDenomination) !== null && _a !== void 0 ? _a : "");
    setElementValue("edit-contact-title-input", (_b = contact.title) !== null && _b !== void 0 ? _b : "");
    setElementValue("edit-contact-work-role", (_c = contact.workRole) !== null && _c !== void 0 ? _c : "");
    setElementValue("edit-contact-gender", (_d = contact.gender) !== null && _d !== void 0 ? _d : "");
    setElementValue("edit-contact-birthday", toDateInputValue(contact.birthday));
    setElementValue("edit-contact-note", (_e = contact.note) !== null && _e !== void 0 ? _e : "");
}
function buildActionsCell(contact) {
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
function renderTable(contacts) {
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
async function loadContacts() {
    const contacts = await getContact();
    renderTable(contacts);
}
function openAddPanel() {
    if (!addPanel || !addButton) {
        return;
    }
    clearError(addError);
    addForm === null || addForm === void 0 ? void 0 : addForm.reset();
    populateCompanySelect("contact-company");
    showPanel(addPanel, addButton);
}
function setupAddForm() {
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
        }
        catch (error) {
            showError(addError, getUpsertErrorMessage(error));
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
        }
        catch (error) {
            showError(editError, getUpsertErrorMessage(error));
        }
    });
}
function setupButtons() {
    addButton === null || addButton === void 0 ? void 0 : addButton.addEventListener("click", openAddPanel);
    addCancelButton === null || addCancelButton === void 0 ? void 0 : addCancelButton.addEventListener("click", () => {
        if (addPanel && addButton && addForm) {
            hidePanel(addPanel, addButton);
            addForm.reset();
        }
    });
    editCancelButton === null || editCancelButton === void 0 ? void 0 : editCancelButton.addEventListener("click", () => {
        if (editPanel && addButton) {
            hidePanel(editPanel, addButton);
            editForm === null || editForm === void 0 ? void 0 : editForm.reset();
            editingContactId = null;
        }
    });
}
async function init() {
    initializeMenuAndTheme();
    await (addAddressBinding === null || addAddressBinding === void 0 ? void 0 : addAddressBinding.initialize());
    await (editAddressBinding === null || editAddressBinding === void 0 ? void 0 : editAddressBinding.initialize());
    setupPopup();
    await loadCompanyOptions();
    setupButtons();
    setupAddForm();
    setupEditForm();
    await loadContacts();
}
init().catch(async (error) => {
    await showMessagePopup("Errore inizializzazione", `Errore inizializzazione pagina contatti: ${error.message}`);
});
