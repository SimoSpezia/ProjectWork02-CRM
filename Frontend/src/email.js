import {
    createMailAddressType,
    deleteMailAddressType,
    getMailAddressTypes,
    updateMailAddressType
} from "./apiMailAddressType.js";
import { hidePanel, initializeMenuAndTheme, showPanel } from "./common.js";

const tableBody = document.getElementById("email-type-table-body");

const addButton = document.getElementById("add-email-type-btn");
const addPanel = document.getElementById("add-email-type-panel");
const addForm = document.getElementById("add-email-type-form");
const addCancelButton = document.getElementById("cancel-add-email-type");
const addError = document.getElementById("add-email-type-error");

const editPanel = document.getElementById("edit-email-type-panel");
const editForm = document.getElementById("edit-email-type-form");
const editCancelButton = document.getElementById("cancel-edit-email-type");
const editError = document.getElementById("edit-email-type-error");

const popupOverlay = document.getElementById("email-popup-overlay");
const popupTitle = document.getElementById("email-popup-title");
const popupMessage = document.getElementById("email-popup-message");
const popupCancelButton = document.getElementById("email-popup-cancel");
const popupConfirmButton = document.getElementById("email-popup-confirm");

let editingTypeId = null;
let popupResolver = null;
let popupMode = null;

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

function parsePriority(value) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
        throw new Error("Inserisci una priorita valida (numero intero maggiore o uguale a 0).");
    }
    return parsed;
}

function getApiErrorMessage(error) {
    if (!(error instanceof Error)) {
        return "Operazione non completata.";
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
        mailAddressTypeId: 0,
        description: elementValue("email-type-description"),
        priority: parsePriority(elementValue("email-type-priority"))
    };
}

function buildEditPayload() {
    return {
        mailAddressTypeId: Number(elementValue("edit-email-type-id")) || 0,
        description: elementValue("edit-email-type-description"),
        priority: parsePriority(elementValue("edit-email-type-priority"))
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

function renderTable(types) {
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    for (const type of types) {
        const row = document.createElement("tr");

        const idCell = document.createElement("td");
        idCell.textContent = String(type.mailAddressTypeId ?? "-");

        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = type.description ?? "-";

        const priorityCell = document.createElement("td");
        priorityCell.textContent = String(type.priority ?? "-");

        const actionsCell = document.createElement("td");
        const actions = document.createElement("div");
        actions.className = "row-actions";

        const editButton = buildActionButton("Modifica", "edit-action-btn", () => {
            openEditPanel(type);
        });

        const deleteButton = buildActionButton("Elimina", "delete-action-btn", async () => {
            const confirmed = await openPopup({
                mode: "confirm",
                title: "Conferma eliminazione",
                message: `Vuoi eliminare il tipo email \"${type.description ?? ""}\"?`,
                confirmText: "Elimina",
                cancelText: "Annulla",
                destructive: true
            });

            if (!confirmed) {
                return;
            }

            try {
                await deleteMailAddressType(type.mailAddressTypeId);
                await loadMailAddressTypes();
            } catch (error) {
                await showMessagePopup("Errore", `Errore durante eliminazione: ${error.message}`);
            }
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        actionsCell.appendChild(actions);

        row.appendChild(idCell);
        row.appendChild(descriptionCell);
        row.appendChild(priorityCell);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
    }
}

async function loadMailAddressTypes() {
    const types = await getMailAddressTypes();
    const ordered = [...types].sort((a, b) => {
        const priorityA = Number(a.priority ?? Number.MAX_SAFE_INTEGER);
        const priorityB = Number(b.priority ?? Number.MAX_SAFE_INTEGER);
        return priorityA - priorityB;
    });

    renderTable(ordered);
}

function openAddPanel() {
    if (!addPanel || !addButton) {
        return;
    }

    clearError(addError);
    addForm?.reset();
    showPanel(addPanel, addButton);
}

function openEditPanel(type) {
    if (!editPanel || !addButton) {
        return;
    }

    editingTypeId = type.mailAddressTypeId;
    clearError(editError);

    setElementValue("edit-email-type-id", String(type.mailAddressTypeId));
    setElementValue("edit-email-type-description", type.description ?? "");
    setElementValue("edit-email-type-priority", String(type.priority ?? 0));

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
            await createMailAddressType(payload);
            addForm.reset();
            hidePanel(addPanel, addButton);
            await loadMailAddressTypes();
        } catch (error) {
            showError(addError, getApiErrorMessage(error));
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

        if (editingTypeId == null) {
            showError(editError, "Tipo email non selezionato.");
            return;
        }

        try {
            const payload = buildEditPayload();
            await updateMailAddressType(editingTypeId, payload);
            hidePanel(editPanel, addButton);
            editingTypeId = null;
            await loadMailAddressTypes();
        } catch (error) {
            showError(editError, getApiErrorMessage(error));
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
            editingTypeId = null;
        }
    });
}

async function init() {
    initializeMenuAndTheme();
    setupPopup();
    setupButtons();
    setupAddForm();
    setupEditForm();
    await loadMailAddressTypes();
}

init().catch(async (error) => {
    await showMessagePopup("Errore inizializzazione", `Errore inizializzazione pagina email: ${error.message}`);
});
