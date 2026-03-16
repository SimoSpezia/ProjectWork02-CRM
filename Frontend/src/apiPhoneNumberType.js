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

function normalizePhoneNumberType(value) {
    return {
        phoneNumberTypeId: Number(value.phoneNumberTypeId ?? value.mailAddressTypeId ?? 0),
        description: String(value.description ?? ""),
        priority: Number(value.priority ?? 0)
    };
}

function toBackendPayload(payload) {
    return {
        phoneNumberTypeId: payload.phoneNumberTypeId,
        mailAddressTypeId: payload.phoneNumberTypeId,
        description: payload.description,
        priority: payload.priority
    };
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

export async function getPhoneNumberTypes() {
    const raw = await fetchJson(`${API_BASE_URL}/PhoneNumberType/all`);
    return raw.map(normalizePhoneNumberType);
}

export function createPhoneNumberType(payload) {
    return fetch(`${API_BASE_URL}/PhoneNumberType`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(toBackendPayload(payload))
    }).then(handleTypeUpsertResponse);
}

export function updatePhoneNumberType(typeId, payload) {
    return fetch(`${API_BASE_URL}/PhoneNumberType/${typeId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(toBackendPayload(payload))
    }).then(handleTypeUpsertResponse);
}

export async function deletePhoneNumberType(typeId) {
    const response = await fetch(`${API_BASE_URL}/PhoneNumberType/${typeId}`, {
        method: "DELETE"
    });

    if (response.status === 204) {
        return;
    }

    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
}