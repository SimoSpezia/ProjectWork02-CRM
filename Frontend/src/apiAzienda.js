// Generic fetch wrapper that returns JSON and throws on non-ok response
export async function fetchJson(url, options) {
    const resp = await fetch(url, options);
    if (!resp.ok) {
        throw new Error(`HTTP error ${resp.status} for ${url}`);
    }
    return resp.json();
}
// Specific API helpers
export function getCompanies() {
    return fetchJson('http://localhost:3001/companies');
}
export function addCompany(company) {
    return fetchJson('http://localhost:3001/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
    });
}
export function updateCompany(id, company) {
    if (!id) {
        throw new Error('updateCompany: id is undefined');
    }
    return fetchJson(`http://localhost:3001/companies/${id}`, {
        method: 'PUT', // or 'PATCH' if you want partial updates
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
    });
}
export function deleteCompany(id) {
    try {
        if (!id) {
            throw new Error('deleteCompany: id is undefined');
        }
        return fetchJson(`http://localhost:3001/companies/${id}`, {
            method: 'DELETE',
        });
    }
    catch (err) {
        console.error('deleteCompany error:', err);
        return Promise.reject(err);
    }
}
export function getCompanyWithDetails(id) {
    if (!id) {
        throw new Error('getCompanyWithDetails: id is undefined');
    }
    return fetchJson(`http://localhost:3001/companies/${id}`);
}
