import { hidePanel, initializeMenuAndTheme, showPanel } from "./common.js";
import { createAddressSelectBinding } from "./address.js";
import { getMailAddressTypes } from "./apiMailAddressType.js";
import { getPhoneNumberTypes } from "./apiPhoneNumberType.js";
import { addCategoryToContact, createContact, createContactAndReturn, createContactWithCompany, createContactWithCompanyAndReturn, createMailAddress, createPhoneNumber, deleteContact, deleteMailAddress, deletePhoneNumber, getCategories, getCategoriesByContact, getContact, getContactTypes, getContactWithDetails, removeCategoryFromContact, updateContact, updateMailAddress, updatePhoneNumber } from "./apiContact.js";
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
let categoryOptions = [];
let contactTypeOptions = [];
let mailAddressTypeOptions = [];
let phoneNumberTypeOptions = [];
let editingCategoryIds = [];
let allContacts = [];
let contactNameFilter = "";
let contactSortField = "name";
let contactSortDirection = "asc";
let contactNameFilterInput = null;
let contactSortFieldSelect = null;
let contactSortDirectionButton = null;
const PERSON_NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]{2,60}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PHONE_PREFIX_REGEX = /^\+[0-9]{1,4}$/;
const PHONE_NUMBER_REGEX = /^[0-9]{5,15}$/;
const NATIONALITY_REGEX = /^[A-Za-z]{2}$/;
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
function isValidPersonName(value) {
    return PERSON_NAME_REGEX.test(value.trim());
}
function isValidEmail(value) {
    return EMAIL_REGEX.test(value.trim());
}
function validateBirthday(value) {
    const birthday = (value !== null && value !== void 0 ? value : "").trim();
    if (!birthday) {
        return "Inserisci la data di nascita.";
    }
    const birthDate = new Date(birthday);
    if (Number.isNaN(birthDate.getTime())) {
        return "Data di nascita non valida.";
    }
    const today = new Date();
    const todayAtMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (birthDate > todayAtMidnight) {
        return "La data di nascita non puo essere nel futuro.";
    }
    if (birthDate.getFullYear() < 1900) {
        return "Inserisci una data di nascita realistica (dal 1900 in poi).";
    }
    return null;
}
function validateContactPayload(payload) {
    var _a, _b, _c, _d, _e, _f;
    if (!isValidPersonName((_a = payload.name) !== null && _a !== void 0 ? _a : "")) {
        return "Nome non valido: usa almeno 2 caratteri alfabetici.";
    }
    if (!isValidPersonName((_b = payload.surname) !== null && _b !== void 0 ? _b : "")) {
        return "Cognome non valido: usa almeno 2 caratteri alfabetici.";
    }
    const birthdayError = validateBirthday(payload.birthday);
    if (birthdayError) {
        return birthdayError;
    }
    if (((_c = payload.title) !== null && _c !== void 0 ? _c : "").length > 80) {
        return "Titolo troppo lungo (massimo 80 caratteri).";
    }
    if (((_d = payload.workRole) !== null && _d !== void 0 ? _d : "").length > 120) {
        return "Ruolo troppo lungo (massimo 120 caratteri).";
    }
    if (((_e = payload.gender) !== null && _e !== void 0 ? _e : "").length > 20) {
        return "Genere troppo lungo (massimo 20 caratteri).";
    }
    if (((_f = payload.note) !== null && _f !== void 0 ? _f : "").length > 1000) {
        return "Note troppo lunghe (massimo 1000 caratteri).";
    }
    return null;
}
function validatePhoneFields(prefix, number, nationality) {
    const normalizedNumber = number.trim();
    const normalizedPrefix = prefix.trim();
    const normalizedNationality = nationality.trim();
    if (!PHONE_NUMBER_REGEX.test(normalizedNumber)) {
        return "Numero non valido: inserisci solo cifre (5-15).";
    }
    if (normalizedPrefix && !PHONE_PREFIX_REGEX.test(normalizedPrefix)) {
        return "Prefisso non valido: usa il formato +39.";
    }
    if (!NATIONALITY_REGEX.test(normalizedNationality)) {
        return "Nazionalita non valida: inserisci un codice a 2 lettere (es. IT).";
    }
    return null;
}
function populateCompanySelect(selectId, selectedDenomination = "") {
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
    const normalizedSelected = selectedDenomination.trim().toLowerCase();
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
function getSelectedPositiveNumber(selectId) {
    const rawValue = elementValue(selectId);
    const parsed = Number(rawValue);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
}
function populateSimpleSelect(selectId, options, placeholder, selectedValue = "") {
    const select = document.getElementById(selectId);
    if (!select) {
        return;
    }
    select.innerHTML = "";
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    select.appendChild(placeholderOption);
    for (const option of options) {
        const item = document.createElement("option");
        item.value = option.value;
        item.textContent = option.label;
        select.appendChild(item);
    }
    select.value = selectedValue;
    if (select.value !== selectedValue) {
        select.value = "";
    }
}
function populateContactTypeSelect(selectedTypeDescription = "") {
    const options = contactTypeOptions.map((item) => ({
        value: item.description,
        label: item.description
    }));
    populateSimpleSelect("edit-contact-type-denomination", options, "Seleziona tipo contatto", selectedTypeDescription);
}
function populateCategorySelect(selectedCategoryId) {
    const options = categoryOptions.map((item) => ({
        value: String(item.categoryId),
        label: item.description
    }));
    const selectedValue = selectedCategoryId != null && selectedCategoryId > 0 ? String(selectedCategoryId) : "";
    populateSimpleSelect("edit-contact-category", options, "Seleziona categoria", selectedValue);
}
async function loadCompanyOptions() {
    const companies = await getCompanies();
    companyOptions = companies
        .filter((company) => { var _a; return ((_a = company.denomination) === null || _a === void 0 ? void 0 : _a.trim().length) > 0; })
        .sort((a, b) => a.denomination.localeCompare(b.denomination, "it", { sensitivity: "base" }));
    populateCompanySelect("contact-company");
    populateCompanySelect("edit-contact-company");
}
async function loadContactMetadataOptions() {
    try {
        const [categories, contactTypes] = await Promise.all([
            getCategories(),
            getContactTypes()
        ]);
        categoryOptions = [...categories]
            .filter((item) => { var _a; return ((_a = item.description) === null || _a === void 0 ? void 0 : _a.trim().length) > 0; })
            .sort((a, b) => a.description.localeCompare(b.description, "it", { sensitivity: "base" }));
        contactTypeOptions = [...contactTypes]
            .filter((item) => { var _a; return ((_a = item.description) === null || _a === void 0 ? void 0 : _a.trim().length) > 0; })
            .sort((a, b) => a.description.localeCompare(b.description, "it", { sensitivity: "base" }));
    }
    catch (error) {
        console.error("Errore caricamento categorie/tipi contatto", error);
        categoryOptions = [];
        contactTypeOptions = [];
    }
    populateContactTypeSelect();
    populateCategorySelect(null);
}
async function loadContactChannelTypeOptions() {
    try {
        const [mailTypes, phoneTypes] = await Promise.all([
            getMailAddressTypes(),
            getPhoneNumberTypes()
        ]);
        mailAddressTypeOptions = [...mailTypes]
            .sort((a, b) => a.priority - b.priority || a.description.localeCompare(b.description, "it", { sensitivity: "base" }))
            .map((item) => ({
            id: item.mailAddressTypeId,
            description: item.description,
            priority: item.priority
        }));
        phoneNumberTypeOptions = [...phoneTypes]
            .sort((a, b) => a.priority - b.priority || a.description.localeCompare(b.description, "it", { sensitivity: "base" }))
            .map((item) => ({
            id: item.phoneNumberTypeId,
            description: item.description,
            priority: item.priority
        }));
    }
    catch (error) {
        console.error("Errore caricamento tipi email/telefono", error);
        mailAddressTypeOptions = [];
        phoneNumberTypeOptions = [];
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
function normalizeText(value) {
    return (value || "").trim().toLowerCase();
}
function compareText(a, b) {
    return a.localeCompare(b, "it", { sensitivity: "base" });
}
function contactSortValue(contact, field) {
    switch (field) {
        case "surname":
            return normalizeText(contact.surname);
        case "company":
            return normalizeText(getContactCompanyDenomination(contact));
        case "birthday": {
            const timestamp = new Date(contact.birthday || "").getTime();
            return Number.isNaN(timestamp) ? Number.MIN_SAFE_INTEGER : timestamp;
        }
        case "name":
        default:
            return normalizeText(contact.name);
    }
}
function updateContactSortDirectionButton() {
    if (!contactSortDirectionButton) {
        return;
    }
    contactSortDirectionButton.textContent = contactSortDirection === "asc" ? "Ordinamento \u2191" : "Ordinamento \u2193";
}
function setupContactsListControls() {
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
        contactSortField = sortField.value;
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
function applyContactsFilterAndSort() {
    const filtered = allContacts.filter((contact) => normalizeText(contact.name).includes(contactNameFilter));
    const sorted = [...filtered].sort((a, b) => {
        const valueA = contactSortValue(a, contactSortField);
        const valueB = contactSortValue(b, contactSortField);
        let result = 0;
        if (typeof valueA === "number" && typeof valueB === "number") {
            result = valueA - valueB;
        }
        else {
            result = compareText(String(valueA), String(valueB));
        }
        return contactSortDirection === "asc" ? result : -result;
    });
    renderTable(sorted);
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
        typeDenomination: elementValue("edit-contact-type-denomination") || undefined,
        gender: elementValue("edit-contact-gender") || undefined,
        birthday: toIsoDate(elementValue("edit-contact-birthday")),
        note: elementValue("edit-contact-note") || undefined,
    };
}
function getContactCompanyDenomination(contact) {
    var _a, _b, _c, _d, _e, _f;
    if (((_a = contact.companyDenomination) !== null && _a !== void 0 ? _a : "").trim()) {
        return (_b = contact.companyDenomination) !== null && _b !== void 0 ? _b : "";
    }
    if (((_c = contact.companydenomination) !== null && _c !== void 0 ? _c : "").trim()) {
        return (_d = contact.companydenomination) !== null && _d !== void 0 ? _d : "";
    }
    if ("company" in contact) {
        const detailCompany = contact.company;
        if (((_e = detailCompany === null || detailCompany === void 0 ? void 0 : detailCompany.denomination) !== null && _e !== void 0 ? _e : "").trim()) {
            return (_f = detailCompany === null || detailCompany === void 0 ? void 0 : detailCompany.denomination) !== null && _f !== void 0 ? _f : "";
        }
    }
    return "";
}
function fillEditForm(contact) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    setElementValue("edit-contact-id", String(contact.contactId));
    setElementValue("edit-contact-name", contact.name);
    setElementValue("edit-contact-surname", contact.surname);
    populateCompanySelect("edit-contact-company", getContactCompanyDenomination(contact));
    setElementValue("edit-contact-title-input", (_a = contact.title) !== null && _a !== void 0 ? _a : "");
    setElementValue("edit-contact-work-role", (_b = contact.workRole) !== null && _b !== void 0 ? _b : "");
    const selectedTypeDescription = ((_e = (_d = (_c = contact.contactType) === null || _c === void 0 ? void 0 : _c.description) !== null && _d !== void 0 ? _d : contact.typeDenomination) !== null && _e !== void 0 ? _e : "").trim();
    populateContactTypeSelect(selectedTypeDescription);
    populateCategorySelect((_f = editingCategoryIds[0]) !== null && _f !== void 0 ? _f : null);
    setElementValue("edit-contact-gender", (_g = contact.gender) !== null && _g !== void 0 ? _g : "");
    setElementValue("edit-contact-birthday", toDateInputValue((_h = contact.birthday) !== null && _h !== void 0 ? _h : ""));
    setElementValue("edit-contact-note", (_j = contact.note) !== null && _j !== void 0 ? _j : "");
}
async function syncContactCategorySelection(contactId) {
    const selectedCategoryId = getSelectedPositiveNumber("edit-contact-category");
    const previousCategoryIds = [...editingCategoryIds];
    const categoryIdsToRemove = selectedCategoryId == null
        ? previousCategoryIds
        : previousCategoryIds.filter((id) => id !== selectedCategoryId);
    for (const categoryId of categoryIdsToRemove) {
        await removeCategoryFromContact(contactId, categoryId);
    }
    if (selectedCategoryId != null && !previousCategoryIds.includes(selectedCategoryId)) {
        await addCategoryToContact(contactId, selectedCategoryId);
    }
    editingCategoryIds = selectedCategoryId == null ? [] : [selectedCategoryId];
}
async function applySelectedCategoryToContact(contactId) {
    const selectedCategoryId = getSelectedPositiveNumber("edit-contact-category");
    if (selectedCategoryId == null) {
        return;
    }
    await addCategoryToContact(contactId, selectedCategoryId);
}
async function copyChannelsToContact(contactId) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const sourceMails = (_a = editingContactDetails === null || editingContactDetails === void 0 ? void 0 : editingContactDetails.mailAddresses) !== null && _a !== void 0 ? _a : [];
    for (const item of sourceMails) {
        const normalizedMail = ((_b = item.mail) !== null && _b !== void 0 ? _b : "").trim();
        if (!normalizedMail) {
            continue;
        }
        await createMailAddress({
            mailAddressId: 0,
            mail: normalizedMail,
            mailAddressTypeId: (_c = item.mailAddressTypeId) !== null && _c !== void 0 ? _c : (_d = item.mailAddressType) === null || _d === void 0 ? void 0 : _d.mailAddressTypeId,
            contactId
        });
    }
    const sourcePhones = (_e = editingContactDetails === null || editingContactDetails === void 0 ? void 0 : editingContactDetails.phoneNumbers) !== null && _e !== void 0 ? _e : [];
    for (const item of sourcePhones) {
        const normalizedNumber = ((_f = item.number) !== null && _f !== void 0 ? _f : "").trim();
        if (!normalizedNumber) {
            continue;
        }
        await createPhoneNumber({
            phoneNumberId: 0,
            number: normalizedNumber,
            prefix: item.prefix,
            nationality: item.nationality,
            phoneNumberTypeId: (_g = item.phoneNumberTypeId) !== null && _g !== void 0 ? _g : (_h = item.phoneNumberType) === null || _h === void 0 ? void 0 : _h.phoneNumberTypeId,
            contactId
        });
    }
}
async function migrateContactToSelectedCompany(sourceContactId, selectedCompanyId, payload) {
    const createdContact = selectedCompanyId == null
        ? await createContactAndReturn(payload)
        : await createContactWithCompanyAndReturn(selectedCompanyId, payload);
    await copyChannelsToContact(createdContact.contactId);
    await applySelectedCategoryToContact(createdContact.contactId);
    await deleteContact(sourceContactId);
}
function ensureSubitemsPlaceholder(container, message) {
    if (!container) {
        return;
    }
    const hasRows = container.querySelector(".contact-subitem-row") != null;
    const emptyElement = container.querySelector(".contact-subitems-empty");
    if (hasRows) {
        emptyElement === null || emptyElement === void 0 ? void 0 : emptyElement.remove();
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
function createTypeSelect(options, placeholder, selectedId) {
    const select = document.createElement("select");
    select.className = "contact-subitem-input contact-subitem-select";
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    select.appendChild(placeholderOption);
    for (const option of options) {
        const item = document.createElement("option");
        item.value = String(option.id);
        item.textContent = option.description;
        select.appendChild(item);
    }
    if (selectedId != null && selectedId > 0) {
        select.value = String(selectedId);
    }
    else {
        select.value = "";
    }
    return select;
}
function parseOptionalTypeId(select) {
    const parsed = Number(select.value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return undefined;
    }
    return parsed;
}
function setEmailRowEditMode(row, isEditing) {
    const inputs = row.querySelectorAll(".contact-subitem-input");
    const editButton = row.querySelector(".contact-email-edit");
    const saveButton = row.querySelector(".contact-email-save");
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
function setPhoneRowEditMode(row, isEditing) {
    const inputs = row.querySelectorAll(".contact-subitem-input");
    const editButton = row.querySelector(".contact-phone-edit");
    const saveButton = row.querySelector(".contact-phone-save");
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
async function refreshEditContactChannels() {
    var _a, _b, _c, _d;
    if (editingContactId == null) {
        return;
    }
    const details = await getContactWithDetails(editingContactId);
    editingContactDetails = Object.assign(Object.assign({}, (editingContactDetails !== null && editingContactDetails !== void 0 ? editingContactDetails : details)), { mailAddresses: (_a = details.mailAddresses) !== null && _a !== void 0 ? _a : [], phoneNumbers: (_b = details.phoneNumbers) !== null && _b !== void 0 ? _b : [] });
    renderMailAddressRows((_c = editingContactDetails.mailAddresses) !== null && _c !== void 0 ? _c : []);
    renderPhoneRows((_d = editingContactDetails.phoneNumbers) !== null && _d !== void 0 ? _d : []);
}
function createEmailRow(item) {
    var _a, _b, _c, _d, _e, _f;
    const row = document.createElement("div");
    row.className = "contact-subitem-row";
    row.dataset.id = String((_a = item.mailAddressId) !== null && _a !== void 0 ? _a : 0);
    const input = document.createElement("input");
    input.type = "email";
    input.className = "contact-subitem-input";
    input.placeholder = "email@esempio.it";
    input.maxLength = 120;
    input.value = (_b = item.mail) !== null && _b !== void 0 ? _b : "";
    const typeSelect = createTypeSelect(mailAddressTypeOptions, "Tipo email", (_e = (_c = item.mailAddressTypeId) !== null && _c !== void 0 ? _c : (_d = item.mailAddressType) === null || _d === void 0 ? void 0 : _d.mailAddressTypeId) !== null && _e !== void 0 ? _e : null);
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
        var _a, _b;
        clearError(editError);
        if (editingContactId == null) {
            showError(editError, "Contatto non selezionato.");
            return;
        }
        const mail = input.value.trim();
        if (!isValidEmail(mail)) {
            showError(editError, "Inserisci una email valida (es. nome@dominio.it). ");
            return;
        }
        try {
            const mailAddressId = Number((_a = row.dataset.id) !== null && _a !== void 0 ? _a : "0");
            const mailAddressTypeId = parseOptionalTypeId(typeSelect);
            if (mailAddressId > 0) {
                await updateMailAddress(mailAddressId, {
                    mailAddressId,
                    mail,
                    mailAddressTypeId,
                    contactId: editingContactId
                });
                const list = (_b = editingContactDetails === null || editingContactDetails === void 0 ? void 0 : editingContactDetails.mailAddresses) !== null && _b !== void 0 ? _b : [];
                const current = list.find((entry) => entry.mailAddressId === mailAddressId);
                if (current) {
                    current.mail = mail;
                    current.mailAddressTypeId = mailAddressTypeId;
                }
                setEmailRowEditMode(row, false);
                return;
            }
            await createMailAddress({
                mailAddressId: 0,
                mail,
                mailAddressTypeId,
                contactId: editingContactId
            });
            await refreshEditContactChannels();
        }
        catch (error) {
            showError(editError, getUpsertErrorMessage(error));
        }
    });
    removeButton.addEventListener("click", async () => {
        var _a;
        clearError(editError);
        const mailAddressId = Number((_a = row.dataset.id) !== null && _a !== void 0 ? _a : "0");
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
        }
        catch (error) {
            showError(editError, getUpsertErrorMessage(error));
        }
    });
    row.appendChild(input);
    row.appendChild(typeSelect);
    actions.appendChild(editButton);
    actions.appendChild(saveButton);
    actions.appendChild(removeButton);
    row.appendChild(actions);
    setEmailRowEditMode(row, ((_f = item.mailAddressId) !== null && _f !== void 0 ? _f : 0) <= 0);
    return row;
}
function createPhoneRow(item) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const row = document.createElement("div");
    row.className = "contact-subitem-row contact-phone-row";
    row.dataset.id = String((_a = item.phoneNumberId) !== null && _a !== void 0 ? _a : 0);
    const prefixInput = document.createElement("input");
    prefixInput.type = "text";
    prefixInput.className = "contact-subitem-input contact-phone-prefix";
    prefixInput.placeholder = "+39";
    prefixInput.maxLength = 5;
    prefixInput.value = (_b = item.prefix) !== null && _b !== void 0 ? _b : "";
    const numberInput = document.createElement("input");
    numberInput.type = "text";
    numberInput.className = "contact-subitem-input contact-phone-number";
    numberInput.placeholder = "3331234567";
    numberInput.maxLength = 15;
    numberInput.value = (_c = item.number) !== null && _c !== void 0 ? _c : "";
    const nationalityInput = document.createElement("input");
    nationalityInput.type = "text";
    nationalityInput.className = "contact-subitem-input contact-phone-nationality";
    nationalityInput.placeholder = "IT";
    nationalityInput.maxLength = 2;
    nationalityInput.value = (_d = item.nationality) !== null && _d !== void 0 ? _d : "IT";
    const typeSelect = createTypeSelect(phoneNumberTypeOptions, "Tipo numero", (_g = (_e = item.phoneNumberTypeId) !== null && _e !== void 0 ? _e : (_f = item.phoneNumberType) === null || _f === void 0 ? void 0 : _f.phoneNumberTypeId) !== null && _g !== void 0 ? _g : null);
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
        var _a, _b;
        clearError(editError);
        if (editingContactId == null) {
            showError(editError, "Contatto non selezionato.");
            return;
        }
        const number = numberInput.value.trim();
        const nationality = (nationalityInput.value.trim() || "IT").toUpperCase();
        const prefix = prefixInput.value.trim() || undefined;
        const phoneError = validatePhoneFields(prefix !== null && prefix !== void 0 ? prefix : "", number, nationality);
        if (phoneError) {
            showError(editError, phoneError);
            return;
        }
        nationalityInput.value = nationality;
        try {
            const phoneNumberId = Number((_a = row.dataset.id) !== null && _a !== void 0 ? _a : "0");
            const phoneNumberTypeId = parseOptionalTypeId(typeSelect);
            if (phoneNumberId > 0) {
                await updatePhoneNumber(phoneNumberId, {
                    phoneNumberId,
                    number,
                    prefix,
                    nationality,
                    phoneNumberTypeId,
                    contactId: editingContactId
                });
                const list = (_b = editingContactDetails === null || editingContactDetails === void 0 ? void 0 : editingContactDetails.phoneNumbers) !== null && _b !== void 0 ? _b : [];
                const current = list.find((entry) => entry.phoneNumberId === phoneNumberId);
                if (current) {
                    current.number = number;
                    current.prefix = prefix;
                    current.nationality = nationality;
                    current.phoneNumberTypeId = phoneNumberTypeId;
                }
                setPhoneRowEditMode(row, false);
                return;
            }
            await createPhoneNumber({
                phoneNumberId: 0,
                number,
                prefix,
                nationality,
                phoneNumberTypeId,
                contactId: editingContactId
            });
            await refreshEditContactChannels();
        }
        catch (error) {
            showError(editError, getUpsertErrorMessage(error));
        }
    });
    removeButton.addEventListener("click", async () => {
        var _a;
        clearError(editError);
        const phoneNumberId = Number((_a = row.dataset.id) !== null && _a !== void 0 ? _a : "0");
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
        }
        catch (error) {
            showError(editError, getUpsertErrorMessage(error));
        }
    });
    row.appendChild(typeSelect);
    row.appendChild(prefixInput);
    row.appendChild(numberInput);
    row.appendChild(nationalityInput);
    actions.appendChild(editButton);
    actions.appendChild(saveButton);
    actions.appendChild(removeButton);
    row.appendChild(actions);
    setPhoneRowEditMode(row, ((_h = item.phoneNumberId) !== null && _h !== void 0 ? _h : 0) <= 0);
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
    ensureSubitemsPlaceholder(emailListContainer, "Nessuna email presente.");
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
    ensureSubitemsPlaceholder(phoneListContainer, "Nessun numero presente.");
}
async function openEditPanel(contact) {
    var _a, _b, _c;
    if (!editPanel || !addButton) {
        return;
    }
    editingContactId = contact.contactId;
    editingCategoryIds = [];
    clearError(editError);
    fillEditForm(contact);
    renderMailAddressRows([]);
    renderPhoneRows([]);
    try {
        const [details, groupCategories] = await Promise.all([
            getContactWithDetails(contact.contactId),
            getCategoriesByContact(contact.contactId)
        ]);
        editingCategoryIds = ((_a = groupCategories.categories) !== null && _a !== void 0 ? _a : [])
            .map((item) => item.categoryId)
            .filter((id) => Number.isInteger(id) && id > 0);
        editingContactDetails = details;
        fillEditForm(details);
        renderMailAddressRows((_b = details.mailAddresses) !== null && _b !== void 0 ? _b : []);
        renderPhoneRows((_c = details.phoneNumbers) !== null && _c !== void 0 ? _c : []);
        showPanel(editPanel, addButton);
    }
    catch (error) {
        editingContactDetails = null;
        editingContactId = null;
        editingCategoryIds = [];
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
    var _a;
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
        companyCell.textContent = getContactCompanyDenomination(contact) || "-";
        const titleCell = document.createElement("td");
        titleCell.textContent = contact.title || "-";
        const roleCell = document.createElement("td");
        roleCell.textContent = contact.workRole || "-";
        const genderCell = document.createElement("td");
        genderCell.textContent = contact.gender || "-";
        const birthdayCell = document.createElement("td");
        birthdayCell.textContent = toDisplayDate((_a = contact.birthday) !== null && _a !== void 0 ? _a : "");
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
    allContacts = contacts;
    applyContactsFilterAndSort();
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
            const validationError = validateContactPayload(payload);
            if (validationError) {
                showError(addError, validationError);
                return;
            }
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
        var _a, _b;
        event.preventDefault();
        clearError(editError);
        if (editingContactId == null) {
            showError(editError, "Contatto non selezionato.");
            return;
        }
        try {
            const payload = buildEditPayload();
            const validationError = validateContactPayload(payload);
            if (validationError) {
                showError(editError, validationError);
                return;
            }
            const selectedCompanyId = getSelectedCompanyId("edit-contact-company");
            const selectedCompanyName = selectedCompanyId == null
                ? ""
                : ((_b = (_a = companyOptions.find((company) => company.companyId === selectedCompanyId)) === null || _a === void 0 ? void 0 : _a.denomination) !== null && _b !== void 0 ? _b : "").trim().toLowerCase();
            const currentCompanyName = editingContactDetails == null
                ? ""
                : getContactCompanyDenomination(editingContactDetails).trim().toLowerCase();
            if (selectedCompanyName !== currentCompanyName) {
                await migrateContactToSelectedCompany(editingContactId, selectedCompanyId, payload);
            }
            else {
                await updateContact(editingContactId, payload);
                await syncContactCategorySelection(editingContactId);
            }
            hidePanel(editPanel, addButton);
            editingContactId = null;
            editingContactDetails = null;
            editingCategoryIds = [];
            await loadContacts();
        }
        catch (error) {
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
        const row = createEmailRow({
            mailAddressId: 0,
            mail: ""
        });
        emailListContainer.appendChild(row);
        ensureSubitemsPlaceholder(emailListContainer, "Nessuna email presente.");
    });
    addPhoneButton === null || addPhoneButton === void 0 ? void 0 : addPhoneButton.addEventListener("click", () => {
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
            editingCategoryIds = [];
        }
    });
}
async function init() {
    initializeMenuAndTheme();
    await (addAddressBinding === null || addAddressBinding === void 0 ? void 0 : addAddressBinding.initialize());
    await (editAddressBinding === null || editAddressBinding === void 0 ? void 0 : editAddressBinding.initialize());
    setupPopup();
    await loadContactChannelTypeOptions();
    await loadContactMetadataOptions();
    await loadCompanyOptions();
    setupButtons();
    setupAddForm();
    setupEditForm();
    setupEditSubitemButtons();
    setupContactsListControls();
    await loadContacts();
}
init().catch(async (error) => {
    await showMessagePopup("Errore inizializzazione", `Errore inizializzazione pagina contatti: ${error.message}`);
});
