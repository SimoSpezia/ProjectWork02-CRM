export const API_BASE_URL = "https://crm5-backend-ayfdhhgubsaybmfj.germanywestcentral-01.azurewebsites.net/api";

export interface ContactDto {
    contactId : number,
    name: string,
    surname: string,
    title?: string,
    workRole?: string,
    gender?: string,
    birthday: string,
    note?: string,
    dateAdded: string
    companyDenomination?: string;
}

export interface ContactUpsertPayload {
    contactId?: number;
    name: string;
    surname: string;
    title?: string;
    workRole?: string;
    gender?: string;
    birthday: string;
    note?: string;
    dateAdded: string;
    companyDenomination?: string;
}



const FIELD_LABELS: Record<string, string> = {
    name: "Nome",
    surname: "Cognome",
    title: "Titolo",
    workrole: "Ruolo",
    gender: "Genere",
    birthday: "Data di nascita",
    note: "Note",
    dateadded: "Data inserimento",
    companydenomination: "Denominazione azienda"
};

type ValidationProblemDetails = {
    errors?: Record<string, string[]>;
};

function normalizeKey(rawKey: string): string {
    return rawKey.trim().toLowerCase().replace(/\[(\d+)\]/g, "");
}

function mapFieldName(rawKey: string): string {
    const key = normalizeKey(rawKey);
    if (FIELD_LABELS[key]) {
        return FIELD_LABELS[key];
    }

    const cleaned = key.replace(/\./g, " ");
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

async function parseMissingFields(response: Response): Promise<string[]> {
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("application/json")) {
        return [];
    }

    let body: ValidationProblemDetails | null = null;
    try {
        body = await response.json() as ValidationProblemDetails;
    } catch {
        return [];
    }

    if (!body?.errors) {
        return [];
    }

    const requiredKeys: string[] = [];
    const allKeys: string[] = [];

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

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
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
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

export function getContact(): Promise<ContactDto[]> {
    return fetchJson<ContactDto[]>(`${API_BASE_URL}/Contact/all`);
}

async function handleContactUpsertResponse(response: Response): Promise<void> {
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

export function createContact(payload: ContactUpsertPayload): Promise<void> {
    return fetch(`${API_BASE_URL}/Contact`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}

export function updateContact(contactId: number, payload: ContactUpsertPayload): Promise<void> {
    return fetch(`${API_BASE_URL}/Contact/${contactId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}

export async function deleteContact(contactId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/Contact/${contactId}`, {
        method: "DELETE"
    });

    if (response.status === 204) {
        return;
    }

    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
}
