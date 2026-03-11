// Generic fetch wrapper that returns JSON and throws on non-ok response
export async function fetchJson(url, options) {
    const resp = await fetch(url, options);
    if (!resp.ok) {
        throw new Error(`HTTP error ${resp.status} for ${url}`);
    }
    return resp.json();
}
// Specific API helpers – adjust paths as needed for other entities
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
// Simple helpers for showing/hiding a panel and its trigger button
export function showPanel(panel, trigger) {
    panel.style.display = 'block';
    trigger.style.display = 'none';
    document.body.classList.add('modal-open');
}
export function hidePanel(panel, trigger) {
    panel.style.display = 'none';
    trigger.style.display = 'block';
    document.body.classList.remove('modal-open');
}
// Utility to wire up a basic "add entity" form pattern
export function setupAddEntityForm(addButtonId, panelId, cancelButtonId, formId, serialize, onSubmit) {
    const addBtn = document.getElementById(addButtonId);
    const panel = document.getElementById(panelId);
    const cancelBtn = document.getElementById(cancelButtonId);
    const form = document.getElementById(formId);
    // Check if all required elements exist
    if (!addBtn || !panel || !cancelBtn || !form) {
        console.error(`setupAddEntityForm: Missing required elements. addBtn=${!!addBtn}, panel=${!!panel}, cancelBtn=${!!cancelBtn}, form=${!!form}`);
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
