import { API_BASE_URL } from "./connectionString.js";

const FIELD_LABELS = {
    denomination: "Nome Azienda",
    website: "Sito Web",
    vatnumber: "Partita IVA",
    size: "Dimensione",
    note: "Note",
    "address.street": "Via / Piazza",
    "address.streetnumber": "Numero civico",
    "address.zip": "CAP",
    "address.city": "Citta",
    "address.province": "Provincia",
    "address.region": "Regione",
    "address.country": "Nazione"
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
    const requiredKeys = [];
    const allKeys = [];
    for (const [key, messages] of Object.entries(body.errors)) {
        allKeys.push(key);
        const hasRequiredMessage = messages.some((message) => /required|obbligatori|obbligatorio/i.test(message));
        if (hasRequiredMessage) {
            requiredKeys.push(key);
        }
    }
    const sourceKeys = requiredKeys.length > 0 ? requiredKeys : allKeys;
    const mapped = sourceKeys.map(mapFieldName);
    return Array.from(new Set(mapped));
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
export function getCompanies() {
    return fetchJson(`${API_BASE_URL}/Company/all`);
}
export function getCompanyContacts(companyId) {
    return fetch(`${API_BASE_URL}/Company/${companyId}/contact`, {
        headers: {
            "Content-Type": "application/json"
        }
    }).then(async (response) => {
        if (response.status === 204) {
            return [];
        }
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(errorBody || `HTTP ${response.status}`);
        }
        return response.json();
    });
}
export function createCompany(payload) {
    return fetch(`${API_BASE_URL}/Company`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(async (response) => {
        if (response.ok) {
            return;
        }
        const missingFields = await parseMissingFields(response);
        if (missingFields.length > 0) {
            throw new Error(`MISSING_FIELDS:${missingFields.join("|")}`);
        }
        throw new Error("MISSING_FIELDS:");
    });
}
export function updateCompany(companyId, payload) {
    return fetchJson(`${API_BASE_URL}/Company/${companyId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}
export async function deleteCompany(companyId) {
    const response = await fetch(`${API_BASE_URL}/Company/${companyId}`, {
        method: "DELETE"
    });
    if (response.status === 204) {
        return;
    }
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
}
