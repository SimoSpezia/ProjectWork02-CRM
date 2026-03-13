export const API_BASE_URL = "https://localhost:7090/api";

export interface Address {
    addressId?: number;
    country: string;
    region?: string;
    province?: string;
    city: string;
    street: string;
    streetNumber: string;
    zip: string;
    companyId?: number | null;
    contactId?: number | null;
}

export interface ContactDto {
    contactId: number;
    name: string;
    surname: string;
    title?: string;
    workRole?: string;
    gender?: string;
    birthday: string;
    note?: string;
    dateAdded: string;
}

export interface CompanySimpleDto {
    companyId: number;
    denomination: string;
    website?: string;
    vatNumber: string;
    size?: string;
    note?: string;
    countContacts?: number | null;
    address: Address;
    contacts?: ContactDto[];
}

export interface CompanyUpsertPayload {
    companyId?: number;
    denomination: string;
    website?: string;
    vatNumber: string;
    size?: string;
    note?: string;
    address: Address;
    contacts?: ContactDto[];
}

const FIELD_LABELS: Record<string, string> = {
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

export function getCompanies(): Promise<CompanySimpleDto[]> {
    return fetchJson<CompanySimpleDto[]>(`${API_BASE_URL}/Company/all`);
}

export function getCompanyContacts(companyId: number): Promise<ContactDto[]> {
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
        return response.json() as Promise<ContactDto[]>;
    });
}

export function createCompany(payload: CompanyUpsertPayload): Promise<void> {
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

export function updateCompany(companyId: number, payload: CompanyUpsertPayload): Promise<void> {
    return fetchJson<void>(`${API_BASE_URL}/Company/${companyId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}

export async function deleteCompany(companyId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/Company/${companyId}`, {
        method: "DELETE"
    });

    if (response.status === 204) {
        return;
    }

    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
}
