import { createContact, deleteContact, getContact, updateContact } from "./apiContact.js";
import { hidePanel, showPanel } from "./common.js";

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

let popupResolver = null;
let popupMode = null;
let editingContactId = null;

function elementValue(id) {
    const element = document.getElementById(id);
    return element?.value.trim() ?? "";
}

function setElementValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
    }
}

function clearError(errorElement) {
    if (!errorElement) {
        return;
    }
    errorElement.textContent = "";
}

function showError(errorElement, message) {
    if (!errorElement) {
        return;
    }
    errorElement.textContent = message;
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

function closePopup(result) {
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

function openPopup(options) {
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

function getContactErrorMessage(error) {
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

    return error.message || "Operazione non completata.";
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
        dateAdded: new Date().toISOString()
    };
}

function buildEditPayload() {
    return {
        contactId: Number(elementValue("edit-contact-id")) || 0,
        name: elementValue("edit-contact-name"),
        surname: elementValue("edit-contact-surname"),
        title: elementValue("edit-contact-title-input") || undefined,
        workRole: elementValue("edit-contact-work-role") || undefined,
        gender: elementValue("edit-contact-gender") || undefined,
        birthday: toIsoDate(elementValue("edit-contact-birthday")),
        note: elementValue("edit-contact-note") || undefined,
        dateAdded: elementValue("edit-contact-date-added") || new Date().toISOString()
    };
}

function buildActionButton(label, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
}

function renderTable(contacts) {
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    for (const contact of contacts) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = contact.name ?? "-";

        const surnameCell = document.createElement("td");
        surnameCell.textContent = contact.surname ?? "-";

        const titleCell = document.createElement("td");
        titleCell.textContent = contact.title ?? "-";

        const workRoleCell = document.createElement("td");
        workRoleCell.textContent = contact.workRole ?? "-";

        const genderCell = document.createElement("td");
        genderCell.textContent = contact.gender ?? "-";

        const birthdayCell = document.createElement("td");
        birthdayCell.textContent = toDisplayDate(contact.birthday);

        const noteCell = document.createElement("td");
        const noteWrapper = document.createElement("div");
        noteWrapper.className = "contact-note-cell";
        noteWrapper.textContent = contact.note ?? "-";
        noteCell.appendChild(noteWrapper);

        const dateAddedCell = document.createElement("td");
        dateAddedCell.textContent = toDisplayDate(contact.dateAdded);

        const actionsCell = document.createElement("td");
        const actions = document.createElement("div");
        actions.className = "row-actions";

        const editButton = buildActionButton("Modifica", "edit-action-btn", () => {
            openEditPanel(contact);
        });

        const deleteButton = buildActionButton("Elimina", "delete-action-btn", async () => {
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
        actionsCell.appendChild(actions);

        row.appendChild(nameCell);
        row.appendChild(surnameCell);
        row.appendChild(titleCell);
        row.appendChild(workRoleCell);
        row.appendChild(genderCell);
        row.appendChild(birthdayCell);
        row.appendChild(noteCell);
        row.appendChild(dateAddedCell);
        row.appendChild(actionsCell);

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
    addForm?.reset();
    showPanel(addPanel, addButton);
}

function openEditPanel(contact) {
    if (!editPanel || !addButton) {
        return;
    }

    editingContactId = contact.contactId;
    clearError(editError);

    setElementValue("edit-contact-id", String(contact.contactId));
    setElementValue("edit-contact-date-added", contact.dateAdded ?? new Date().toISOString());
    setElementValue("edit-contact-name", contact.name ?? "");
    setElementValue("edit-contact-surname", contact.surname ?? "");
    setElementValue("edit-contact-title-input", contact.title ?? "");
    setElementValue("edit-contact-work-role", contact.workRole ?? "");
    setElementValue("edit-contact-gender", contact.gender ?? "");
    setElementValue("edit-contact-birthday", toDateInputValue(contact.birthday ?? ""));
    setElementValue("edit-contact-note", contact.note ?? "");

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
            const payload = buildAddPayload();
            await createContact(payload);
            addForm.reset();
            hidePanel(addPanel, addButton);
            await loadContacts();
        } catch (error) {
            showError(addError, getContactErrorMessage(error));
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
        } catch (error) {
            showError(editError, getContactErrorMessage(error));
        }
    });
}

function setupButtons() {
    addButton?.addEventListener("click", openAddPanel);

    addCancelButton?.addEventListener("click", () => {
        if (addPanel && addButton && addForm) {
            hidePanel(addPanel, addButton);
            addForm.reset();
            clearError(addError);
        }
    });

    editCancelButton?.addEventListener("click", () => {
        if (editPanel && addButton && editForm) {
            hidePanel(editPanel, addButton);
            editForm.reset();
            clearError(editError);
            editingContactId = null;
        }
    });
}

async function init() {
    setupPopup();
    setupButtons();
    setupAddForm();
    setupEditForm();
    await loadContacts();
}

init().catch(async (error) => {
    await showMessagePopup("Errore inizializzazione", `Errore inizializzazione pagina contatti: ${error.message}`);
});
