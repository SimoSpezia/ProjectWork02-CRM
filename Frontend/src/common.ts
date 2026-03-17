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

type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'crm5-theme';

function readStoredTheme(): ThemeMode | null {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === 'light' || value === 'dark') {
        return value;
    }
    return null;
}

function saveTheme(theme: ThemeMode): void {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function applyTheme(theme: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', theme);
}

export function initializeMenuAndTheme(): void {
    const menu = document.querySelector('.menu') as HTMLElement | null;
    const menuToggle = document.querySelector('.menu-toggle') as HTMLButtonElement | null;
    const menuOverlay = document.querySelector('.menu-overlay') as HTMLElement | null;
    const themeSwitch = document.getElementById('theme-toggle') as HTMLInputElement | null;

    const closeMenu = (): void => {
        if (!menu || !menuToggle || !menuOverlay) {
            return;
        }

        menu.classList.remove('active');
        menuOverlay.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    if (menu && menuToggle && menuOverlay) {
        menuToggle.addEventListener('click', () => {
            const isOpen = menu.classList.toggle('active');
            menuOverlay.classList.toggle('active', isOpen);
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });

        menuOverlay.addEventListener('click', closeMenu);

        menu.querySelectorAll('.menu-link').forEach((link) => {
            link.addEventListener('click', closeMenu);
        });
    }

    const defaultTheme: ThemeMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = readStoredTheme() ?? defaultTheme;
    applyTheme(initialTheme);

    if (!themeSwitch) {
        return;
    }

    themeSwitch.checked = initialTheme === 'dark';

    themeSwitch.addEventListener('change', () => {
        const nextTheme: ThemeMode = themeSwitch.checked ? 'dark' : 'light';
        applyTheme(nextTheme);
        saveTheme(nextTheme);
    });
}