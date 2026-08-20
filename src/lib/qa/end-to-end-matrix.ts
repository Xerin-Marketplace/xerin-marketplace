export type QaRole = "customer" | "seller" | "logistics" | "admin";
export type QaProbe = { id: string; role: QaRole; label: string; method: "GET"; endpoint: string; frontendRoute: string; expected: string };
export const END_TO_END_PROBES: QaProbe[] = [
  { id: "customer-orders", role: "customer", label: "Customer order history", method: "GET", endpoint: "/orders/my-orders?page=1&page_size=1", frontendRoute: "/account/orders", expected: "Customer can see only their orders" },
  { id: "customer-payments", role: "customer", label: "Customer payment history", method: "GET", endpoint: "/payments/my-payments?page=1&page_size=1", frontendRoute: "/account/payments", expected: "Customer can see only their payments" },
  { id: "customer-verification", role: "customer", label: "Delivery verification", method: "GET", endpoint: "/orders/my-orders?page=1&page_size=1", frontendRoute: "/account/delivery-verification", expected: "Delivery proof is customer-scoped" },
  { id: "seller-orders", role: "seller", label: "Seller fulfilment summary", method: "GET", endpoint: "/seller/orders/summary", frontendRoute: "/seller/orders", expected: "Seller scope is enforced" },
  { id: "seller-wallet", role: "seller", label: "Seller wallet", method: "GET", endpoint: "/wallet/me", frontendRoute: "/seller/earnings", expected: "Seller wallet is isolated" },
  { id: "seller-pickups", role: "seller", label: "Seller pickup locations", method: "GET", endpoint: "/seller/pickup-locations?page=1&page_size=1", frontendRoute: "/seller/pickup-locations", expected: "Pickup locations are seller-owned" },
  { id: "logistics-dashboard", role: "logistics", label: "Logistics dashboard", method: "GET", endpoint: "/logistics/me/dashboard", frontendRoute: "/logistics/dashboard", expected: "Company membership is required" },
  { id: "logistics-shipments", role: "logistics", label: "Logistics shipments", method: "GET", endpoint: "/logistics/me/shipments?page=1&page_size=1", frontendRoute: "/logistics/shipments", expected: "Shipments are company-scoped" },
  { id: "logistics-wallet", role: "logistics", label: "Logistics wallet", method: "GET", endpoint: "/logistics/wallet/me", frontendRoute: "/logistics/wallet", expected: "Wallet is company-scoped" },
  { id: "admin-orders", role: "admin", label: "Admin marketplace orders", method: "GET", endpoint: "/orders/admin/all?page=1&page_size=1", frontendRoute: "/admin/operations/workflow", expected: "Orders require orders:read" },
  { id: "admin-finance", role: "admin", label: "Admin finance dashboard", method: "GET", endpoint: "/admin/payments/dashboard", frontendRoute: "/admin/operations/finance-flow", expected: "Finance requires dashboard permission" },
  { id: "admin-exceptions", role: "admin", label: "Admin exception queue", method: "GET", endpoint: "/admin/dashboard/operations-overview?limit=1", frontendRoute: "/admin/operations/command-center", expected: "Operations permission is required" },
];
export const RESPONSIVE_VIEWPORTS = [{ label: "Small phone", width: 320 }, { label: "Phone", width: 390 }, { label: "Tablet", width: 768 }, { label: "Laptop", width: 1280 }, { label: "Desktop", width: 1536 }];
