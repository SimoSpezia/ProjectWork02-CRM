export const API_BASE_URL = "https://localhost:7090/api";

interface PhoneNumberType {
    phoneNumberTypeId: number;
    description: string;
    priority: number;
}

interface PhoneNumberTypePayload {
    phoneNumberTypeId: number;
    description: string;
    priority: number;
}

interface ErrorResponse {
    errors: Record<string, string[]>;
}

interface BackendPhoneNumberType {
    phoneNumberTypeId?: number;
    mailAddressTypeId?: number;
    description?: string;
    priority?: number;
}

const FIELD_LABELS: Record<string, string> = {
    description: "Descrizione",
    priority: "Priorita"
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

    let body: ErrorResponse | null = null;
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
        return undefined as unknown as T;
    }

    return response.json();
}

function normalizePhoneNumberType(value: BackendPhoneNumberType): PhoneNumberType {
    return {
        phoneNumberTypeId: Number(value.phoneNumberTypeId ?? value.mailAddressTypeId ?? 0),
        description: String(value.description ?? ""),
        priority: Number(value.priority ?? 0)
    };
}

function toBackendPayload(payload: PhoneNumberTypePayload): Record<string, unknown> {
    return {
        phoneNumberTypeId: payload.phoneNumberTypeId,
        mailAddressTypeId: payload.phoneNumberTypeId,
        description: payload.description,
        priority: payload.priority
    };
}

async function handleTypeUpsertResponse(response: Response): Promise<void> {
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

export async function getPhoneNumberTypes(): Promise<PhoneNumberType[]> {
    const raw = await fetchJson<BackendPhoneNumberType[]>(`${API_BASE_URL}/PhoneNumberType/all`);
    return raw.map(normalizePhoneNumberType);
}

export function createPhoneNumberType(payload: PhoneNumberTypePayload): Promise<void> {
    return fetch(`${API_BASE_URL}/PhoneNumberType`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(toBackendPayload(payload))
    }).then(handleTypeUpsertResponse);
}

export function updatePhoneNumberType(typeId: number, payload: PhoneNumberTypePayload): Promise<void> {
    return fetch(`${API_BASE_URL}/PhoneNumberType/${typeId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(toBackendPayload(payload))
    }).then(handleTypeUpsertResponse);
}

export async function deletePhoneNumberType(typeId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/PhoneNumberType/${typeId}`, {
        method: "DELETE"
    });

    if (response.status === 204) {
        return;
    }

    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
}