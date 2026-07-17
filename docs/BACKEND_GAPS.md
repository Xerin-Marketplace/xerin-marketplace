# Backend gaps blocking complete frontend integration

These are specifications only. No fake endpoints or fake success behavior were added.

| Priority | Frontend module | Missing operation | Suggested contract | Permission / business rule |
|---|---|---|---|---|
| P0 | Seller registration | Public active business-category lookup | `GET /business-categories?active=true` | Public; return IDs accepted by seller registration |
| P0 | Admin products | Full paginated admin list/detail/update/archive | `GET /admin/products`, `GET/PATCH/DELETE /admin/products/{id}` | `products:read/update/delete`; include all moderation statuses |
| P0 | Seller orders | Seller-scoped list/detail and fulfilment transitions | `GET /seller/orders`, `GET/PATCH /seller/orders/{id}` | Seller sees only own order items; enforce payment and transition rules |
| P0 | Admin inventory | Cross-seller inventory summary and read APIs | `GET /admin/inventory`, `/summary`, `/low-stock` | `inventory:read`; must not reuse seller ownership endpoint |
| P1 | Warehouses | CRUD, inventory detail, stock movement and transfer | `/admin/warehouses`, `/admin/inventory/movements`, `/admin/stock-transfers` | Inventory permissions; prevent invalid deletion/negative stock |
| P1 | Wishlist | Buyer list/add/remove/move-to-cart | `/wishlist`, `/wishlist/items` | Buyer-owned; product availability revalidated |
| P1 | Reviews | Buyer CRUD, eligibility and admin moderation mutations | `/reviews`, `/reviews/eligible`, `/admin/reviews/{id}` | Only delivered purchases can review; moderation permission |
| P1 | Notifications | Buyer/seller notification list/read/preferences | `/notifications`, `/notification-preferences` | Account-scoped; no cross-account cache exposure |
| P1 | Seller finance | Earnings summary, settlements and payout history | `/sellers/earnings`, `/sellers/payouts` | Seller-owned; distinguish pending/available/paid balances |
| P1 | Payout accounts | Update, set default, verify | `PATCH /sellers/payout-accounts/{id}`, `POST .../{id}/default` | Sensitive changes require verification/audit |
| P2 | Seller operations | Returns, cancellations, messages, reviews and promotions | Seller-scoped resources | Seller ownership and explicit transition rules |
| P2 | Admin customer detail | Nested orders, payments, notes, login history and wishlist | `/admin/customers/{id}/...` | `users:view/update`; notes must be audited |
| P2 | Finance/disputes | Finance summary/transactions and dispute workflow | `/admin/finance/*`, `/admin/disputes/*` | Finance/dispute permissions; immutable audit history |
| P2 | Storefront discovery | Featured, new-arrival, best-seller and recommendations | `/catalog/featured`, `/catalog/recommendations` or supported product sort flags | Only approved active in-stock products |

Until these contracts exist, affected UI actions should be disabled or show “This feature is not available yet”; they must not return simulated success.
