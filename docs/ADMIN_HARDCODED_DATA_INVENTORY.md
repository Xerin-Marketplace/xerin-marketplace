# Admin hardcoded-data inventory

Audit scope: `src/components/Admin/**`, admin routes, admin API services, backend FastAPI routers and generated OpenAPI.

| File / component | Displayed information | Previous source | Required backend source | Available endpoint | Status |
|---|---|---|---|---|---|
| `Admin/Dashboard` | Admin wallet, commission, delivery charge, tax, pending amount | Literal currency values | Finance summary | None | Removed; unavailable state |
| `Admin/Dashboard` | Auction wallet and earnings | Literal currency values/zeros | Auction finance summary | None | Removed; unavailable state |
| `Admin/Dashboard` | Platform health and “Live” state | Static labels | Health/system summary | Only root health and separate system lists | Removed as business status |
| `Admin/Dashboard` | Users and moderation queues | API results | Users metadata, pending sellers/products | `/admin/users`, `/admin/sellers/pending`, `/admin/products/pending` | Integrated; errors no longer render zeros |
| `Admin/Catalog/Dashboard` | Product/stock/review totals | Fetch-all then browser counting, initialized zeros | Admin catalog summary | None | Must show unavailable; categories/brands remain separately integrated |
| `Admin/Products` | Full product table and totals | Non-existent `/admin/products` | Full admin product API | Pending-only moderation endpoints exist | Partial; full management is a backend gap |
| `Admin/Catalog/Reviews` | Review moderation mutations | Non-existent PATCH/DELETE routes | Review moderation API | `GET /admin/reviews` only | Read-only; mutation actions must be disabled |
| `Admin/Finance` | Revenue, commission, payouts and transactions | Non-existent `/admin/finance/*`; initial zeros | Finance summary/ledger | None | Removed; unavailable state |
| `Admin/Finance` | Payment providers | Literal M-Pesa/Stripe/banks/USSD array | Payment aggregation | `/admin/payment-methods` | Replaced by existing Payments module |
| `Admin/Analytics` | Sales/order/customer/product metrics | Non-existent analytics overview; initial zeros | Analytics summary | `/admin/reports/{report_type}` | Replaced by real reports |
| `Admin/Inventory/**` | Inventory summary, warehouses, adjustments, movements | Non-existent `/admin/inventory*` and `/admin/warehouses*` | Cross-seller inventory APIs | Seller-owned `/inventory/*` only | Unavailable state; no fake empty inventory |
| `Admin/Disputes` | Dispute records | Non-existent `/admin/disputes` | Dispute service | None | Unavailable state |
| `Admin/Orders` | Tracking, cancellation and refund actions | Non-existent admin routes | Tracking/cancellation/refund mutations | List/detail/shared status only | Partial; unsupported actions disabled/documented |
| `Admin/Customers/CustomerDetails` | Wishlist, notes, login history and nested resources | Non-existent nested customer calls | Customer detail subresources | Only customer detail, global addresses/reviews/support | Partial; missing tabs are backend gaps |
| `Admin/Communications` | Messages | API | `/communications` | Available | Integrated |
| `Admin/Promotions` | Coupons, discounts, campaigns | API | `/coupons`, `/promotions/*` | Available | Integrated |
| `Admin/UserManagement` | Users, roles, permissions, sessions and metrics | API arrays and response counts | `/admin/access-*`, `/admin/active-sessions` | Available | Integrated |
| `Admin/SystemManagement` | Logs, events, jobs and settings | API arrays | `/system/*` | Available | Integrated |
| `Admin/SystemManagement` | Marketplace name, support email, maintenance mode, seller registration, currency and auto-cancel hours | Frontend fallback settings | Persisted application settings | `GET /system/settings` | Frontend defaults removed; backend-only |
| `Admin/Reports` | Metrics, breakdown and report rows | API report payload | `/admin/reports/{type}` | Available | Integrated |

UI-only constants such as navigation tabs, valid status options, form defaults, colors and labels are not business data and remain in the frontend.

## Validation results

- TypeScript: `npx tsc --noEmit` passed.
- Production build: `npm run build` passed with 70 generated routes.
- Lint: the existing `npm run lint` script fails before linting because Next.js 16 no longer supports the configured `next lint` command. This is a project-tooling gap, not a reported source-code lint violation.
- Git whitespace validation: `git diff --check` passed.
