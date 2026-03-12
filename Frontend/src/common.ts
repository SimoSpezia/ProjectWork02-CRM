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
    website: string;
    partitaIVA: string;
    size: string;
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

// Show/hide panel using CSS class, compatible with azienda.css .visible transition
export function showPanel(panel: HTMLElement, trigger: HTMLElement): void {
    panel.style.display = 'block';
    void panel.offsetHeight; // forza reflow per far partire la transizione CSS
    panel.classList.add('visible');
    trigger.style.display = 'none';
    document.body.classList.add('modal-open');
}

export function hidePanel(panel: HTMLElement, trigger: HTMLElement): void {
    panel.classList.remove('visible');
    panel.addEventListener('transitionend', () => {
        panel.style.display = 'none';
    }, { once: true });
    trigger.style.display = '';
    document.body.classList.remove('modal-open');
}

// Utility to wire up a basic "add entity" form pattern
export function setupAddEntityForm<T>(
    addButtonId: string,
    panelId: string,
    cancelButtonId: string,
    formId: string,
    serialize: () => T,
    onSubmit: (entity: T) => Promise<any>
): void {
    const addBtn = document.getElementById(addButtonId) as HTMLElement | null;
    const panel = document.getElementById(panelId) as HTMLElement | null;
    const cancelBtn = document.getElementById(cancelButtonId) as HTMLButtonElement | null;
    const form = document.getElementById(formId) as HTMLFormElement | null;

    if (!addBtn || !panel || !cancelBtn || !form) {
        console.error('setupAddEntityForm: Missing required elements.',
            { addBtn: !!addBtn, panel: !!panel, cancelBtn: !!cancelBtn, form: !!form });
        return;
    }

    addBtn.addEventListener('click', () => showPanel(panel, addBtn));

    cancelBtn.addEventListener('click', () => {
        hidePanel(panel, addBtn);
        form.reset();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const entity = serialize();
        onSubmit(entity)
            .then(() => {
                hidePanel(panel, addBtn);
                form.reset();
            })
            .catch(err => console.error('Form submission error', err));
    });
}