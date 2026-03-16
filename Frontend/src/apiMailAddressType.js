export const API_BASE_URL = "https://localhost:7090/api";

const FIELD_LABELS = {
    description: "Descrizione",
    priority: "Priorita"
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

    const keys = Object.keys(body.errors);
    return Array.from(new Set(keys.map(mapFieldName)));
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

async function handleTypeUpsertResponse(response) {
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

export function getMailAddressTypes() {
    return fetchJson(`${API_BASE_URL}/MailAddressType/all`);
}

export function createMailAddressType(payload) {
    return fetch(`${API_BASE_URL}/MailAddressType`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleTypeUpsertResponse);
}

export function updateMailAddressType(typeId, payload) {
    return fetch(`${API_BASE_URL}/MailAddressType/${typeId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleTypeUpsertResponse);
}

export async function deleteMailAddressType(typeId) {
    const response = await fetch(`${API_BASE_URL}/MailAddressType/${typeId}`, {
        method: "DELETE"
    });

    if (response.status === 204) {
        return;
    }

    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
}
