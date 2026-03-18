import {
    createMailAddressType,
    deleteMailAddressType,
    getMailAddressTypes,
    updateMailAddressType
} from "./apiMailAddressType.js";
import { hidePanel, initializeMenuAndTheme, showPanel } from "./common.js";

interface MailAddressType {
    mailAddressTypeId: number;
    description: string;
    priority: number;
}

interface MailAddressTypePayload {
    mailAddressTypeId: number;
    description: string;
    priority: number;
}

interface PopupOptions {
    mode: "message" | "confirm";
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    destructive?: boolean;
}

const tableBody = document.getElementById("email-type-table-body");

const addButton = document.getElementById("add-email-type-btn");
const addPanel = document.getElementById("add-email-type-panel");
const addForm = document.getElementById("add-email-type-form") as HTMLFormElement | null;
const addCancelButton = document.getElementById("cancel-add-email-type");
const addError = document.getElementById("add-email-type-error");

const editPanel = document.getElementById("edit-email-type-panel");
const editForm = document.getElementById("edit-email-type-form") as HTMLFormElement | null;
const editCancelButton = document.getElementById("cancel-edit-email-type");
const editError = document.getElementById("edit-email-type-error");

const popupOverlay = document.getElementById("email-popup-overlay");
const popupTitle = document.getElementById("email-popup-title");
const popupMessage = document.getElementById("email-popup-message");
const popupCancelButton = document.getElementById("email-popup-cancel");
const popupConfirmButton = document.getElementById("email-popup-confirm");

let editingTypeId: number | null = null;
let popupResolver: ((value: boolean) => void) | null = null;
let popupMode: "message" | "confirm" | null = null;
let allMailAddressTypes: MailAddressType[] = [];
let typeDescriptionFilter = "";
let typeSortField: "priority" | "description" | "id" = "priority";
let typeSortDirection: "asc" | "desc" = "asc";

let typeDescriptionFilterInput: HTMLInputElement | null = null;
let typeSortFieldSelect: HTMLSelectElement | null = null;
let typeSortDirectionButton: HTMLButtonElement | null = null;

function elementValue(id: string): string {
    const element = document.getElementById(id) as HTMLInputElement;
    return element?.value.trim() ?? "";
}

function setElementValue(id: string, value: string): void {
    const element = document.getElementById(id) as HTMLInputElement;
    if (element) {
        element.value = value;
    }
}

function clearError(errorElement: HTMLElement | null): void {
    if (!errorElement) {
        return;
    }
    errorElement.textContent = "";
}

function showError(errorElement: HTMLElement | null, message: string): void {
    if (!errorElement) {
        return;
    }
    errorElement.textContent = message;
}

function parsePriority(value: string): number {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 0) {
        throw new Error("Inserisci una priorita valida (numero intero maggiore o uguale a 0).");
    }
    return parsed;
}

function getApiErrorMessage(error: unknown): string {
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

function buildAddPayload(): MailAddressTypePayload {
    return {
        mailAddressTypeId: 0,
        description: elementValue("email-type-description"),
        priority: parsePriority(elementValue("email-type-priority"))
    };
}

function buildEditPayload(): MailAddressTypePayload {
    return {
        mailAddressTypeId: Number(elementValue("edit-email-type-id")) || 0,
        description: elementValue("edit-email-type-description"),
        priority: parsePriority(elementValue("edit-email-type-priority"))
    };
}

function buildActionButton(label: string, className: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
}

function normalizeText(value?: string): string {
    return (value || "").trim().toLowerCase();
}

function compareText(a: string, b: string): number {
    return a.localeCompare(b, "it", { sensitivity: "base" });
}

function typeSortValue(type: MailAddressType, field: "priority" | "description" | "id"): number | string {
    switch (field) {
    case "id":
        return Number(type.mailAddressTypeId ?? 0);
    case "description":
        return normalizeText(type.description ?? "");
    case "priority":
    default:
        return Number(type.priority ?? Number.MAX_SAFE_INTEGER);
    }
}

function updateTypeSortDirectionButton(): void {
    if (!typeSortDirectionButton) {
        return;
    }

    typeSortDirectionButton.textContent = typeSortDirection === "asc" ? "Ordinamento \u2191" : "Ordinamento \u2193";
}

function setupEmailTypeListControls(): void {
    const contentSection = document.querySelector(".content-section");
    const tableWrapper = document.querySelector(".table-wrapper");
    if (!contentSection || !tableWrapper) {
        return;
    }

    const controls = document.createElement("div");
    controls.id = "email-type-list-controls";
    controls.className = "list-controls";

    const descriptionFilter = document.createElement("input");
    descriptionFilter.type = "search";
    descriptionFilter.className = "list-control-input";
    descriptionFilter.id = "email-type-description-filter";
    descriptionFilter.placeholder = "Filtra per descrizione...";
    descriptionFilter.setAttribute("aria-label", "Filtra tipi email per descrizione");

    const sortField = document.createElement("select");
    sortField.className = "list-control-select";
    sortField.id = "email-type-sort-field";
    sortField.setAttribute("aria-label", "Ordina tipi email per");
    sortField.innerHTML = `
        <option value="priority">Priorita \u2191\u2193</option>
        <option value="description">Descrizione \u2191\u2193</option>
        <option value="id">Id \u2191\u2193</option>
    `;

    const sortDirection = document.createElement("button");
    sortDirection.type = "button";
    sortDirection.className = "list-control-button";
    sortDirection.id = "email-type-sort-direction";

    controls.appendChild(descriptionFilter);
    controls.appendChild(sortField);
    controls.appendChild(sortDirection);
    contentSection.insertBefore(controls, tableWrapper);

    typeDescriptionFilterInput = descriptionFilter;
    typeSortFieldSelect = sortField;
    typeSortDirectionButton = sortDirection;

    descriptionFilter.addEventListener("input", () => {
        typeDescriptionFilter = normalizeText(descriptionFilter.value);
        applyEmailTypeFilterAndSort();
    });

    sortField.addEventListener("change", () => {
        typeSortField = sortField.value as "priority" | "description" | "id";
        applyEmailTypeFilterAndSort();
    });

    sortDirection.addEventListener("click", () => {
        typeSortDirection = typeSortDirection === "asc" ? "desc" : "asc";
        updateTypeSortDirectionButton();
        applyEmailTypeFilterAndSort();
    });

    sortField.value = typeSortField;
    updateTypeSortDirectionButton();
}

function applyEmailTypeFilterAndSort(): void {
    const filtered = allMailAddressTypes.filter((type) => normalizeText(type.description ?? "").includes(typeDescriptionFilter));
    const sorted = [...filtered].sort((a, b) => {
        const valueA = typeSortValue(a, typeSortField);
        const valueB = typeSortValue(b, typeSortField);
        let result = 0;

        if (typeof valueA === "number" && typeof valueB === "number") {
            result = valueA - valueB;
        } else {
            result = compareText(String(valueA), String(valueB));
        }

        return typeSortDirection === "asc" ? result : -result;
    });

    renderTable(sorted);
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

function openPopup(options: PopupOptions): Promise<boolean> {
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

function renderTable(types: MailAddressType[]): void {
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
                await showMessagePopup("Errore", `Errore durante eliminazione: ${error instanceof Error ? error.message : "Operazione non completata"}`);
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

async function loadMailAddressTypes(): Promise<void> {
    const types = await getMailAddressTypes();
    allMailAddressTypes = types;
    applyEmailTypeFilterAndSort();
}

function openAddPanel(): void {
    if (!addPanel || !addButton) {
        return;
    }

    clearError(addError);
    addForm?.reset();
    showPanel(addPanel, addButton);
}

function openEditPanel(type: MailAddressType): void {
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

function setupAddForm(): void {
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

function setupEditForm(): void {
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

function setupButtons(): void {
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

async function init(): Promise<void> {
    initializeMenuAndTheme();
    setupPopup();
    setupButtons();
    setupAddForm();
    setupEditForm();
    setupEmailTypeListControls();
    await loadMailAddressTypes();
}

init().catch(async (error) => {
    await showMessagePopup("Errore inizializzazione", `Errore inizializzazione pagina email: ${error instanceof Error ? error.message : "Errore sconosciuto"}`);
});
