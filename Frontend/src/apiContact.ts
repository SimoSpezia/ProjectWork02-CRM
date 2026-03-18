export const API_BASE_URL = "https://crm5-backend-ayfdhhgubsaybmfj.germanywestcentral-01.azurewebsites.net/api";

export interface ContactDto {
    contactId : number,
    name: string,
    surname: string,
    title?: string,
    workRole?: string,
    gender?: string,
    birthday?: string,
    email?: string,
    phone?:string,
    note?: string,
    companyDenomination?: string;
}

export interface MailAddressDto {
    mailAddressId: number;
    mail: string;
    contactId?: number;
}

export interface PhoneNumberDto {
    phoneNumberId: number;
    number: string;
    prefix?: string;
    nationality: string;
    contactId?: number;
}

export interface ContactDetailsDto extends ContactDto {
    mailAddresses?: MailAddressDto[];
    phoneNumbers?: PhoneNumberDto[];
    company?: {
        companyId: number;
        denomination: string;
    };
}

export interface ContactUpsertPayload {
    contactId?: number;
    name: string;
    surname: string;
    title?: string;
    workRole?: string;
    gender?: string;
    birthday?: string;
    email?:string;
    phone?:string;
    note?: string;
    companyDenomination?: string;
}



const FIELD_LABELS: Record<string, string> = {
    name: "Nome",
    surname: "Cognome",
    title: "Titolo",
    workrole: "Ruolo",
    gender: "Genere",
    birthday: "yyyy-mm-dd",
    email: "example@example.com",
    phone:"123456789",
    note: "Note",
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

export function getContactWithDetails(contactId: number): Promise<ContactDetailsDto> {
    return fetchJson<ContactDetailsDto>(`${API_BASE_URL}/Contact/${contactId}/WithDetails`);
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

export function createContactWithCompany(companyId: number, payload: ContactUpsertPayload): Promise<void> {
    return fetch(`${API_BASE_URL}/Contact/withCompany/${companyId}`, {
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

export function createMailAddress(payload: MailAddressDto): Promise<void> {
    return fetch(`${API_BASE_URL}/MailAddress`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}

export function updateMailAddress(mailAddressId: number, payload: MailAddressDto): Promise<void> {
    return fetch(`${API_BASE_URL}/MailAddress/${mailAddressId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}

export async function deleteMailAddress(mailAddressId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/MailAddress/${mailAddressId}`, {
        method: "DELETE"
    });

    if (response.status === 204) {
        return;
    }

    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
}

export function createPhoneNumber(payload: PhoneNumberDto): Promise<void> {
    return fetch(`${API_BASE_URL}/PhoneNumber`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}

export function updatePhoneNumber(phoneNumberId: number, payload: PhoneNumberDto): Promise<void> {
    return fetch(`${API_BASE_URL}/PhoneNumber/${phoneNumberId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleContactUpsertResponse);
}

export async function deletePhoneNumber(phoneNumberId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/PhoneNumber/${phoneNumberId}`, {
        method: "DELETE"
    });

    if (response.status === 204) {
        return;
    }

    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
}
