import { API_BASE_URL } from "./connectionString.js";
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
    var _a, _b;
    const contentType = (_b = (_a = response.headers.get("content-type")) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : "";
    if (!contentType.includes("application/json")) {
        return [];
    }
    let body = null;
    try {
        body = await response.json();
    }
    catch (_c) {
        return [];
    }
    if (!(body === null || body === void 0 ? void 0 : body.errors)) {
        return [];
    }
    const keys = Object.keys(body.errors);
    return Array.from(new Set(keys.map(mapFieldName)));
}
async function fetchJson(url, init) {
    const response = await fetch(url, Object.assign({ headers: {
            "Content-Type": "application/json"
        } }, init));
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
    var _a, _b, _c, _d;
    return {
        phoneNumberTypeId: Number((_b = (_a = value.phoneNumberTypeId) !== null && _a !== void 0 ? _a : value.mailAddressTypeId) !== null && _b !== void 0 ? _b : 0),
        description: String((_c = value.description) !== null && _c !== void 0 ? _c : ""),
        priority: Number((_d = value.priority) !== null && _d !== void 0 ? _d : 0)
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
