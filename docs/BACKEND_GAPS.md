# Backend gaps blocking complete frontend integration

These are specifications only. No fake endpoints or fake success behavior were added.

| Priority | Frontend module | Missing operation | Suggested contract | Permission / business rule |
|---|---|---|---|---|
| P0 | Seller registration | Public active business-category lookup | `GET /business-categories?active=true` | Public; return IDs accepted by seller registration |
| P0 | Admin products | Full paginated admin list/detail/update/archive | `GET /admin/products`, `GET/PATCH/DELETE /admin/products/{id}` | `products:read/update/delete`; include all moderation statuses |
| P0 | Seller orders | Seller-scoped list/detail and fulfilment transitions | `GET /seller/orders`, `GET/PATCH /seller/orders/{id}` | Seller sees only own order items; enforce payment and transition rules |
| P0 | Seller dashboard summary | Authoritative product/order/KYC/store/finance totals and workflow state | `GET /sellers/dashboard/summary` | Seller-owned aggregates; distinguish unavailable data from valid zeros |
| P0 | Admin inventory | Cross-seller inventory summary and read APIs | `GET /admin/inventory`, `/summary`, `/low-stock` | `inventory:read`; must not reuse seller ownership endpoint |
| P1 | Warehouses | CRUD, inventory detail, stock movement and transfer | `/admin/warehouses`, `/admin/inventory/movements`, `/admin/stock-transfers` | Inventory permissions; prevent invalid deletion/negative stock |
| P1 | Wishlist | Buyer list/add/remove/move-to-cart | `/wishlist`, `/wishlist/items` | Buyer-owned; product availability revalidated |
| P1 | Buyer dashboard summary | Cart/order/address/payment/notification totals and recent activity | `GET /buyer/dashboard/summary` | Buyer-owned aggregates; return explicit valid zeros and partial capability state |
| P1 | Reviews | Buyer CRUD, eligibility and admin moderation mutations | `/reviews`, `/reviews/eligible`, `/admin/reviews/{id}` | Only delivered purchases can review; moderation permission |
| P1 | Notifications | Buyer/seller notification list/read/preferences | `/notifications`, `/notification-preferences` | Account-scoped; no cross-account cache exposure |
| P1 | Buyer verification/security | Phone verification status/workflow and 2FA enrollment/challenge | `/users/me/phone-verification`, `/auth/2fa/*` | Verified ownership, rate limits and recovery audit required |
| P1 | Seller finance | Earnings summary, settlements and payout history | `/sellers/earnings`, `/sellers/payouts` | Seller-owned; distinguish pending/available/paid balances |
| P1 | Seller product pagination | Total metadata, search, status filter and deterministic sort | Extend `GET /products/my-products` | Seller-owned; return paginated metadata without requiring fetch-all |
| P1 | Payout accounts | Update, set default, verify | `PATCH /sellers/payout-accounts/{id}`, `POST .../{id}/default` | Sensitive changes require verification/audit |
| P2 | Seller operations | Returns, cancellations, messages, reviews and promotions | Seller-scoped resources | Seller ownership and explicit transition rules |
| P2 | Seller notifications | Notification list, unread count and persisted preferences | `/seller/notifications`, `/seller/notification-preferences` | Seller-owned; no fake unread badges or local-only saves |
| P2 | Admin customer detail | Nested orders, payments, notes, login history and wishlist | `/admin/customers/{id}/...` | `users:view/update`; notes must be audited |
| P2 | Admin customer support | Ticket detail, assignment and status transitions | `GET/PATCH /admin/support-tickets/{id}` | Support permission; assignment and resolution changes must be audited |
| P2 | Admin order operations | Tracking, cancellation and order-level refund workflows | `/admin/orders/{id}/tracking`, `/cancel`, `/refund` or equivalent shared contracts | Enforce payment, shipping and refund transition rules |
| P2 | Finance/disputes | Finance summary/transactions and dispute workflow | `/admin/finance/*`, `/admin/disputes/*` | Finance/dispute permissions; immutable audit history |
| P2 | Storefront discovery | Featured, new-arrival, best-seller and recommendations | `/catalog/featured`, `/catalog/recommendations` or supported product sort flags | Only approved active in-stock products |

Until these contracts exist, affected UI actions should be disabled or show “This feature is not available yet”; they must not return simulated success.

## Backend contract mismatches discovered during the admin audit

- The pending-product handler references `ProductStatus.pending_recan_can_view`; this does not match the normal pending-review lifecycle naming and can make the moderation queue unreliable. The backend enum/query should be corrected and covered by an integration test.
- The customer-detail response currently supplies empty review, wishlist, login-history and note collections and zero counters without persisted source queries. The Admin UI no longer presents those zeros as confirmed business facts.
- Reviews and support tickets expose list endpoints but no corresponding admin mutation endpoints. Their admin screens are therefore intentionally read-only.
