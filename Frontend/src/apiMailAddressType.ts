export const API_BASE_URL = "https://crm5-backend-ayfdhhgubsaybmfj.germanywestcentral-01.azurewebsites.net/api";

interface MailAddressType {
    mailAddressTypeId: number;
    description: string;
    priority: number;
}

interface MailAddressTypePayload {
    mailAddressTypeId: number;
    description: string;
    priority: number;
}

interface ErrorResponse {
    errors: Record<string, string[]>;
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

export function getMailAddressTypes(): Promise<MailAddressType[]> {
    return fetchJson(`${API_BASE_URL}/MailAddressType/all`);
}

export function createMailAddressType(payload: MailAddressTypePayload): Promise<void> {
    return fetch(`${API_BASE_URL}/MailAddressType`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleTypeUpsertResponse);
}

export function updateMailAddressType(typeId: number, payload: MailAddressTypePayload): Promise<void> {
    return fetch(`${API_BASE_URL}/MailAddressType/${typeId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(handleTypeUpsertResponse);
}

export function deleteMailAddressType(typeId: number): Promise<void> {
    return fetch(`${API_BASE_URL}/MailAddressType/${typeId}`, {
        method: "DELETE",
        headers: { 
            "Content-Type": "application/json"
        }
        }).then(async (response) => {
            if (response.ok) {
                return;
            }

            const errorBody = await response.text();
            throw new Error(errorBody || `HTTP ${response.status}`);
        });
}
