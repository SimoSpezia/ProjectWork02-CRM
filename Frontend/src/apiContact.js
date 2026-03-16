export const API_BASE_URL = "https://localhost:7090/api";

const FIELD_LABELS = {
    name: "Nome",
    surname: "Cognome",
    title: "Titolo",
    workrole: "Ruolo",
    gender: "Genere",
    birthday: "Data di nascita",
    note: "Note",
    dateadded: "Data inserimento"
};

function normalizeKey(rawKey) {
    return rawKey.trim().toLowerCase().replace(/\[(\d+)\]/g, "");
}

function mapFieldName(rawKey) {
    const key = normalizeKey(rawKey);
    if (FIELD_LABELS[key]) {
        return FIELD_LABELS[key];
    }

    const cleaned = key.replace(/\./g, " ");
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

async function parseMissingFields(response) {
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("application/json")) {
        return [];
    }

    let body = null;
    try {
        body = await response.json();
    } catch {
        return [];
    }

    if (!body?.errors) {
        return [];
    }

    const requiredKeys = [];
    const allKeys = [];

    for (const [key, messages] of Object.entries(body.errors)) {
        allKeys.push(key);
        const hasRequiredMessage = messages.some((message) =>
            /required|obbligatori|obbligatorio/i.test(message)
        );
        if (hasRequiredMessage) {
            requiredKeys.push(key);
        }
    }

    const sourceKeys = requiredKeys.length > 0 ? requiredKeys : allKeys;
    const mapped = sourceKeys.map(mapFieldName);
    return Array.from(new Set(mapped));
}

async function fetchJson(url, init) {
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json"
        },
        ...init
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
        return undefined;
    }

    return response.json();
}

async function handleContactUpsertResponse(response) {
    if (response.ok) {
        return;
    }

    const missingFields = await parseMissingFields(response);
    if (missingFields.length > 0) {
        throw new Error(`MISSING_FIELDS:${missingFields.join("|")}`);
    }

    const errorBody = await response.text();
    throw new Error(errorBody || `HTTP ${response.status}`);
}

export function getContact() {
    return fetchJson(`${API_BASE_URL}/Contact/all`);
}

export function createContact(payload) {
    return fetch(`${API_BASE_URL}/Contact`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}

export function updateContact(contactId, payload) {
    return fetch(`${API_BASE_URL}/Contact/${contactId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}

export async function deleteContact(contactId) {
    const response = await fetch(`${API_BASE_URL}/Contact/${contactId}`, {
        method: "DELETE"
    });

    if (response.status === 204) {
        return;
    }

    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
}
