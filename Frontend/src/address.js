const API_BASE = "https://countriesnow.space/api/v0.1";
const countriesCache = {};
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
function isSelectElement(element) {
    return element instanceof HTMLSelectElement;
}
function setManualFieldValue(element, value) {
    element.value = normalize(value);
}
function clearManualFieldValue(element) {
    element.value = "";
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
export function createAddressSelectBinding(ids) {
    const countrySelect = document.getElementById(ids.countryId);
    const regionElement = document.getElementById(ids.regionId);
    const provinceElement = document.getElementById(ids.provinceId);
    const cityElement = document.getElementById(ids.cityId);
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
        async initialize(initialValues) {
            var _a, _b, _c;
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
                populateSelect(countrySelect, countries, "Seleziona nazione", initialValues === null || initialValues === void 0 ? void 0 : initialValues.country);
            }
            catch (error) {
                console.error("Errore caricamento nazioni", error);
                populateSelect(countrySelect, [], "Seleziona nazione", initialValues === null || initialValues === void 0 ? void 0 : initialValues.country);
                setManualFieldValue(regionElement, (_a = initialValues === null || initialValues === void 0 ? void 0 : initialValues.region) !== null && _a !== void 0 ? _a : "");
                setManualFieldValue(provinceElement, (_b = initialValues === null || initialValues === void 0 ? void 0 : initialValues.province) !== null && _b !== void 0 ? _b : "");
                setManualFieldValue(cityElement, (_c = initialValues === null || initialValues === void 0 ? void 0 : initialValues.city) !== null && _c !== void 0 ? _c : "");
                return;
            }
            await this.setAddress(initialValues);
        },
        async setAddress(values) {
            const country = normalize(values === null || values === void 0 ? void 0 : values.country);
            const region = normalize(values === null || values === void 0 ? void 0 : values.region);
            const province = normalize(values === null || values === void 0 ? void 0 : values.province);
            const city = normalize(values === null || values === void 0 ? void 0 : values.city);
            if (country) {
                countrySelect.value = country;
            }
            else {
                countrySelect.value = "";
            }
            setManualFieldValue(regionElement, region);
            setManualFieldValue(provinceElement, province);
            setManualFieldValue(cityElement, city);
        }
    };
}
