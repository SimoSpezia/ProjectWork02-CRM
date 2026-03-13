export interface Address {
    street: string;
    streetNumber: string;
    city: string;
    province: string;
    region: string;
    zip: string;
    country: string;
}

export interface Company {
    id?: string; 
    name: string;
    address: Address;
    contacts?: Contact[];
    website: string;
    partitaIVA: string;
    size: string;
    notes: string;
}

export interface Contact {
    id?: string; 
    name: string;
    role: string;
    notes: string;
}

// Generic fetch wrapper that returns JSON and throws on non-ok response
export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const resp = await fetch(url, options);
    if (!resp.ok) {
        throw new Error(`HTTP error ${resp.status} for ${url}`);
    }
    return resp.json();
}

// Specific API helpers
export function getCompanies(): Promise<Company[]> {
    return fetchJson<Company[]>('http://localhost:3001/companies');
}

export function addCompany(company: Company): Promise<Company> {
    return fetchJson<Company>('http://localhost:3001/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
    });
}
export function updateCompany(id: string | undefined, company: Company): Promise<Company> {
    if (!id) {
        throw new Error('updateCompany: id is undefined');
    }
    return fetchJson<Company>(`http://localhost:3001/companies/${id}`, {
        method: 'PUT', // or 'PATCH' if you want partial updates
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
    });
}

export function deleteCompany(id: string|undefined): Promise<void> {
    try {  
        if (!id) {
            throw new Error('deleteCompany: id is undefined');
        }
    return fetchJson<void>(`http://localhost:3001/companies/${id}`, {
        method: 'DELETE',
        });
    } catch (err) {
        console.error('deleteCompany error:', err);
        return Promise.reject(err);
    }
}

export function getCompanyWithDetails(id: string | undefined): Promise<Company> {
    if (!id) {
        throw new Error('getCompanyWithDetails: id is undefined');
    }
    return fetchJson<Company>(`http://localhost:3001/companies/${id}`);
}