# Seller hardcoded-data inventory

Audit scope: `/seller/*`, `src/components/Seller/**`, seller services/types, and Xerin-Gateway seller/product/inventory/order contracts.

| File / component | Displayed data | Previous source | Backend source | Status |
|---|---|---|---|---|
| `Seller/Dashboard` | Total, active, pending and rejected product counts | Length/counts from a limited product page | No seller dashboard/product-summary endpoint | Removed; unavailable state |
| `Seller/Dashboard` | Total orders, recent orders, sales and earnings | Static unavailable copy / proposed UI | No seller-scoped order or finance endpoint | Explicit unavailable state |
| `Seller/Dashboard` | Required KYC documents and progress | Frontend `REQUIRED_DOCUMENTS` array | `GET /sellers/kyc-status` | Integrated dynamically |
| `Seller/Dashboard` | Store setup percentage and onboarding steps | Frontend checklist and computed percentage | No authoritative setup/workflow summary | Removed; unavailable state |
| `Seller/Dashboard` | Next actions | Static rules mixed with loaded state | KYC, payout, profile and recent product responses | Restricted to actions supported by successful backend data |
| `Seller/Kyc` | Required document checklist and upload choices | Frontend document-type array | `GET /sellers/kyc-status` | Integrated dynamically |
| `Seller/Kyc` | Payout accounts | Backend list/create/delete | `/sellers/payout-accounts` | Integrated |
| `Seller/Products` | Product totals and filtered totals | First limited response length | `/products/my-products` has no total metadata | Removed; returned records are not presented as totals |
| `Seller/Products` | Products and mutations | Backend list/create/update/delete | `/products/my-products`, `/products`, `/products/{id}` | Integrated; server pagination/filter gap documented |
| `Seller/Account` | Notification preferences | Frontend defaults and local-only success | No seller notifications/preferences API | Removed; unavailable state |
| `Seller/Account` | Store status | Derived from seller account approval | No separate store-status field/API | Replaced with unavailable state |
| `Seller/Account` | Language and timezone | Static frontend values | No persisted profile fields | Removed |
| `Seller/Layout` | Business/store identity | Generic frontend fallback; seller profile was never fetched | `GET /sellers/me` plus authenticated user | Integrated; no fake notification badge |
| `Seller/Inventory` | Stock, reserved, available, threshold and location | No operational seller page | `/inventory/my-inventory`, `PUT /inventory/{id}` | Added and integrated |

Navigation labels, valid form enums, visual colors and empty-state copy are UI configuration rather than business data.
