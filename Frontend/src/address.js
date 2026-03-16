const API_BASE = "https://countriesnow.space/api/v0.1";
const countriesCache = {};
const statesCache = new Map();
const citiesCache = new Map();
function normalize(value) {
    return (value !== null && value !== void 0 ? value : "").trim();
}
function normalizeKey(value) {
    return normalize(value).toLocaleLowerCase("it-IT");
}
function createOption(value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label !== null && label !== void 0 ? label : value;
    return option;
}
function setLoading(select, placeholder) {
    select.innerHTML = "";
    select.appendChild(createOption("", placeholder));
    select.disabled = true;
}
function populateSelect(select, values, placeholder, selectedValue = "") {
    const normalizedSelected = normalize(selectedValue);
    select.innerHTML = "";
    select.appendChild(createOption("", placeholder));
    const seen = new Set();
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
        const exists = Array.from(select.options).some((option) => normalizeKey(option.value) === normalizeKey(normalizedSelected));
        if (!exists) {
            select.appendChild(createOption(normalizedSelected));
        }
        select.value = normalizedSelected;
    }
    else {
        select.value = "";
    }
    select.disabled = false;
}
async function fetchCountries() {
    if (countriesCache.data) {
        return countriesCache.data;
    }
    const response = await fetch(`${API_BASE}/countries/positions`);
    if (!response.ok) {
        throw new Error("Impossibile caricare le nazioni.");
    }
    const payload = (await response.json());
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
async function fetchStates(country) {
    var _a, _b;
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
    const payload = (await response.json());
    if (payload.error) {
        throw new Error(payload.msg || "Errore durante il caricamento delle regioni/province.");
    }
    const states = ((_b = (_a = payload.data) === null || _a === void 0 ? void 0 : _a.states) !== null && _b !== void 0 ? _b : [])
        .map((state) => normalize(state.name))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "it", { sensitivity: "base" }));
    statesCache.set(key, states);
    return states;
}
async function fetchCities(country, state) {
    var _a;
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
    const payload = (await response.json());
    if (payload.error) {
        throw new Error(payload.msg || "Errore durante il caricamento delle citta'.");
    }
    const cities = ((_a = payload.data) !== null && _a !== void 0 ? _a : [])
        .map((city) => normalize(city))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "it", { sensitivity: "base" }));
    citiesCache.set(cacheKey, cities);
    return cities;
}
export function createAddressSelectBinding(ids) {
    const countrySelect = document.getElementById(ids.countryId);
    const regionSelect = document.getElementById(ids.regionId);
    const provinceSelect = document.getElementById(ids.provinceId);
    const citySelect = document.getElementById(ids.cityId);
    if (!countrySelect || !regionSelect || !provinceSelect || !citySelect) {
        return null;
    }
    let syncing = false;
    const loadStatesForCountry = async (country, regionValue = "", provinceValue = "") => {
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
    const loadCitiesForState = async (country, state, cityValue = "") => {
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
    const syncStateSelects = (source, target) => {
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error("Errore caricamento citta'", error);
            populateSelect(citySelect, [], "Seleziona citta'");
        }
    });
    provinceSelect.addEventListener("change", async () => {
        syncStateSelects(provinceSelect, regionSelect);
        try {
            await loadCitiesForState(countrySelect.value, provinceSelect.value);
        }
        catch (error) {
            console.error("Errore caricamento citta'", error);
            populateSelect(citySelect, [], "Seleziona citta'");
        }
    });
    return {
        async initialize(initialValues) {
            setLoading(countrySelect, "Caricamento nazioni...");
            setLoading(regionSelect, "Seleziona regione");
            setLoading(provinceSelect, "Seleziona provincia");
            setLoading(citySelect, "Seleziona citta'");
            try {
                const countries = await fetchCountries();
                populateSelect(countrySelect, countries, "Seleziona nazione", initialValues === null || initialValues === void 0 ? void 0 : initialValues.country);
            }
            catch (error) {
                console.error("Errore caricamento nazioni", error);
                populateSelect(countrySelect, [], "Seleziona nazione", initialValues === null || initialValues === void 0 ? void 0 : initialValues.country);
                return;
            }
            if (initialValues === null || initialValues === void 0 ? void 0 : initialValues.country) {
                await this.setAddress(initialValues);
            }
        },
        async setAddress(values) {
            const country = normalize(values === null || values === void 0 ? void 0 : values.country);
            const region = normalize(values === null || values === void 0 ? void 0 : values.region);
            const province = normalize((values === null || values === void 0 ? void 0 : values.province) || region);
            const city = normalize(values === null || values === void 0 ? void 0 : values.city);
            if (country) {
                countrySelect.value = country;
            }
            else {
                countrySelect.value = "";
            }
            try {
                await loadStatesForCountry(countrySelect.value, region, province);
            }
            catch (error) {
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
            }
            catch (error) {
                console.error("Errore caricamento citta'", error);
                populateSelect(citySelect, [], "Seleziona citta'", city);
            }
        }
    };
}
