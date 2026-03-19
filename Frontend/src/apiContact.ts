import { API_BASE_URL } from "./connectionString.js";

export interface ContactDto {
    contactId : number,
    name: string,
    surname: string,
    title?: string,
    workRole?: string,
    typeDenomination?: string,
    gender?: string,
    birthday?: string,
    email?: string,
    phone?:string,
    note?: string,
    companyDenomination?: string;
    companydenomination?: string;
}

export interface AddressDto {
    addressId: number;
    country?: string;
    region?: string;
    province?: string;
    city?: string;
    street?: string;
    streetNumber?: string;
    zip?: string;
    companyId?: number | null;
    contactId?: number | null;
}

export interface CategoryDto {
    categoryId: number;
    description: string;
}

export interface ContactTypeDto {
    contactTypeId: number;
    description: string;
}

export interface GroupContactDto {
    contactId: number;
    categories: CategoryDto[];
}

export interface MailAddressDto {
    mailAddressId: number;
    mail: string;
    mailAddressTypeId?: number;
    mailAddressType?: {
        mailAddressTypeId: number;
        description: string;
        priority: number;
    };
    contactId?: number;
}

export interface PhoneNumberDto {
    phoneNumberId: number;
    number: string;
    prefix?: string;
    nationality: string;
    phoneNumberTypeId?: number;
    phoneNumberType?: {
        phoneNumberTypeId: number;
        description: string;
        priority: number;
    };
    contactId?: number;
}

export interface ContactDetailsDto extends ContactDto {
    mailAddresses?: MailAddressDto[];
    phoneNumbers?: PhoneNumberDto[];
    address?: AddressDto;
    company?: {
        companyId: number;
        denomination: string;
    };
    contactType?: ContactTypeDto;
    categoriesAsString?: string;
}

export interface ContactUpsertPayload {
    contactId?: number;
    name: string;
    surname: string;
    title?: string;
    workRole?: string;
    typeDenomination?: string;
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
    typedenomination: "Tipo",
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

export function getContactTypes(): Promise<ContactTypeDto[]> {
    return fetchJson<ContactTypeDto[]>(`${API_BASE_URL}/ContactType/all`);
}

export function getCategories(): Promise<CategoryDto[]> {
    return fetchJson<CategoryDto[]>(`${API_BASE_URL}/Category/all`);
}

export function getCategoriesByContact(contactId: number): Promise<GroupContactDto> {
    return fetchJson<GroupContactDto>(`${API_BASE_URL}/Contact/CategoryByContact/${contactId}`);
}

export function addCategoryToContact(contactId: number, categoryId: number): Promise<GroupContactDto> {
    return fetchJson<GroupContactDto>(`${API_BASE_URL}/Contact/${contactId}/Category/${categoryId}`, {
        method: "POST"
    });
}

export function removeCategoryFromContact(contactId: number, categoryId: number): Promise<GroupContactDto> {
    return fetchJson<GroupContactDto>(`${API_BASE_URL}/Contact/${contactId}/Category/${categoryId}`, {
        method: "DELETE"
    });
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

export function createContactAndReturn(payload: ContactUpsertPayload): Promise<ContactDto> {
    return fetchJson<ContactDto>(`${API_BASE_URL}/Contact`, {
        method: "POST",
        body: JSON.stringify(payload)
    });
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

export function createContactWithCompanyAndReturn(companyId: number, payload: ContactUpsertPayload): Promise<ContactDto> {
    return fetchJson<ContactDto>(`${API_BASE_URL}/Contact/withCompany/${companyId}`, {
        method: "POST",
        body: JSON.stringify(payload)
    });
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
    const response = await fetch(`${API_BASE_URL}/Contact/SoftDelete/${contactId}`, {
        method: "PATCH"
    });

    if (response.status === 204) {
        return;
    }

    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
}

export function createMailAddress(payload: MailAddressDto): Promise<void> {
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

export function createAddress(payload: AddressDto): Promise<AddressDto> {
    return fetchJson<AddressDto>(`${API_BASE_URL}/Address`, {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

export function updateAddress(addressId: number, payload: AddressDto): Promise<AddressDto> {
    return fetchJson<AddressDto>(`${API_BASE_URL}/Address/${addressId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}
