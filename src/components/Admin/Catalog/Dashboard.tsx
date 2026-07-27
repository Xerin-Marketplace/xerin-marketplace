import UnavailableFeature from "@/components/Admin/Common/UnavailableFeature";

export default function CatalogDashboard() {
  return (
    <UnavailableFeature
      title="Catalog summary is not available yet"
      description="The backend has no admin catalog-summary endpoint. Product, stock and review totals are not calculated from incomplete browser lists. Use the Categories, Brands and Product Moderation pages for available live data."
    />
  );
}
