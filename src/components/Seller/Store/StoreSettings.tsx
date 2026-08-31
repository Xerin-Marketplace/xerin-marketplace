"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Crosshair,
  ExternalLink,
  Globe2,
  ImageIcon,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Pencil,
  Plus,
  Store as StoreIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  useCreateStore,
  useMyStores,
  useUpdateStore,
  useUploadStoreBannerById,
  useUploadStoreLogoById,
} from "@/hooks/useStore";
import { authStorage } from "@/lib/auth/storage";
import { API_BASE_URL } from "@/lib/api/endpoints";
import { usersApi } from "@/lib/api/endpoints/users";
import type { MapResolvedLocation } from "@/types/api/user";
import type { CreateStorePayload, Store } from "@/types/api/store";
import {
  STORE_COUNTRIES,
  getGlobalCities,
  getGlobalStates,
  getTanzaniaDistricts,
  getTanzaniaRegions,
  getTanzaniaWards,
} from "@/lib/locations/storeLocations";

type ViewMode = "list" | "create" | "edit";

type StoreFormState = {
  store_name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_phone: string;
  website_url: string;
  country: string;
  region: string;
  district: string;
  ward: string;
  street: string;
  latitude: string;
  longitude: string;
};

const EMPTY_FORM: StoreFormState = {
  store_name: "",
  description: "",
  contact_email: "",
  contact_phone: "",
  whatsapp_phone: "",
  website_url: "",
  country: "Tanzania",
  region: "",
  district: "",
  ward: "",
  street: "",
  latitude: "",
  longitude: "",
};

const TANZANIA_NAMES = new Set([
  "tanzania",
  "united republic of tanzania",
  "tanzania, united republic of",
]);

function predictedScope(country: string): "local" | "global" {
  return TANZANIA_NAMES.has(country.trim().toLowerCase()) ? "local" : "global";
}

function normalizeLocationName(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function canonicalOption(value: string | null | undefined, options: string[]): string {
  const raw = (value || "").trim();
  if (!raw) return "";
  const normalized = normalizeLocationName(raw);
  const aliases: Record<string, string> = {
    "dar es salam": "dar es salaam",
    "dar salaam": "dar es salaam",
    "dar es salaam region": "dar es salaam",
  };
  const wanted = aliases[normalized] || normalized;
  return options.find((option) => normalizeLocationName(option) === wanted) || "";
}


function resolveStoreMediaUrl(value?: string | null): string {
  if (!value) return "";
  if (/^(https?:|data:|blob:)/i.test(value)) {
    try {
      const absolute = new URL(value);
      if (absolute.pathname.startsWith("/api/v1/uploads/")) {
        absolute.pathname = absolute.pathname.replace("/api/v1/uploads/", "/uploads/");
        return absolute.toString();
      }
    } catch {
      // Keep the original absolute value if URL parsing fails.
    }
    return value;
  }

  if (API_BASE_URL.startsWith("/")) {
    if (value.startsWith("/uploads/")) {
      return value.replace(/^\/uploads\//, "/backend-uploads/");
    }
    if (value.startsWith("uploads/")) {
      return `/backend-uploads/${value.replace(/^uploads\//, "")}`;
    }
    return value;
  }

  try {
    const api = new URL(API_BASE_URL);
    const apiOrigin = api.origin;

    if (value.startsWith("/uploads/")) {
      return `${apiOrigin}${value}`;
    }
    if (value.startsWith("uploads/")) {
      return `${apiOrigin}/${value}`;
    }

    return `${apiOrigin}/${value.replace(/^\//, "")}`;
  } catch {
    return value;
  }
}

function formFromStore(store: Store): StoreFormState {
  return {
    store_name: store.store_name || "",
    description: store.description || "",
    contact_email: store.contact_email || "",
    contact_phone: store.contact_phone || "",
    whatsapp_phone: store.whatsapp_phone || "",
    website_url: store.website_url || "",
    country: store.country || "",
    region: store.region || "",
    district: store.district || "",
    ward: store.ward || "",
    street: store.street || "",
    latitude: store.latitude == null ? "" : String(store.latitude),
    longitude: store.longitude == null ? "" : String(store.longitude),
  };
}

export default function SellerStoreSettings() {
  const router = useRouter();
  const user = authStorage.getUser<{ account_type?: string; roles?: string[] }>();
  const token = authStorage.getAccessToken();
  const isSeller = Boolean(user && (user.account_type === "seller" || (user.roles ?? []).includes("seller")));

  const { data: stores = [], isLoading, error, refetch } = useMyStores();
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const uploadLogo = useUploadStoreLogoById();
  const uploadBanner = useUploadStoreBannerById();

  const [mode, setMode] = useState<ViewMode>("list");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [form, setForm] = useState<StoreFormState>(EMPTY_FORM);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [wardOptions, setWardOptions] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [createLogoFile, setCreateLogoFile] = useState<File | null>(null);

  const selectedStore = useMemo(
    () => stores.find((store) => String(store.id) === selectedStoreId) ?? null,
    [stores, selectedStoreId],
  );

  useEffect(() => {
    if (mode === "edit" && selectedStore) setForm(formFromStore(selectedStore));
  }, [mode, selectedStore]);

  useEffect(() => {
    let cancelled = false;
    async function loadRegions() {
      if (mode === "list" || !form.country) return;
      setLocationLoading(true);
      setLocationError(null);
      try {
        const values = predictedScope(form.country) === "local"
          ? await getTanzaniaRegions()
          : await getGlobalStates(form.country);
        if (!cancelled) setRegionOptions(values);
      } catch {
        if (!cancelled) {
          setRegionOptions([]);
          setLocationError("Location suggestions are temporarily unavailable. You can still type the location manually.");
        }
      } finally {
        if (!cancelled) setLocationLoading(false);
      }
    }
    loadRegions();
    return () => { cancelled = true; };
  }, [mode, form.country]);

  useEffect(() => {
    let cancelled = false;
    async function loadDistricts() {
      if (mode === "list" || !form.country || !form.region) {
        setDistrictOptions([]);
        return;
      }
      setLocationLoading(true);
      setLocationError(null);
      try {
        const values = predictedScope(form.country) === "local"
          ? await getTanzaniaDistricts(form.region)
          : await getGlobalCities(form.country, form.region);
        if (!cancelled) setDistrictOptions(values);
      } catch {
        if (!cancelled) {
          setDistrictOptions([]);
          setLocationError("Location suggestions are temporarily unavailable. You can still type the location manually.");
        }
      } finally {
        if (!cancelled) setLocationLoading(false);
      }
    }
    loadDistricts();
    return () => { cancelled = true; };
  }, [mode, form.country, form.region]);

  useEffect(() => {
    let cancelled = false;
    async function loadWards() {
      if (mode === "list" || predictedScope(form.country) !== "local" || !form.district) {
        setWardOptions([]);
        return;
      }
      setLocationLoading(true);
      setLocationError(null);
      try {
        const values = await getTanzaniaWards(form.district);
        if (!cancelled) setWardOptions(values);
      } catch {
        if (!cancelled) {
          setWardOptions([]);
          setLocationError("Ward suggestions are temporarily unavailable. You can still type the ward manually.");
        }
      } finally {
        if (!cancelled) setLocationLoading(false);
      }
    }
    loadWards();
    return () => { cancelled = true; };
  }, [mode, form.country, form.district]);

  if (!token || !isSeller) {
    router.replace("/signin?redirect=/seller/store");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <Loader2 className="animate-spin text-[#f7941d]" />
      </div>
    );
  }

  if (error && mode === "list") {
    return (
      <div className="mx-auto max-w-[1280px] space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">My Stores</h2>
            <p className="mt-1 text-sm text-[#64748b]">Create and manage all physical selling locations connected to your seller account.</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f7941d] px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Plus size={17} /> Add Store
          </button>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-white px-6 py-12 text-center shadow-sm dark:border-amber-500/30 dark:bg-[#1f2937]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#f7941d] dark:bg-orange-400/10">
            <StoreIcon size={27} />
          </span>
          <h3 className="mt-4 text-lg font-bold">Your store list could not be loaded</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[#64748b]">
            {(error as Error)?.message || "Store data could not be loaded."} You can still create your first store, or retry loading the list.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-[#f7941d] px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={17} /> Create Store
            </button>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-xl border border-[#e2e8f0] px-5 py-2.5 text-sm font-semibold dark:border-white/10"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  function openCreate() {
    setSelectedStoreId(null);
    setCreateLogoFile(null);
    setForm(EMPTY_FORM);
    setMode("create");
  }

  function openEdit(store: Store) {
    setCreateLogoFile(null);
    setSelectedStoreId(String(store.id));
    setForm(formFromStore(store));
    setMode("edit");
  }

  function backToStores() {
    setMode("list");
    setSelectedStoreId(null);
    setCreateLogoFile(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.store_name.trim()) {
      toast.error("Store name is required.");
      return;
    }
    if (!form.country.trim()) {
      toast.error("Country is required.");
      return;
    }

    if (predictedScope(form.country) === "local") {
      if (!form.region || !regionOptions.includes(form.region)) {
        toast.error("Select an official Tanzania region from the dropdown.");
        return;
      }
      if (!form.district || !districtOptions.includes(form.district)) {
        toast.error("Select the store district / municipality from the dropdown.");
        return;
      }
      if (wardOptions.length > 0 && form.ward && !wardOptions.includes(form.ward)) {
        toast.error("Select the store ward from the dropdown.");
        return;
      }
    }

    if (!form.latitude || !form.longitude) {
      toast.error("Set the store pickup latitude and longitude before saving the store.");
      return;
    }

    try {
      if (mode === "create") {
        const payload: CreateStorePayload = {
          store_name: form.store_name.trim(),
          country: form.country.trim(),
          description: form.description.trim() || null,
          contact_email: form.contact_email.trim() || null,
          contact_phone: form.contact_phone.trim() || null,
          whatsapp_phone: form.whatsapp_phone.trim() || null,
          website_url: form.website_url.trim() || null,
          region: form.region.trim() || null,
          district: form.district.trim() || null,
          ward: form.ward.trim() || null,
          street: form.street.trim() || null,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        };
        const created = await createStore.mutateAsync(payload);

        let logoUploaded = false;
        if (createLogoFile) {
          try {
            await uploadLogo.mutateAsync({ storeId: String(created.id), file: createLogoFile });
            logoUploaded = true;
          } catch (logoError) {
            toast.error(apiErrorMessage(logoError, "Store was created, but the logo could not be uploaded. You can upload it from Manage Store."));
          }
        }

        await refetch();
        setSelectedStoreId(null);
        setCreateLogoFile(null);
        setForm(EMPTY_FORM);
        setMode("list");
        router.replace("/seller/store");
        router.refresh();
        toast.success(logoUploaded ? "Store and logo created successfully." : "Store created successfully.");
        return;
      }

      if (!selectedStoreId) return;
      const updatedStore = await updateStore.mutateAsync({
        storeId: selectedStoreId,
        payload: {
          store_name: form.store_name.trim(),
          description: form.description.trim() || null,
          contact_email: form.contact_email.trim() || null,
          contact_phone: form.contact_phone.trim() || null,
          whatsapp_phone: form.whatsapp_phone.trim() || null,
          website_url: form.website_url.trim() || null,
          country: form.country.trim(),
          region: form.region.trim() || null,
          district: form.district.trim() || null,
          ward: form.ward.trim() || null,
          street: form.street.trim() || null,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        },
      });

      // Keep the edit form synchronized with the exact object returned by the
      // backend, then reload My Stores before returning to the list.
      setForm(formFromStore(updatedStore));
      await refetch();
      setMode("list");
      setSelectedStoreId(null);
      setCreateLogoFile(null);
      router.replace("/seller/store");
      router.refresh();
      toast.success("Store location and details updated successfully.");
    } catch (err) {
      toast.error(apiErrorMessage(err, mode === "create" ? "Failed to create store." : "Failed to update store."));
    }
  }

  async function handleLogoUpload(file: File) {
    if (!selectedStoreId) return;
    try {
      await uploadLogo.mutateAsync({ storeId: selectedStoreId, file });
      toast.success("Store logo uploaded.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to upload logo."));
    }
  }

  async function handleBannerUpload(file: File) {
    if (!selectedStoreId) return;
    try {
      await uploadBanner.mutateAsync({ storeId: selectedStoreId, file });
      toast.success("Store banner uploaded.");
    } catch (err) {
      toast.error(apiErrorMessage(err, "Failed to upload banner."));
    }
  }

  if (mode === "list") {
    return <StoreList stores={stores} onCreate={openCreate} onEdit={openEdit} />;
  }

  const scope = mode === "edit" && selectedStore ? selectedStore.store_scope : predictedScope(form.country);
  const saving = createStore.isPending || updateStore.isPending || uploadLogo.isPending;

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={backToStores}
            className="mt-0.5 rounded-xl border border-[#e2e8f0] p-2.5 transition hover:bg-[#f8fafc] dark:border-white/10 dark:hover:bg-white/5"
            aria-label="Back to stores"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-2xl font-semibold">{mode === "create" ? "Add New Store" : "Manage Store"}</h2>
            <p className="mt-1 text-sm text-[#64748b]">
              {mode === "create" ? "Create another selling location for your business." : "Update this store's identity, contact details and physical location."}
            </p>
          </div>
        </div>
        {selectedStore && (
          <Link
            href="/shop-with-sidebar"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold dark:border-white/10"
          >
            <ExternalLink size={16} /> View storefront
          </Link>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section icon={StoreIcon} title="Store Information" description="The public identity and support contacts for this store.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Store name" required value={form.store_name} onChange={(value) => setForm({ ...form, store_name: value })} />
            <Field label="Store slug" value={selectedStore?.slug || "Generated after store creation"} disabled />
            <Field label="Support email" type="email" value={form.contact_email} onChange={(value) => setForm({ ...form, contact_email: value })} />
            <Field label="Support phone" value={form.contact_phone} onChange={(value) => setForm({ ...form, contact_phone: value })} />
            <Field label="WhatsApp phone" value={form.whatsapp_phone} onChange={(value) => setForm({ ...form, whatsapp_phone: value })} />
            <Field label="Website" type="url" value={form.website_url} onChange={(value) => setForm({ ...form, website_url: value })} placeholder="https://example.com" />
          </div>
          <label className="mt-4 block text-sm font-semibold">
            Store description
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={5}
              className="mt-2 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 font-normal outline-none focus:border-[#f7941d] dark:border-white/10 dark:bg-white/5"
              placeholder="Tell customers about this store..."
            />
          </label>
        </Section>

        <Section icon={MapPin} title="Store Location" description="The physical origin of products sold from this store.">
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Store classification</p>
              <p className="mt-1 text-xs text-[#64748b]">Tanzania is LOCAL. Any country outside Tanzania is GLOBAL. The backend verifies this automatically.</p>
            </div>
            <ScopeBadge scope={scope} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Country"
              required
              value={form.country}
              options={STORE_COUNTRIES.map((country) => ({ value: country.value, label: country.label }))}
              onChange={(value) => {
                setForm((current) => ({ ...current, country: value, region: "", district: "", ward: "", latitude: "", longitude: "" }));
                setRegionOptions([]);
                setDistrictOptions([]);
                setWardOptions([]);
              }}
            />
            <LocationCombobox
              id="store-region"
              label={scope === "local" ? "Region" : "State / Province / Emirate"}
              value={form.region}
              options={regionOptions}
              loading={locationLoading}
              placeholder={scope === "local" ? "Select official region" : "Select or type a state / province"}
              strict={scope === "local"}
              onChange={(value) => {
                setForm((current) => ({ ...current, region: value, district: "", ward: "" }));
                setDistrictOptions([]);
                setWardOptions([]);
              }}
            />
            <LocationCombobox
              id="store-district"
              label={scope === "local" ? "District / Municipality" : "City"}
              value={form.district}
              options={districtOptions}
              loading={locationLoading}
              disabled={!form.region}
              placeholder={scope === "local" ? "Select district / municipality" : "Select or type a city"}
              strict={scope === "local"}
              onChange={(value) => {
                setForm((current) => ({ ...current, district: value, ward: "" }));
                setWardOptions([]);
              }}
            />
            {scope === "local" ? (
              <LocationCombobox
                id="store-ward"
                label="Ward"
                value={form.ward}
                options={wardOptions}
                loading={locationLoading}
                disabled={!form.district}
                placeholder="Select ward"
                strict
                onChange={(value) => setForm((current) => ({ ...current, ward: value }))}
              />
            ) : (
              <Field
                label="Area / Neighborhood"
                value={form.ward}
                onChange={(value) => setForm((current) => ({ ...current, ward: value }))}
                placeholder="Type the full area or neighborhood name"
              />
            )}
            <div className="md:col-span-2">
              <Field label="Street / physical address" value={form.street} onChange={(value) => setForm({ ...form, street: value })} placeholder="Building, road, block, shop number..." />
            </div>
          </div>
          <StorePickupPin
            country={form.country}
            countryCode={
              STORE_COUNTRIES.find((item) => item.value === form.country)?.countryCode
            }
            latitude={form.latitude}
            longitude={form.longitude}
            onCoordinatesConfirmed={(latitude, longitude) => {
              setForm((current) => ({
                ...current,
                latitude: String(latitude),
                longitude: String(longitude),
              }));
            }}
            onResolved={(location) => {
              setForm((current) => {
                const local = predictedScope(location.country || current.country) === "local";
                const matchedRegion = local ? canonicalOption(location.region, regionOptions) : (location.region || current.region);
                const matchedDistrict = local
                  ? canonicalOption(location.district || location.city, districtOptions)
                  : (location.city || location.district || current.district);
                const matchedWard = local ? canonicalOption(location.ward, wardOptions) : (location.ward || current.ward);
                return {
                  ...current,
                  country: location.country || current.country,
                  // For Tanzanian stores the map may call an area such as POSTA a
                  // "region". Never replace the official F7 hierarchy with that raw label.
                  region: matchedRegion || current.region,
                  district: matchedDistrict || current.district,
                  ward: matchedWard || current.ward,
                  street: location.street || location.formatted_address || current.street,
                  latitude: String(location.latitude),
                  longitude: String(location.longitude),
                };
              });
            }}
          />
          {locationError && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              {locationError}
            </p>
          )}
          <p className="mt-3 text-xs text-[#64748b]">
            For Tanzania, Region, District and Ward use official dropdown values so Xerin Express can match the store origin to Admin domestic service standards. The map is used for the exact pickup pin and address only.
          </p>
        </Section>

        {mode === "create" && (
          <Section icon={ImageIcon} title="Store Logo" description="Choose a logo for this store. It will be uploaded automatically after the store is created.">
            <CreateLogoPicker file={createLogoFile} onSelect={setCreateLogoFile} />
          </Section>
        )}

        {mode === "edit" && selectedStore && (
          <Section icon={ImageIcon} title="Store Media" description="Upload a logo and banner specifically for this store.">
            <div className="grid gap-6 md:grid-cols-2">
              <FileUploader label="Store logo" currentUrl={selectedStore.logo_url} onUpload={handleLogoUpload} uploading={uploadLogo.isPending} ratio="square" />
              <FileUploader label="Store banner" currentUrl={selectedStore.banner_url} onUpload={handleBannerUpload} uploading={uploadBanner.isPending} ratio="wide" />
            </div>
          </Section>
        )}

        {selectedStore && (
          <Section icon={CheckCircle2} title="Store Status" description="Status values are controlled by the backend and seller approval flow.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatusItem label="Status" value={formatStatus(selectedStore.status)} />
              <StatusItem label="Scope" value={selectedStore.store_scope.toUpperCase()} />
              <StatusItem label="Verified" value={selectedStore.is_verified ? "Yes" : "No"} />
              <StatusItem label="Accepting orders" value={selectedStore.accept_orders ? "Yes" : "No"} />
            </div>
          </Section>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={backToStores} className="rounded-xl border border-[#e2e8f0] px-5 py-2.5 text-sm font-semibold dark:border-white/10">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-xl bg-[#f7941d] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {saving ? "Saving..." : mode === "create" ? "Create store" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function StoreList({ stores, onCreate, onEdit }: { stores: Store[]; onCreate: () => void; onEdit: (store: Store) => void }) {
  const localCount = stores.filter((store) => store.store_scope === "local").length;
  const globalCount = stores.filter((store) => store.store_scope === "global").length;

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">My Stores</h2>
          <p className="mt-1 text-sm text-[#64748b]">Manage all physical selling locations connected to your seller account.</p>
        </div>
        <button type="button" onClick={onCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f7941d] px-5 py-2.5 text-sm font-semibold text-white">
          <Plus size={17} /> Add Store
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total stores" value={stores.length} icon={StoreIcon} />
        <SummaryCard label="Local stores" value={localCount} icon={MapPin} />
        <SummaryCard label="Global stores" value={globalCount} icon={Globe2} />
      </div>

      {stores.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-white px-6 py-16 text-center dark:border-white/15 dark:bg-[#1f2937]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#f7941d] dark:bg-orange-400/10">
            <StoreIcon size={27} />
          </span>
          <h3 className="mt-4 text-lg font-bold">No stores yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#64748b]">Create your first store and define where it is physically located. Tanzania stores are local; stores outside Tanzania are global.</p>
          <button type="button" onClick={onCreate} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#f7941d] px-5 py-2.5 text-sm font-semibold text-white">
            <Plus size={17} /> Create first store
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {stores.map((store) => (
            <StoreCard key={String(store.id)} store={store} onEdit={() => onEdit(store)} />
          ))}
        </div>
      )}
    </div>
  );
}

function StoreCard({ store, onEdit }: { store: Store; onEdit: () => void }) {
  const location = [store.district, store.region, store.country].filter(Boolean).join(", ") || "Location not configured";

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
      <div className="relative h-28 bg-[#f8fafc] dark:bg-white/5">
        {store.banner_url ? <img src={resolveStoreMediaUrl(store.banner_url)} alt={`${store.store_name} banner`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#cbd5e1]"><ImageIcon size={32} /></div>}
        <div className="absolute right-3 top-3"><ScopeBadge scope={store.store_scope} /></div>
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e2e8f0] bg-white dark:border-white/10 dark:bg-[#111827]">
            {store.logo_url ? <img src={resolveStoreMediaUrl(store.logo_url)} alt={`${store.store_name} logo`} className="h-full w-full object-cover" /> : <StoreIcon size={22} className="text-[#f7941d]" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold">{store.store_name}</h3>
            <p className="mt-1 flex items-start gap-1.5 text-xs text-[#64748b]">
              <MapPin size={13} className="mt-0.5 shrink-0" />
              <span>{location}</span>
            </p>
            {store.latitude != null && store.longitude != null ? (
              <p className="mt-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                Pickup GPS: {Number(store.latitude).toFixed(6)}, {Number(store.longitude).toFixed(6)}
              </p>
            ) : (
              <p className="mt-1.5 text-[11px] font-medium text-amber-600">
                Pickup GPS not configured
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[#e2e8f0] pt-4 dark:border-white/10">
          <span className="text-xs font-semibold text-[#64748b]">{formatStatus(store.status)}</span>
          <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] px-3.5 py-2 text-sm font-semibold transition hover:border-[#f7941d] hover:text-[#f7941d] dark:border-white/10">
            <Pencil size={15} /> Manage
          </button>
        </div>
      </div>
    </article>
  );
}

function ScopeBadge({ scope }: { scope: "local" | "global" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${scope === "local" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300" : "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300"}`}>
      {scope === "local" ? <MapPin size={13} /> : <Globe2 size={13} />}
      {scope.toUpperCase()}
    </span>
  );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof StoreIcon }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937]">
      <span className="rounded-xl bg-orange-50 p-3 text-[#f7941d] dark:bg-orange-400/10"><Icon size={21} /></span>
      <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-[#64748b]">{label}</p></div>
    </div>
  );
}

function StorePickupPin({
  country,
  countryCode,
  latitude,
  longitude,
  onResolved,
  onCoordinatesConfirmed,
}: {
  country: string;
  countryCode?: string;
  latitude: string;
  longitude: string;
  onResolved: (location: MapResolvedLocation) => void;
  onCoordinatesConfirmed: (latitude: number, longitude: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ place_id: string; description: string; main_text?: string | null; secondary_text?: string | null }>>([]);
  const [busy, setBusy] = useState(false);
  const [currentLocationBusy, setCurrentLocationBusy] = useState(false);
  const [manualLatitude, setManualLatitude] = useState(latitude);
  const [manualLongitude, setManualLongitude] = useState(longitude);
  const [editingLocation, setEditingLocation] = useState(!latitude || !longitude);

  useEffect(() => {
    setManualLatitude(latitude);
    setManualLongitude(longitude);

    // Keep the editor in sync with the currently selected store.
    // This matters when a seller switches from a store that already has GPS
    // to another store (for example Dubai) that does not have a pin yet.
    setEditingLocation(!(latitude && longitude));
  }, [latitude, longitude]);

  useEffect(() => {
    const clean = query.trim();
    if (clean.length < 3) { setResults([]); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const found = await usersApi.searchMapPlaces(
          clean,
          countryCode,
          controller.signal,
        );
        setResults(found);
      } catch {
        if (!controller.signal.aborted) setResults([]);
      }
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, country, countryCode]);

  async function resolveCoordinates(
    lat: number,
    lng: number,
    successMessage: string,
  ) {
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90.");
      return;
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180.");
      return;
    }

    // Save the GPS point immediately. Reverse-geocoding is only an optional
    // address enhancement and must never block the seller from saving a valid
    // store shipping origin.
    onCoordinatesConfirmed(lat, lng);
    setManualLatitude(String(lat));
    setManualLongitude(String(lng));
    setEditingLocation(false);
    toast.success(successMessage);

    setBusy(true);
    try {
      const resolved = await usersApi.reverseGeocode(lat, lng);
      onResolved(resolved);
      setQuery(resolved.formatted_address || resolved.display_name || "");
      setResults([]);
    } catch {
      // Coordinates are already confirmed. Keep them even if Google address
      // resolution is temporarily unavailable.
      setQuery(`${lat}, ${lng}`);
    } finally {
      setBusy(false);
    }
  }

  async function choose(placeId: string) {
    setBusy(true);
    try {
      const resolved = await usersApi.getMapPlace(placeId, countryCode);
      onResolved(resolved);
      setQuery(resolved.formatted_address);
      setManualLatitude(String(resolved.latitude));
      setManualLongitude(String(resolved.longitude));
      setEditingLocation(false);
      setResults([]);
      toast.success("Store pickup point confirmed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to resolve store location");
    } finally { setBusy(false); }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("This browser does not support current-location detection.");
      return;
    }

    setCurrentLocationBusy(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void resolveCoordinates(
          position.coords.latitude,
          position.coords.longitude,
          "Store pickup coordinates saved from your current location.",
        ).finally(() => setCurrentLocationBusy(false));
      },
      (error) => {
        setCurrentLocationBusy(false);
        const message = error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Allow browser location access or use search/manual coordinates."
          : "Unable to read your current location. Use search or manual coordinates instead.";
        toast.error(message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  }

  function useManualCoordinates() {
    const lat = Number(manualLatitude);
    const lng = Number(manualLongitude);
    if (!manualLatitude.trim() || !manualLongitude.trim()) {
      toast.error("Enter both latitude and longitude.");
      return;
    }
    void resolveCoordinates(lat, lng, "Store pickup coordinates saved.");
  }

  const confirmed = Boolean(latitude && longitude);
  const mapsQuery = confirmed
    ? `${latitude},${longitude}`
    : query.trim() || country || "";
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

  return (
    <div className="mt-5 rounded-2xl border-2 border-[#f7941d]/30 bg-orange-50/40 p-4 dark:border-orange-400/20 dark:bg-orange-400/5 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7941d] text-white"><MapPin size={18} /></span>
        <div>
          <p className="text-sm font-bold">Store shipping origin / pickup map point <span className="text-red-500">*</span></p>
          <p className="mt-1 text-xs leading-5 text-[#64748b]">
            Logistics distance starts from this exact store—not from your seller profile or another store.
            Set the warehouse/shop where products assigned to this store are collected.
          </p>
          <p className="mt-1 text-xs font-semibold text-[#f7941d]">
            Map search country: {country || "Select the store country first"}
            {countryCode ? ` (${countryCode})` : ""}
          </p>
        </div>
      </div>

      {editingLocation && (
        <>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={busy || currentLocationBusy}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3 text-sm font-semibold transition hover:border-[#f7941d] hover:text-[#f7941d] disabled:opacity-60 dark:border-white/10 dark:bg-white/5"
          >
            {currentLocationBusy ? <Loader2 className="animate-spin" size={16} /> : <Crosshair size={16} />}
            Use current location
          </button>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-3 text-sm font-semibold transition hover:border-[#f7941d] hover:text-[#f7941d] dark:border-white/10 dark:bg-white/5"
          >
            <Navigation size={16} /> Open Google Maps
          </a>
          <div className="flex min-h-11 items-center justify-center rounded-xl bg-white px-3 text-center text-xs text-[#64748b] dark:bg-white/5">
            Search below or enter coordinates manually
          </div>
        </div>
  
        <div className="relative mt-4">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search exact shop, warehouse, road or landmark in ${country || "the store country"}`}
            className="h-12 w-full rounded-xl border border-[#e2e8f0] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#f7941d] dark:border-white/10 dark:bg-white/5"
          />
          {results.length > 0 && (
            <div className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border bg-white p-1 shadow-xl dark:border-white/10 dark:bg-[#1f2937]">
              {results.map((item) => (
                <button
                  type="button"
                  key={item.place_id}
                  onClick={() => void choose(item.place_id)}
                  className="block min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <b className="block">{item.main_text || item.description}</b>
                  {item.secondary_text && <span className="text-xs text-slate-500">{item.secondary_text}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
  
        <div className="mt-4 rounded-xl border border-[#e2e8f0] bg-white p-3 dark:border-white/10 dark:bg-white/5">
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748b]">Manual coordinates</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              type="number"
              step="any"
              min={-90}
              max={90}
              value={manualLatitude}
              onChange={(e) => setManualLatitude(e.target.value)}
              placeholder="Latitude e.g. 25.2048"
              className="h-11 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 text-sm outline-none focus:border-[#f7941d] dark:border-white/10 dark:bg-white/5"
            />
            <input
              type="number"
              step="any"
              min={-180}
              max={180}
              value={manualLongitude}
              onChange={(e) => setManualLongitude(e.target.value)}
              placeholder="Longitude e.g. 55.2708"
              className="h-11 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 text-sm outline-none focus:border-[#f7941d] dark:border-white/10 dark:bg-white/5"
            />
            <button
              type="button"
              onClick={useManualCoordinates}
              disabled={busy}
              className="min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-bold text-black disabled:opacity-60 dark:bg-white dark:text-slate-900"
            >
              Confirm coordinates
            </button>
          </div>
        </div>
  
          </>
      )}

      {(busy || currentLocationBusy) && (
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500"><Loader2 className="animate-spin" size={14} /> Resolving exact address…</p>
      )}

      {confirmed ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <div className="flex flex-wrap items-center gap-2">
            <CheckCircle2 size={15} />
            <b>Store shipping origin confirmed</b>
            <span>{Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}</span>
          </div>
          <p className="mt-1.5 leading-5">
            Products assigned to this store will use this point as the Google road-distance origin.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setManualLatitude(latitude);
                setManualLongitude(longitude);
                setEditingLocation(true);
              }}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 font-bold text-emerald-800 hover:border-[#f7941d] hover:text-[#f7941d] dark:border-emerald-500/30 dark:bg-white/5 dark:text-emerald-200"
            >
              <Pencil size={14} /> Edit pickup location
            </button>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 font-bold text-emerald-800 hover:border-[#f7941d] hover:text-[#f7941d] dark:border-emerald-500/30 dark:bg-white/5 dark:text-emerald-200"
            >
              <Navigation size={14} /> View on Google Maps
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <p>
            This store does not have a shipping-origin pin yet. Checkout will block logistics pricing until you confirm one.
          </p>
          {!editingLocation && (
            <button
              type="button"
              onClick={() => setEditingLocation(true)}
              className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg bg-amber-700 px-3 font-bold text-white"
            >
              <MapPin size={14} /> Set pickup location now
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, description, children }: { icon: typeof StoreIcon; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1f2937] sm:p-6">
      <div className="mb-5 flex gap-3">
        <span className="rounded-xl bg-orange-50 p-2.5 text-[#f7941d] dark:bg-orange-400/10"><Icon size={21} /></span>
        <div><h3 className="font-bold">{title}</h3><p className="text-sm text-[#64748b]">{description}</p></div>
      </div>
      {children}
    </div>
  );
}

function SelectField({ label, value, options, onChange, required }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold">
      {label}{required && <span className="text-red-500"> *</span>}
      <select
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 font-normal outline-none focus:border-[#f7941d] dark:border-white/10 dark:bg-[#111827]"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function LocationCombobox({ id, label, value, options, onChange, placeholder, disabled, loading, strict = false }: { id: string; label: string; value: string; options: string[]; onChange: (value: string) => void; placeholder?: string; disabled?: boolean; loading?: boolean; strict?: boolean }) {
  const values = strict ? options : (value && !options.includes(value) ? [value, ...options] : options);
  const hasDropdownOptions = strict || values.length > 0;

  return (
    <label className="block text-sm font-semibold" htmlFor={id}>
      {label}
      <div className="relative mt-2">
        {hasDropdownOptions ? (
          <select
            id={id}
            value={value}
            disabled={disabled || loading}
            onChange={(event) => onChange(event.target.value)}
            className="w-full appearance-auto rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 pr-10 font-normal outline-none focus:border-[#f7941d] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5"
          >
            <option value="">{loading ? "Loading locations..." : placeholder || "Select location"}</option>
            {values.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            value={value}
            disabled={disabled}
            placeholder={loading ? "Loading locations..." : placeholder}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 pr-10 font-normal outline-none focus:border-[#f7941d] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5"
          />
        )}
        {loading && <Loader2 size={16} className="pointer-events-none absolute right-3 top-3.5 animate-spin text-[#f7941d]" />}
      </div>
    </label>
  );
}

function Field({ label, value, onChange, disabled, required, type = "text", placeholder }: { label: string; value: string; onChange?: (value: string) => void; disabled?: boolean; required?: boolean; type?: string; placeholder?: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}{required && <span className="text-red-500"> *</span>}
      <input
        type={type}
        value={value}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className="mt-2 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 font-normal outline-none focus:border-[#f7941d] disabled:cursor-not-allowed disabled:opacity-65 dark:border-white/10 dark:bg-white/5"
      />
    </label>
  );
}

function CreateLogoPicker({ file, onSelect }: { file: File | null; onSelect: (file: File | null) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">Store logo</p>
      <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] dark:border-white/15 dark:bg-white/5">
        <ImageIcon size={32} className="text-[#94a3b8]" />
      </div>

      {file && (
        <div className="mt-3 max-w-md rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="font-semibold text-emerald-800 dark:text-emerald-200">Logo selected</p>
          <p className="mt-1 truncate text-xs text-emerald-700 dark:text-emerald-300">{file.name}</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <label className="inline-block">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => onSelect(event.target.files?.[0] ?? null)}
            className="hidden"
          />
          <span className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#e2e8f0] px-4 py-2 text-sm font-semibold dark:border-white/10">
            {file ? "Change logo" : "Choose logo"}
          </span>
        </label>

        {file && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="rounded-xl border border-[#e2e8f0] px-4 py-2 text-sm font-semibold text-[#64748b] dark:border-white/10"
          >
            Remove
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-[#64748b]">Accepted formats: JPG, PNG or WebP. The file uploads after the store is created.</p>
    </div>
  );
}

function FileUploader({ label, currentUrl, onUpload, uploading, ratio }: { label: string; currentUrl: string | null; onUpload: (file: File) => void; uploading: boolean; ratio: "square" | "wide" }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className={`flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] dark:border-white/15 dark:bg-white/5 ${ratio === "wide" ? "h-32 w-full" : "h-32 w-32"}`}>
        {currentUrl ? <img src={resolveStoreMediaUrl(currentUrl)} alt={label} className="h-full w-full object-cover" /> : <ImageIcon size={32} className="text-[#94a3b8]" />}
      </div>
      <label className="mt-2 inline-block">
        <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0])} className="hidden" />
        <span className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#e2e8f0] px-4 py-2 text-sm font-semibold dark:border-white/10 ${uploading ? "opacity-60" : ""}`}>
          {uploading ? "Uploading..." : `Upload ${label.toLowerCase()}`}
        </span>
      </label>
    </div>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[#f8fafc] p-4 dark:bg-white/5"><p className="text-xs text-[#64748b]">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>;
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function apiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    if (response?.data?.detail) return response.data.detail;
  }
  return fallback;
}
