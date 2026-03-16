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

type StateItem = {
    name: string;
    state_code?: string;
};

type CountriesResponse = {
    error: boolean;
    msg?: string;
    data: CountryItem[];
};

type StatesResponse = {
    error: boolean;
    msg?: string;
    data: {
        name: string;
        iso3?: string;
        iso2?: string;
        states: StateItem[];
    };
};

type CitiesResponse = {
    error: boolean;
    msg?: string;
    data: string[];
};

const API_BASE = "https://countriesnow.space/api/v0.1";
const countriesCache: { data?: string[] } = {};
const statesCache = new Map<string, string[]>();
const citiesCache = new Map<string, string[]>();

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

async function fetchStates(country: string): Promise<string[]> {
    const key = normalizeKey(country);
    if (!key) {
        return [];
    }

    const cached = statesCache.get(key);
    if (cached) {
        return cached;
    }

    const response = await fetch(`${API_BASE}/countries/states`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ country: normalize(country) })
    });

    if (!response.ok) {
        throw new Error("Impossibile caricare le regioni/province.");
    }

    const payload = (await response.json()) as StatesResponse;
    if (payload.error) {
        throw new Error(payload.msg || "Errore durante il caricamento delle regioni/province.");
    }

    const states = (payload.data?.states ?? [])
        .map((state) => normalize(state.name))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "it", { sensitivity: "base" }));

    statesCache.set(key, states);
    return states;
}

async function fetchCities(country: string, state: string): Promise<string[]> {
    const countryKey = normalizeKey(country);
    const stateKey = normalizeKey(state);

    if (!countryKey || !stateKey) {
        return [];
    }

    const cacheKey = `${countryKey}|${stateKey}`;
    const cached = citiesCache.get(cacheKey);
    if (cached) {
        return cached;
    }

    const response = await fetch(`${API_BASE}/countries/state/cities`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            country: normalize(country),
            state: normalize(state)
        })
    });

    if (!response.ok) {
        throw new Error("Impossibile caricare le citta'.");
    }

    const payload = (await response.json()) as CitiesResponse;
    if (payload.error) {
        throw new Error(payload.msg || "Errore durante il caricamento delle citta'.");
    }

    const cities = (payload.data ?? [])
        .map((city) => normalize(city))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "it", { sensitivity: "base" }));

    citiesCache.set(cacheKey, cities);
    return cities;
}

export function createAddressSelectBinding(ids: AddressSelectIds): AddressSelectBinding | null {
    const countrySelect = document.getElementById(ids.countryId) as SelectElement | null;
    const regionSelect = document.getElementById(ids.regionId) as SelectElement | null;
    const provinceSelect = document.getElementById(ids.provinceId) as SelectElement | null;
    const citySelect = document.getElementById(ids.cityId) as SelectElement | null;

    if (!countrySelect || !regionSelect || !provinceSelect || !citySelect) {
        return null;
    }

    let syncing = false;

    const loadStatesForCountry = async (
        country: string,
        regionValue = "",
        provinceValue = ""
    ): Promise<void> => {
        const normalizedCountry = normalize(country);
        if (!normalizedCountry) {
            populateSelect(regionSelect, [], "Seleziona regione");
            populateSelect(provinceSelect, [], "Seleziona provincia");
            populateSelect(citySelect, [], "Seleziona citta'");
            return;
        }

        setLoading(regionSelect, "Caricamento regioni...");
        setLoading(provinceSelect, "Caricamento province...");
        setLoading(citySelect, "Seleziona citta'");

        const states = await fetchStates(normalizedCountry);
        populateSelect(regionSelect, states, "Seleziona regione", regionValue);
        populateSelect(provinceSelect, states, "Seleziona provincia", provinceValue || regionValue);
    };

    const loadCitiesForState = async (
        country: string,
        state: string,
        cityValue = ""
    ): Promise<void> => {
        const normalizedCountry = normalize(country);
        const normalizedState = normalize(state);

        if (!normalizedCountry || !normalizedState) {
            populateSelect(citySelect, [], "Seleziona citta'");
            return;
        }

        setLoading(citySelect, "Caricamento citta'...");

        const cities = await fetchCities(normalizedCountry, normalizedState);
        populateSelect(citySelect, cities, "Seleziona citta'", cityValue);
    };

    const syncStateSelects = (source: SelectElement, target: SelectElement): void => {
        if (syncing) {
            return;
        }

        syncing = true;
        target.value = source.value;
        syncing = false;
    };

    countrySelect.addEventListener("change", async () => {
        try {
            await loadStatesForCountry(countrySelect.value);
        } catch (error) {
            console.error("Errore caricamento regioni/province", error);
            populateSelect(regionSelect, [], "Seleziona regione");
            populateSelect(provinceSelect, [], "Seleziona provincia");
            populateSelect(citySelect, [], "Seleziona citta'");
        }
    });

    regionSelect.addEventListener("change", async () => {
        syncStateSelects(regionSelect, provinceSelect);

        try {
            await loadCitiesForState(countrySelect.value, regionSelect.value);
        } catch (error) {
            console.error("Errore caricamento citta'", error);
            populateSelect(citySelect, [], "Seleziona citta'");
        }
    });

    provinceSelect.addEventListener("change", async () => {
        syncStateSelects(provinceSelect, regionSelect);

        try {
            await loadCitiesForState(countrySelect.value, provinceSelect.value);
        } catch (error) {
            console.error("Errore caricamento citta'", error);
            populateSelect(citySelect, [], "Seleziona citta'");
        }
    });

    return {
        async initialize(initialValues?: AddressValues): Promise<void> {
            setLoading(countrySelect, "Caricamento nazioni...");
            setLoading(regionSelect, "Seleziona regione");
            setLoading(provinceSelect, "Seleziona provincia");
            setLoading(citySelect, "Seleziona citta'");

            try {
                const countries = await fetchCountries();
                populateSelect(countrySelect, countries, "Seleziona nazione", initialValues?.country);
            } catch (error) {
                console.error("Errore caricamento nazioni", error);
                populateSelect(countrySelect, [], "Seleziona nazione", initialValues?.country);
                return;
            }

            if (initialValues?.country) {
                await this.setAddress(initialValues);
            }
        },

        async setAddress(values?: AddressValues): Promise<void> {
            const country = normalize(values?.country);
            const region = normalize(values?.region);
            const province = normalize(values?.province || region);
            const city = normalize(values?.city);

            if (country) {
                countrySelect.value = country;
            } else {
                countrySelect.value = "";
            }

            try {
                await loadStatesForCountry(countrySelect.value, region, province);
            } catch (error) {
                console.error("Errore caricamento regioni/province", error);
                populateSelect(regionSelect, [], "Seleziona regione", region);
                populateSelect(provinceSelect, [], "Seleziona provincia", province);
                populateSelect(citySelect, [], "Seleziona citta'", city);
                return;
            }

            const selectedState = normalize(provinceSelect.value || regionSelect.value || region || province);
            if (!selectedState) {
                populateSelect(citySelect, [], "Seleziona citta'", city);
                return;
            }

            try {
                await loadCitiesForState(countrySelect.value, selectedState, city);
                regionSelect.value = selectedState;
                provinceSelect.value = selectedState;
            } catch (error) {
                console.error("Errore caricamento citta'", error);
                populateSelect(citySelect, [], "Seleziona citta'", city);
            }
        }
    };
}
