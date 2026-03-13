// Show/hide panel using CSS class, compatible with azienda.css .visible transition
export function showPanel(panel, trigger) {
    panel.style.display = 'block';
    void panel.offsetHeight; // forza reflow per far partire la transizione CSS
    panel.classList.add('visible');
    trigger.style.display = 'none';
    document.body.classList.add('modal-open');
}
export function hidePanel(panel, trigger) {
    panel.classList.remove('visible');
    panel.addEventListener('transitionend', () => {
        panel.style.display = 'none';
    }, { once: true });
    trigger.style.display = '';
    document.body.classList.remove('modal-open');
}
// Utility to wire up a basic "add entity" form pattern
export function setupAddEntityForm(addButtonId, panelId, cancelButtonId, formId, serialize, onSubmit) {
    const addBtn = document.getElementById(addButtonId);
    const panel = document.getElementById(panelId);
    const cancelBtn = document.getElementById(cancelButtonId);
    const form = document.getElementById(formId);
    if (!addBtn || !panel || !cancelBtn || !form) {
        console.error('setupAddEntityForm: Missing required elements.', { addBtn: !!addBtn, panel: !!panel, cancelBtn: !!cancelBtn, form: !!form });
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
