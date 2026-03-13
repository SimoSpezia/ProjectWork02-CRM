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