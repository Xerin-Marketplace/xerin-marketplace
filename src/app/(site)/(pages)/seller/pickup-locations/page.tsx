import RouteGuard from "@/guards/RouteGuard";
import SellerPickupLocations from "@/components/Seller/PickupLocations";

export const metadata = { title: "Pickup Locations | Seller Center" };
export default function Page() { return <RouteGuard accountTypes={["seller"]} fallbackPath="/my-account"><SellerPickupLocations /></RouteGuard>; }
