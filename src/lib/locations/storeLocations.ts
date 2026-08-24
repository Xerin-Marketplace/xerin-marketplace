export type StoreCountryOption = {
  value: string;
  label: string;
  scope: "local" | "global";
  apiCountry?: string;
};

export const STORE_COUNTRIES: StoreCountryOption[] = [
  { value: "Tanzania", label: "Tanzania", scope: "local" },
  { value: "United Arab Emirates", label: "United Arab Emirates (Dubai / UAE)", scope: "global", apiCountry: "United Arab Emirates" },
  { value: "China", label: "China", scope: "global", apiCountry: "China" },
  { value: "Turkey", label: "Turkey", scope: "global", apiCountry: "Turkey" },
  { value: "United States", label: "United States of America", scope: "global", apiCountry: "United States" },
  { value: "United Kingdom", label: "United Kingdom", scope: "global", apiCountry: "United Kingdom" },
];

// The browser only talks to our own Next.js route. This avoids CORS/browser
// restrictions from third-party geography services.
const LOCATION_PROXY = "/api/store-locations";

async function getProxyLocations(params: Record<string, string>): Promise<string[]> {
  const query = new URLSearchParams(params);
  const response = await fetch(`${LOCATION_PROXY}?${query.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = `Location service returned ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // keep default message
    }
    throw new Error(detail);
  }

  const body = (await response.json()) as { locations?: string[] };
  return normalize(body.locations ?? []);
}

export async function getTanzaniaRegions(): Promise<string[]> {
  return getProxyLocations({ scope: "local", level: "regions" });
}

export async function getTanzaniaDistricts(region: string): Promise<string[]> {
  if (!region) return [];
  return getProxyLocations({ scope: "local", level: "districts", region });
}

export async function getTanzaniaWards(district: string): Promise<string[]> {
  if (!district) return [];
  return getProxyLocations({ scope: "local", level: "wards", district });
}

export async function getGlobalStates(country: string): Promise<string[]> {
  if (!country) return [];
  const option = STORE_COUNTRIES.find((item) => item.value === country);
  const apiCountry = option?.apiCountry ?? country;
  return getProxyLocations({ scope: "global", level: "states", country: apiCountry });
}

export async function getGlobalCities(country: string, state: string): Promise<string[]> {
  if (!country || !state) return [];
  const option = STORE_COUNTRIES.find((item) => item.value === country);
  const apiCountry = option?.apiCountry ?? country;
  return getProxyLocations({ scope: "global", level: "cities", country: apiCountry, state });
}

function normalize(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}
