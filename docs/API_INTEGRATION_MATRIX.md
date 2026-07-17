# Frontend-to-backend integration matrix

Status meanings: **Integrated** uses the actual contract; **Mismatch** is a frontend path or shape that must change; **Gap** has no equivalent backend operation; **Static marketing** is intentional non-operational content.

| Frontend module/page | Current frontend contract | Actual backend contract | Auth / role or permission | Status / action |
|---|---|---|---|---|
| Sign in | `POST /auth/login` | Same; JSON email/password; token response includes user roles, permissions and account type | Public | Integrated |
| Token refresh | `POST /auth/refresh-token` | Same; `{ refresh_token }` | Public with refresh token | Integrated; central interceptor rotates tokens |
| Buyer registration | `POST /auth/register` | Same | Public | Integrated |
| Seller registration | `/auth/register-seller` plus `/sellers/business-categories` lookup | Register path is correct; category lookup path does not exist publicly | Public | Partial; category discovery is a backend gap |
| Current user/profile | `GET/PATCH /users/me` | Same | `profile:view` / `profile:update` | Integrated |
| Active account sessions | `/users/me/sessions` | Same | Profile permissions | Integrated |
| Public products | `GET /products` | Same; `skip`, `limit`, category, brand, search/status filters supported by router | Public | Integrated; static error fallback removed |
| Product details | `GET /products/{id}` | Same, ID based | Public | Integrated |
| Categories/brands | `/products/categories`, `/products/brands` | Same | Public | Integrated |
| Global search | product list query | `GET /products?search=...` | Public | Partial; header search still needs unified URL/query UX |
| Home featured/new/best seller | local storefront arrays | No dedicated summary/recommendation endpoint; product list can supply only general active catalog | Public | Partial; static marketing must not masquerade as API data |
| Buyer cart | persisted Zustand product objects | `/cart` and `/cart/items` require IDs/quantity and return authoritative totals | Buyer auth | Mismatch; typed service/hooks added, component migration remains |
| Guest cart | local persisted items | No guest-cart backend API | Guest | Local capability, merge-on-login is a gap |
| Wishlist | persisted Zustand | No wishlist routes | Buyer auth | Gap; must remain local and be identified as device-local |
| Buyer addresses | `/addresses` | Same; paginated list | Buyer with `addresses:manage` | Integrated |
| Buyer orders | direct `GET /orders/my-orders` | Same; `{total,page,page_size,results}` | Authenticated user | Integrated through typed service/hooks |
| Buyer order detail | redirect-only page | `GET /orders/{id}` | Owner/admin/seller involved | Mismatch; route can be integrated |
| Buyer payments | direct `GET /payments/my-payments` | Same; plain array | Buyer auth | Integrated through typed service/hooks |
| Buyer reviews | unavailable UI | No buyer review CRUD | — | Gap |
| Buyer notifications | unavailable UI | No buyer notification endpoint | — | Gap |
| Seller profile | `/sellers/me`, `/sellers/profile` | Same | Seller auth | Integrated |
| Seller store | seller UI | `GET/PATCH /stores/me`, logo/banner uploads | `store:view` / `store:update` | Partial; service coverage needed for all uploads |
| Seller KYC | KYC service | Same; multipart names match | Seller auth | Integrated |
| Seller payout accounts | payout service | Same | Seller auth | Integrated for list/create/delete; update/default/history are gaps |
| Seller products | `/products/my-products` and product CRUD | Same | Seller auth/ownership | Integrated |
| Seller inventory | UI summary | `/inventory/my-inventory`, `/inventory/low-stock`, create/update | Seller auth/ownership | Partial |
| Seller orders/returns/cancellations | operational UI | No seller-scoped order endpoint | — | Gap |
| Seller metrics/earnings/payout history | dashboard cards | No summary/earnings/payout-history endpoint | — | Gap; do not report zeros as loaded data |
| Admin users/roles/permissions/sessions | `/admin/*` | Same | granular user/permission permissions | Integrated |
| Admin customers summary/list/detail | `/admin/customers*` | Same for summary/list/detail | `users:view` | Integrated |
| Nested customer orders/payments/wishlist/notes/history | `/admin/customers/{id}/*` | No equivalent routes | — | Gap |
| Customer addresses/reviews/support listing | `/admin/customer-addresses`, `/admin/reviews`, `/admin/support-tickets` | Same, read-only | `users:view` | Integrated |
| Admin full products | `/admin/products*` | Only pending list and approve/reject exist; public `/products` is not an admin-all equivalent | Product permissions | Mismatch/gap |
| Admin pending product moderation | `/admin/products/pending`, approve/reject | Same; reject uses multipart reason | Product permissions | Integrated |
| Admin orders | `/admin/orders*` | List is `/orders/admin/all`; detail/status are `/orders/{id}` | `orders:read` plus order authorization | Mismatch; update frontend service |
| Admin payments/refunds | `/admin/payments`, methods, refunds, failed, refund | Same | `payments:read` / `payments:refund` | Integrated |
| Admin reports | `/admin/reports/{type}` | Same; sales/orders/products/inventory/customers/payments | `reports:read` | Integrated |
| Admin seller overview/moderation | `/admin/sellers*`, seller overview routes | Same | seller administration permissions | Integrated |
| Admin inventory/warehouses/movements/transfers | `/admin/inventory*`, `/admin/warehouses*` | No equivalents; backend inventory is seller-owned only | — | Gap |
| Coupons/promotions | `/coupons`, `/promotions/*` | Same | Authenticated admin operations | Integrated |
| Communications | `/communications` and send/cancel | Same | Authenticated admin operations | Integrated |
| System management | `/system/*` | Same | System permissions | Integrated |
| Admin finance/disputes/analytics overview | `/admin/finance/*`, `/admin/disputes`, `/admin/analytics/overview` | No equivalents | — | Gap; reports are not equivalent to transaction/dispute APIs |

## Confirmed response adapters

- Paginated resources: read `results`, `total`, `page`, `page_size`.
- Products, product categories/brands, buyer payments and seller-owned products return plain arrays.
- Decimal money fields arrive as JSON numbers or numeric strings; UI formatting must normalize them centrally.
- Backend errors: string `detail` or validation-array `detail`; field paths in validation errors are preserved by the central parser.
