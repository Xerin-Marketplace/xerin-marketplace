import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TZ_GEO_BASE = "https://tzgeodata.vercel.app/api/v1";
const COUNTRIES_NOW_BASE = "https://countriesnow.space/api/v0.1/countries";

// Keep Tanzania's region dropdown useful even if the upstream API is briefly
// unavailable. Districts and wards are fetched live through the server proxy.
const TANZANIA_REGIONS = [
  "Arusha",
  "Dar es Salaam",
  "Dodoma",
  "Geita",
  "Iringa",
  "Kagera",
  "Katavi",
  "Kigoma",
  "Kilimanjaro",
  "Lindi",
  "Manyara",
  "Mara",
  "Mbeya",
  "Morogoro",
  "Mtwara",
  "Mwanza",
  "Njombe",
  "Pwani",
  "Rukwa",
  "Ruvuma",
  "Shinyanga",
  "Simiyu",
  "Singida",
  "Songwe",
  "Tabora",
  "Tanga",
  "Kaskazini Pemba",
  "Kaskazini Unguja",
  "Kusini Pemba",
  "Kusini Unguja",
  "Mjini Magharibi",
];
const TANZANIA_DISTRICTS: Record<string, string[]> = {
  "Arusha": ["Arusha City", "Arusha Rural", "Karatu", "Longido", "Meru", "Monduli", "Ngorongoro"],
  "Dar es Salaam": ["Ilala Municipal", "Kinondoni Municipal", "Temeke Municipal", "Kigamboni Municipal", "Ubungo Municipal"],
  "Dodoma": ["Bahi", "Chamwino", "Chemba", "Dodoma City", "Kondoa", "Kongwa", "Mpwapwa"],
  "Geita": ["Bukombe", "Chato", "Geita", "Mbogwe", "Nyang'hwale"],
  "Iringa": ["Iringa Municipal", "Iringa Rural", "Kilolo", "Mafinga Town", "Mufindi"],
  "Kagera": ["Biharamulo", "Bukoba Municipal", "Bukoba Rural", "Karagwe", "Kyerwa", "Missenyi", "Muleba", "Ngara"],
  "Katavi": ["Mlele", "Mpanda Municipal", "Nsimbo", "Tanganyika"],
  "Kigoma": ["Buhigwe", "Kakonko", "Kasulu", "Kibondo", "Kigoma Municipal", "Kigoma Rural", "Uvinza"],
  "Kilimanjaro": ["Hai", "Moshi Municipal", "Moshi Rural", "Mwanga", "Rombo", "Same", "Siha"],
  "Lindi": ["Kilwa", "Lindi Municipal", "Lindi Rural", "Liwale", "Nachingwea", "Ruangwa"],
  "Manyara": ["Babati Rural", "Babati Town", "Hanang", "Kiteto", "Mbulu", "Simanjiro"],
  "Mara": ["Bunda", "Butiama", "Musoma Municipal", "Musoma Rural", "Rorya", "Serengeti", "Tarime"],
  "Mbeya": ["Busokelo", "Chunya", "Kyela", "Mbarali", "Mbeya City", "Mbeya Rural", "Rungwe"],
  "Morogoro": ["Gairo", "Kilombero", "Kilosa", "Malinyi", "Morogoro Municipal", "Morogoro Rural", "Mvomero", "Ulanga"],
  "Mtwara": ["Masasi", "Mtwara Municipal", "Mtwara Rural", "Nanyumbu", "Newala", "Tandahimba"],
  "Mwanza": ["Ilemela Municipal", "Kwimba", "Magu", "Misungwi", "Nyamagana Municipal", "Sengerema", "Ukerewe"],
  "Njombe": ["Ludewa", "Makambako Town", "Makete", "Njombe Town", "Njombe Rural", "Wanging'ombe"],
  "Pwani": ["Bagamoyo", "Kibaha District", "Kibaha Town", "Kisarawe", "Mafia", "Mkuranga", "Rufiji"],
  "Rukwa": ["Kalambo", "Nkasi", "Sumbawanga Municipal", "Sumbawanga Rural"],
  "Ruvuma": ["Mbinga", "Namtumbo", "Nyasa", "Songea Municipal", "Songea Rural", "Tunduru"],
  "Shinyanga": ["Kahama Town", "Kishapu", "Shinyanga Municipal", "Shinyanga Rural"],
  "Simiyu": ["Bariadi", "Busega", "Itilima", "Maswa", "Meatu"],
  "Singida": ["Ikungi", "Iramba", "Manyoni", "Mkalama", "Singida Municipal", "Singida Rural"],
  "Songwe": ["Ileje", "Mbozi", "Momba", "Songwe"],
  "Tabora": ["Igunga", "Kaliua", "Nzega", "Sikonge", "Tabora Municipal", "Urambo", "Uyui"],
  "Tanga": ["Handeni", "Kilindi", "Korogwe", "Lushoto", "Mkinga", "Muheza", "Pangani", "Tanga City"],
  "Kaskazini Pemba": ["Micheweni", "Wete"],
  "Kusini Pemba": ["Chake Chake", "Mkoani"],
  "Kaskazini Unguja": ["Kaskazini A", "Kaskazini B"],
  "Kusini Unguja": ["Kati", "Kusini"],
  "Mjini Magharibi": ["Magharibi A", "Magharibi B", "Mjini"]
};

const DISTRICT_ALIASES: Record<string, string[]> = {
  "Ilala Municipal": ["Ilala", "Ilala Municipal"],
  "Kinondoni Municipal": ["Kinondoni", "Kinondoni Municipal"],
  "Temeke Municipal": ["Temeke", "Temeke Municipal"],
  "Kigamboni Municipal": ["Kigamboni", "Kigamboni Municipal"],
  "Ubungo Municipal": ["Ubungo", "Ubungo Municipal"],
  "Nyamagana Municipal": ["Nyamagana", "Nyamagana Municipal"],
  "Ilemela Municipal": ["Ilemela", "Ilemela Municipal"],
  "Moshi Municipal": ["Moshi", "Moshi Municipal"],
  "Arusha City": ["Arusha City", "Arusha"],
  "Dodoma City": ["Dodoma City", "Dodoma Municipal", "Dodoma"],
  "Mbeya City": ["Mbeya City", "Mbeya Municipal", "Mbeya"],
  "Tanga City": ["Tanga City", "Tanga Municipal", "Tanga"]
};


function normalize(values: string[]) {
  return Array.from(new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
}

async function fetchJson(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Upstream location service returned ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const scope = searchParams.get("scope");
  const level = searchParams.get("level");

  try {
    if (scope === "local") {
      if (level === "regions") {
        try {
          const payload = await fetchJson(`${TZ_GEO_BASE}/regions/`);
          const locations = normalize(payload?.regions ?? []);
          return NextResponse.json({
            locations: locations.length ? locations : TANZANIA_REGIONS,
            source: locations.length ? "tzgeodata" : "fallback",
          });
        } catch {
          return NextResponse.json({ locations: TANZANIA_REGIONS, source: "fallback" });
        }
      }

      if (level === "districts") {
        const region = searchParams.get("region")?.trim();
        if (!region) {
          return NextResponse.json({ detail: "Region is required." }, { status: 400 });
        }

        const fallback = normalize(TANZANIA_DISTRICTS[region] ?? []);
        try {
          const payload = await fetchJson(
            `${TZ_GEO_BASE}/regions/${encodeURIComponent(region)}/districts/`,
          );
          const upstream = normalize(payload?.districts ?? []);
          // Merge both datasets. The local map guarantees districts still appear
          // when the upstream service has gaps or naming differences.
          return NextResponse.json({
            locations: normalize([...fallback, ...upstream]),
            source: upstream.length ? "merged" : "fallback",
          });
        } catch {
          return NextResponse.json({ locations: fallback, source: "fallback" });
        }
      }

      if (level === "wards") {
        const district = searchParams.get("district")?.trim();
        if (!district) {
          return NextResponse.json({ detail: "District is required." }, { status: 400 });
        }

        const candidates = DISTRICT_ALIASES[district] ?? [district];
        const expanded = Array.from(new Set([
          ...candidates,
          district.replace(/\s+(Municipal|City|Town|District)$/i, "").trim(),
          `${district} District`,
        ].filter(Boolean)));

        for (const candidate of expanded) {
          try {
            const payload = await fetchJson(
              `${TZ_GEO_BASE}/districts/${encodeURIComponent(candidate)}/wards/`,
            );
            const wards = normalize(payload?.wards ?? []);
            if (wards.length) {
              return NextResponse.json({ locations: wards, matchedDistrict: candidate });
            }
          } catch {
            // Try the next known naming variant.
          }
        }

        return NextResponse.json({ locations: [], source: "unavailable" });
      }
    }

    if (scope === "global") {
      const country = searchParams.get("country")?.trim();
      if (!country) {
        return NextResponse.json({ detail: "Country is required." }, { status: 400 });
      }

      if (level === "states") {
        const payload = await fetchJson(
          `${COUNTRIES_NOW_BASE}/states/q?country=${encodeURIComponent(country)}`,
        );
        const states = (payload?.data?.states ?? []).map((item: { name?: string }) => item?.name ?? "");
        return NextResponse.json({ locations: normalize(states) });
      }

      if (level === "cities") {
        const state = searchParams.get("state")?.trim();
        if (!state) {
          return NextResponse.json({ detail: "State / province is required." }, { status: 400 });
        }
        const payload = await fetchJson(
          `${COUNTRIES_NOW_BASE}/state/cities/q?country=${encodeURIComponent(country)}&state=${encodeURIComponent(state)}`,
        );
        return NextResponse.json({ locations: normalize(payload?.data ?? []) });
      }
    }

    return NextResponse.json(
      { detail: "Unsupported location request." },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Location service unavailable.";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
