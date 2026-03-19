type SelectElement = HTMLSelectElement;

export type AddressValues = {
    country?: string;
    region?: string;
    province?: string;
    city?: string;
};

export type AddressSelectIds = {
    countryId: string;
    regionId: string;
    provinceId: string;
    cityId: string;
};

export type AddressSelectBinding = {
    initialize: (initialValues?: AddressValues) => Promise<void>;
    setAddress: (values?: AddressValues) => Promise<void>;
};

type CountryItem = {
    name: string;
};

type CountriesResponse = {
    error: boolean;
    msg?: string;
    data: CountryItem[];
};

const API_BASE = "https://countriesnow.space/api/v0.1";
const countriesCache: { data?: string[] } = {};

type ManualElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function normalize(value?: string): string {
    return (value ?? "").trim();
}

function normalizeKey(value?: string): string {
    return normalize(value).toLocaleLowerCase("it-IT");
}

function createOption(value: string, label?: string): HTMLOptionElement {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label ?? value;
    return option;
}

function setLoading(select: SelectElement, placeholder: string): void {
    select.innerHTML = "";
    select.appendChild(createOption("", placeholder));
    select.disabled = true;
}

function isSelectElement(element: Element | null): element is HTMLSelectElement {
    return element instanceof HTMLSelectElement;
}

function setManualFieldValue(element: ManualElement, value: string): void {
    element.value = normalize(value);
}

function clearManualFieldValue(element: ManualElement): void {
    element.value = "";
}

function populateSelect(
    select: SelectElement,
    values: string[],
    placeholder: string,
    selectedValue = ""
): void {
    const normalizedSelected = normalize(selectedValue);

    select.innerHTML = "";
    select.appendChild(createOption("", placeholder));

    const seen = new Set<string>();
    for (const rawValue of values) {
        const value = normalize(rawValue);
        const key = normalizeKey(value);
        if (!value || seen.has(key)) {
            continue;
        }

        seen.add(key);
        select.appendChild(createOption(value));
    }

    if (normalizedSelected) {
        const exists = Array.from(select.options).some(
            (option) => normalizeKey(option.value) === normalizeKey(normalizedSelected)
        );

        if (!exists) {
            select.appendChild(createOption(normalizedSelected));
        }

        select.value = normalizedSelected;
    } else {
        select.value = "";
    }

    select.disabled = false;
}

async function fetchCountries(): Promise<string[]> {
    if (countriesCache.data) {
        return countriesCache.data;
    }

    const response = await fetch(`${API_BASE}/countries/positions`);
    if (!response.ok) {
        throw new Error("Impossibile caricare le nazioni.");
    }

    const payload = (await response.json()) as CountriesResponse;
    if (payload.error) {
        throw new Error(payload.msg || "Errore durante il caricamento delle nazioni.");
    }

    const countries = payload.data
        .map((item) => normalize(item.name))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "it", { sensitivity: "base" }));

    countriesCache.data = countries;
    return countries;
}

export function createAddressSelectBinding(ids: AddressSelectIds): AddressSelectBinding | null {
    const countrySelect = document.getElementById(ids.countryId) as SelectElement | null;
    const regionElement = document.getElementById(ids.regionId) as ManualElement | null;
    const provinceElement = document.getElementById(ids.provinceId) as ManualElement | null;
    const cityElement = document.getElementById(ids.cityId) as ManualElement | null;

    if (!countrySelect || !regionElement || !provinceElement || !cityElement) {
        return null;
    }

    countrySelect.addEventListener("change", () => {
        clearManualFieldValue(regionElement);
        clearManualFieldValue(provinceElement);
        clearManualFieldValue(cityElement);
    });

    if (isSelectElement(regionElement)) {
        populateSelect(regionElement, [], "Inserisci regione manualmente");
    }

    return {
        async initialize(initialValues?: AddressValues): Promise<void> {
            setLoading(countrySelect, "Caricamento nazioni...");

            if (isSelectElement(regionElement)) {
                populateSelect(regionElement, [], "Inserisci regione manualmente");
            }

            if (isSelectElement(provinceElement)) {
                populateSelect(provinceElement, [], "Inserisci provincia manualmente");
            }

            if (isSelectElement(cityElement)) {
                populateSelect(cityElement, [], "Inserisci citta' manualmente");
            }

            try {
                const countries = await fetchCountries();
                populateSelect(countrySelect, countries, "Seleziona nazione", initialValues?.country);
            } catch (error) {
                console.error("Errore caricamento nazioni", error);
                populateSelect(countrySelect, [], "Seleziona nazione", initialValues?.country);
                setManualFieldValue(regionElement, initialValues?.region ?? "");
                setManualFieldValue(provinceElement, initialValues?.province ?? "");
                setManualFieldValue(cityElement, initialValues?.city ?? "");
                return;
            }

            await this.setAddress(initialValues);
        },

        async setAddress(values?: AddressValues): Promise<void> {
            const country = normalize(values?.country);
            const region = normalize(values?.region);
            const province = normalize(values?.province);
            const city = normalize(values?.city);

            if (country) {
                countrySelect.value = country;
            } else {
                countrySelect.value = "";
            }

            setManualFieldValue(regionElement, region);
            setManualFieldValue(provinceElement, province);
            setManualFieldValue(cityElement, city);
        }
    };
}
