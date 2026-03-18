import { hidePanel, initializeMenuAndTheme, showPanel } from "./common.js";
import { createAddressSelectBinding } from "./address.js";
import {
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

const emailListContainer = document.getElementById("edit-contact-emails-list");
const addEmailButton = document.getElementById("edit-contact-email-add-btn");
const phoneListContainer = document.getElementById("edit-contact-phones-list");
const addPhoneButton = document.getElementById("edit-contact-phone-add-btn");

const popupOverlay = document.getElementById("company-popup-overlay");
const popupTitle = document.getElementById("company-popup-title");
const popupMessage = document.getElementById("company-popup-message");
const popupCancelButton = document.getElementById("company-popup-cancel");
const popupConfirmButton = document.getElementById("company-popup-confirm");

let editingContactId = null;
let editingContactDetails = null;
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

    for (const company of companyOptions) {
        const option = document.createElement("option");
        option.value = String(company.companyId);
        option.textContent = company.denomination;
        select.appendChild(option);
    }

    const normalizedSelected = selectedValue.trim().toLowerCase();
    if (normalizedSelected) {
        const selectedCompany = companyOptions.find((company) => company.denomination.trim().toLowerCase() === normalizedSelected);
        if (selectedCompany) {
            select.value = String(selectedCompany.companyId);
            return;
        }

        select.value = "";
        return;
    }

    select.value = "";
}

function getSelectedCompanyId(selectId) {
    const rawValue = elementValue(selectId);
    const parsed = Number(rawValue);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

async function loadCompanyOptions() {
    const companies = await getCompanies();
    companyOptions = companies
        .filter((company) => { var _a; return ((_a = company.denomination) === null || _a === void 0 ? void 0 : _a.trim().length) > 0; })
        .sort((a, b) => a.denomination.localeCompare(b.denomination, "it", { sensitivity: "base" }));

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
    } else {
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
        title: elementValue("contact-title") || undefined,
        workRole: elementValue("contact-work-role") || undefined,
        gender: elementValue("contact-gender") || undefined,
        birthday: toIsoDate(elementValue("contact-birthday")),
        note: elementValue("contact-note") || undefined,
    };
}

function buildEditPayload() {
    return {
        contactId: editingContactId !== null && editingContactId !== void 0 ? editingContactId : undefined,
        name: elementValue("edit-contact-name"),
        surname: elementValue("edit-contact-surname"),
        title: elementValue("edit-contact-title-input") || undefined,
        workRole: elementValue("edit-contact-work-role") || undefined,
        gender: elementValue("edit-contact-gender") || undefined,
        birthday: toIsoDate(elementValue("edit-contact-birthday")),
        note: elementValue("edit-contact-note") || undefined,
    };
}

function fillEditForm(contact) {
    var _a, _b, _c, _d, _e, _f, _g;
    setElementValue("edit-contact-id", String(contact.contactId));
    setElementValue("edit-contact-name", contact.name);
    setElementValue("edit-contact-surname", contact.surname);
    populateCompanySelect("edit-contact-company", (_a = contact.companyDenomination) !== null && _a !== void 0 ? _a : "");
    setElementValue("edit-contact-title-input", (_b = contact.title) !== null && _b !== void 0 ? _b : "");
    setElementValue("edit-contact-work-role", (_c = contact.workRole) !== null && _c !== void 0 ? _c : "");
    setElementValue("edit-contact-gender", (_d = contact.gender) !== null && _d !== void 0 ? _d : "");
    setElementValue("edit-contact-birthday", toDateInputValue((_e = contact.birthday) !== null && _e !== void 0 ? _e : ""));
    setElementValue("edit-contact-note", (_f = contact.note) !== null && _f !== void 0 ? _f : "");
    setElementValue("edit-contact-date-added", (_g = contact.dateAdded) !== null && _g !== void 0 ? _g : "");
}

function createEmailRow(item) {
    var _a;
    const row = document.createElement("div");
    row.className = "contact-subitem-row";
    row.dataset.id = String((_a = item.mailAddressId) !== null && _a !== void 0 ? _a : 0);

    const input = document.createElement("input");
    input.type = "email";
    input.className = "contact-subitem-input";
    input.placeholder = "email@esempio.it";
    input.value = item.mail || "";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "delete-action-btn mini-delete";
    removeButton.textContent = "Elimina";
    removeButton.addEventListener("click", () => {
        row.remove();
    });

    row.appendChild(input);
    row.appendChild(removeButton);
    return row;
}

function createPhoneRow(item) {
    var _a;
    const row = document.createElement("div");
    row.className = "contact-subitem-row contact-phone-row";
    row.dataset.id = String((_a = item.phoneNumberId) !== null && _a !== void 0 ? _a : 0);

    const prefixInput = document.createElement("input");
    prefixInput.type = "text";
    prefixInput.className = "contact-subitem-input contact-phone-prefix";
    prefixInput.placeholder = "+39";
    prefixInput.value = item.prefix || "";

    const numberInput = document.createElement("input");
    numberInput.type = "text";
    numberInput.className = "contact-subitem-input contact-phone-number";
    numberInput.placeholder = "3331234567";
    numberInput.value = item.number || "";

    const nationalityInput = document.createElement("input");
    nationalityInput.type = "text";
    nationalityInput.className = "contact-subitem-input contact-phone-nationality";
    nationalityInput.placeholder = "IT";
    nationalityInput.value = item.nationality || "IT";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "delete-action-btn mini-delete";
    removeButton.textContent = "Elimina";
    removeButton.addEventListener("click", () => {
        row.remove();
    });

    row.appendChild(prefixInput);
    row.appendChild(numberInput);
    row.appendChild(nationalityInput);
    row.appendChild(removeButton);
    return row;
}

function renderMailAddressRows(items) {
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
}

function renderPhoneRows(items) {
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
}

function collectMailAddressRows() {
    if (!emailListContainer) {
        return [];
    }

    const rows = Array.from(emailListContainer.querySelectorAll(".contact-subitem-row"));
    return rows.map((row) => {
        const input = row.querySelector(".contact-subitem-input");
        return {
            mailAddressId: Number(row.dataset.id || "0"),
            mail: (input === null || input === void 0 ? void 0 : input.value.trim()) || ""
        };
    });
}

function collectPhoneRows() {
    if (!phoneListContainer) {
        return [];
    }

    const rows = Array.from(phoneListContainer.querySelectorAll(".contact-subitem-row"));
    return rows.map((row) => {
        var _a, _b, _c;
        return ({
            phoneNumberId: Number(row.dataset.id || "0"),
            prefix: ((_a = row.querySelector(".contact-phone-prefix")) === null || _a === void 0 ? void 0 : _a.value.trim()) || undefined,
            number: ((_b = row.querySelector(".contact-phone-number")) === null || _b === void 0 ? void 0 : _b.value.trim()) || "",
            nationality: ((_c = row.querySelector(".contact-phone-nationality")) === null || _c === void 0 ? void 0 : _c.value.trim()) || "IT"
        });
    });
}

async function syncMailAddresses(contactId) {
    var _a;
    const originalItems = (_a = editingContactDetails === null || editingContactDetails === void 0 ? void 0 : editingContactDetails.mailAddresses) !== null && _a !== void 0 ? _a : [];
    const currentItems = collectMailAddressRows();

    const currentIds = new Set(currentItems.filter((item) => item.mailAddressId > 0).map((item) => item.mailAddressId));
    for (const original of originalItems) {
        if (original.mailAddressId > 0 && !currentIds.has(original.mailAddressId)) {
            await deleteMailAddress(original.mailAddressId);
        }
    }

    for (const item of currentItems) {
        const mail = item.mail.trim();
        if (!mail) {
            if (item.mailAddressId > 0) {
                await deleteMailAddress(item.mailAddressId);
            }
            continue;
        }

        if (item.mailAddressId > 0) {
            const original = originalItems.find((m) => m.mailAddressId === item.mailAddressId);
            if (!original || original.mail !== mail) {
                await updateMailAddress(item.mailAddressId, {
                    mailAddressId: item.mailAddressId,
                    mail,
                    contactId
                });
            }
            continue;
        }

        await createMailAddress({
            mailAddressId: 0,
            mail,
            contactId
        });
    }
}

async function syncPhoneNumbers(contactId) {
    var _a;
    const originalItems = (_a = editingContactDetails === null || editingContactDetails === void 0 ? void 0 : editingContactDetails.phoneNumbers) !== null && _a !== void 0 ? _a : [];
    const currentItems = collectPhoneRows();

    const currentIds = new Set(currentItems.filter((item) => item.phoneNumberId > 0).map((item) => item.phoneNumberId));
    for (const original of originalItems) {
        if (original.phoneNumberId > 0 && !currentIds.has(original.phoneNumberId)) {
            await deletePhoneNumber(original.phoneNumberId);
        }
    }

    for (const item of currentItems) {
        var _a;
        const number = item.number.trim();
        const nationality = (((_a = item.nationality) !== null && _a !== void 0 ? _a : "").trim() || "IT");
        const prefix = (item.prefix || "").trim() || undefined;

        if (!number) {
            if (item.phoneNumberId > 0) {
                await deletePhoneNumber(item.phoneNumberId);
            }
            continue;
        }

        if (item.phoneNumberId > 0) {
            const original = originalItems.find((p) => p.phoneNumberId === item.phoneNumberId);
            const changed = !original
                || original.number !== number
                || (original.prefix || "") !== (prefix || "")
                || (original.nationality || "") !== nationality;

            if (changed) {
                await updatePhoneNumber(item.phoneNumberId, {
                    phoneNumberId: item.phoneNumberId,
                    number,
                    prefix,
                    nationality,
                    contactId
                });
            }
            continue;
        }

        await createPhoneNumber({
            phoneNumberId: 0,
            number,
            prefix,
            nationality,
            contactId
        });
    }
}

async function syncContactChannels() {
    if (editingContactId == null) {
        return;
    }

    await syncMailAddresses(editingContactId);
    await syncPhoneNumbers(editingContactId);
}

async function openEditPanel(contact) {
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
        renderMailAddressRows(details.mailAddresses || []);
        renderPhoneRows(details.phoneNumbers || []);
        showPanel(editPanel, addButton);
    } catch (error) {
        editingContactDetails = null;
        editingContactId = null;
        await showMessagePopup("Errore", `Impossibile caricare i dettagli del contatto: ${error.message}`);
    }
}

function buildActionsCell(contact) {
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
        birthdayCell.textContent = toDisplayDate(contact.birthday || "");

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
            const selectedCompanyId = getSelectedCompanyId("contact-company");

            if (selectedCompanyId != null) {
                await createContactWithCompany(selectedCompanyId, payload);
            }
            else {
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
            const selectedCompanyId = getSelectedCompanyId("edit-contact-company");
            const selectedCompanyName = selectedCompanyId == null
                ? ""
                : ((companyOptions.find((company) => company.companyId === selectedCompanyId) || {}).denomination || "").trim().toLowerCase();
            const currentCompanyName = ((editingContactDetails === null || editingContactDetails === void 0 ? void 0 : editingContactDetails.companyDenomination) || "").trim().toLowerCase();
            if (selectedCompanyName !== currentCompanyName) {
                showError(editError, "Cambio azienda su contatto esistente non supportato da questa API. Crea un nuovo contatto con l'azienda corretta.");
                return;
            }
            await updateContact(editingContactId, payload);
            await syncContactChannels();
            hidePanel(editPanel, addButton);
            editingContactId = null;
            editingContactDetails = null;
            await loadContacts();
        } catch (error) {
            showError(editError, getUpsertErrorMessage(error));
        }
    });
}

function setupEditSubitemButtons() {
    addEmailButton === null || addEmailButton === void 0 ? void 0 : addEmailButton.addEventListener("click", () => {
        if (!emailListContainer) {
            return;
        }

        const emptyElement = emailListContainer.querySelector(".contact-subitems-empty");
        if (emptyElement) {
            emptyElement.remove();
        }

        emailListContainer.appendChild(createEmailRow({
            mailAddressId: 0,
            mail: ""
        }));
    });

    addPhoneButton === null || addPhoneButton === void 0 ? void 0 : addPhoneButton.addEventListener("click", () => {
        if (!phoneListContainer) {
            return;
        }

        const emptyElement = phoneListContainer.querySelector(".contact-subitems-empty");
        if (emptyElement) {
            emptyElement.remove();
        }

        phoneListContainer.appendChild(createPhoneRow({
            phoneNumberId: 0,
            number: "",
            prefix: "+39",
            nationality: "IT"
        }));
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
            renderMailAddressRows([]);
            renderPhoneRows([]);
            editingContactId = null;
            editingContactDetails = null;
        }
    });
}

async function init() {
    await (addAddressBinding === null || addAddressBinding === void 0 ? void 0 : addAddressBinding.initialize());
    await (editAddressBinding === null || editAddressBinding === void 0 ? void 0 : editAddressBinding.initialize());
    initializeMenuAndTheme();
    setupPopup();
    await loadCompanyOptions();
    setupButtons();
    setupAddForm();
    setupEditForm();
    setupEditSubitemButtons();
    await loadContacts();
}

init().catch(async (error) => {
    await showMessagePopup("Errore inizializzazione", `Errore inizializzazione pagina contatti: ${error.message}`);
});
