export const API_BASE_URL = "https://crm5-backend-ayfdhhgubsaybmfj.germanywestcentral-01.azurewebsites.net/api";
const FIELD_LABELS = {
    name: "Nome",
    surname: "Cognome",
    title: "Titolo",
    workrole: "Ruolo",
    typedenomination: "Tipo",
    gender: "Genere",
    birthday: "yyyy-mm-dd",
    email: "example@example.com",
    phone: "123456789",
    note: "Note",
    companydenomination: "Denominazione azienda"
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
export function getContact() {
    return fetchJson(`${API_BASE_URL}/Contact/all`);
}
export function getContactWithDetails(contactId) {
    return fetchJson(`${API_BASE_URL}/Contact/${contactId}/WithDetails`);
}
export function getContactTypes() {
    return fetchJson(`${API_BASE_URL}/ContactType/all`);
}
export function getCategories() {
    return fetchJson(`${API_BASE_URL}/Category/all`);
}
export function getCategoriesByContact(contactId) {
    return fetchJson(`${API_BASE_URL}/Contact/CategoryByContact/${contactId}`);
}
export function addCategoryToContact(contactId, categoryId) {
    return fetchJson(`${API_BASE_URL}/Contact/${contactId}/Category/${categoryId}`, {
        method: "POST"
    });
}
export function removeCategoryFromContact(contactId, categoryId) {
    return fetchJson(`${API_BASE_URL}/Contact/${contactId}/Category/${categoryId}`, {
        method: "DELETE"
    });
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
export function createContact(payload) {
    return fetch(`${API_BASE_URL}/Contact`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}
export function createContactAndReturn(payload) {
    return fetchJson(`${API_BASE_URL}/Contact`, {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
export function createContactWithCompany(companyId, payload) {
    return fetch(`${API_BASE_URL}/Contact/withCompany/${companyId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}
export function createContactWithCompanyAndReturn(companyId, payload) {
    return fetchJson(`${API_BASE_URL}/Contact/withCompany/${companyId}`, {
        method: "POST",
        body: JSON.stringify(payload)
    });
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
    const response = await fetch(`${API_BASE_URL}/Contact/SoftDelete/${contactId}`, {
        method: "PATCH"
    });
    if (response.status === 204) {
        return;
    }
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
}
export function createMailAddress(payload) {
    if (!payload.contactId) {
        return Promise.reject(new Error("contactId is required to create a mail address"));
    }
    return fetch(`${API_BASE_URL}/MailAddress/${payload.contactId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}
export function updateMailAddress(mailAddressId, payload) {
    return fetch(`${API_BASE_URL}/MailAddress/${mailAddressId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}
export async function deleteMailAddress(mailAddressId) {
    const response = await fetch(`${API_BASE_URL}/MailAddress/${mailAddressId}`, {
        method: "DELETE"
    });
    if (response.status === 204) {
        return;
    }
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
}
export function createPhoneNumber(payload) {
    if (!payload.contactId) {
        return Promise.reject(new Error("contactId is required to create a phone number"));
    }
    return fetch(`${API_BASE_URL}/PhoneNumber/${payload.contactId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}
export function updatePhoneNumber(phoneNumberId, payload) {
    return fetch(`${API_BASE_URL}/PhoneNumber/${phoneNumberId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}
export async function deletePhoneNumber(phoneNumberId) {
    const response = await fetch(`${API_BASE_URL}/PhoneNumber/${phoneNumberId}`, {
        method: "DELETE"
    });
    if (response.status === 204) {
        return;
    }
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
}
