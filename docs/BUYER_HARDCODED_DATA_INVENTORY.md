# Buyer hardcoded-data inventory

Audit scope: `/account/*`, Buyer Account components, cart/wishlist stores, buyer API services and Xerin-Gateway contracts.

| Component | Displayed data | Previous source | Backend source | Status |
|---|---|---|---|---|
| Buyer dashboard | Buyer identity/account/email verification | `/users/me` with generic greeting fallback | `GET /users/me` | Integrated; loading/error states are explicit |
| Buyer dashboard | Cart count and total | Persisted Zustand cart | `GET /cart` | Replaced with backend cart response |
| Buyer dashboard | Wishlist count | Persisted local wishlist | No backend wishlist API | Count removed; unavailable state |
| Buyer dashboard | Order count | Length of one result page | Paginated `total` from `GET /orders/my-orders` | Corrected |
| Buyer dashboard | Address count/default | Backend address list | `GET /addresses` | Integrated with partial-error state |
| Buyer dashboard | Phone verification | Inferred from presence of phone number | No phone-verification field/API | Replaced with unavailable state |
| Buyer orders | List and counts | Backend result page | `GET /orders/my-orders` | Integrated |
| Buyer order details | Redirected back to list | No detail UI | `GET /orders/{id}` | Added and integrated |
| Buyer payments | Payment list/status/amount | Backend | `GET /payments/my-payments` | Integrated; fake receipt availability removed |
| Buyer addresses | Identity labels | Literal “Buyer / Authenticated account / Account contact” | `GET /users/me` | Replaced with real profile fields |
| Buyer addresses | Address list/mutations | Backend, but query errors appeared empty | `/addresses`, `/addresses/{id}` | Integrated; error/retry state added |
| Buyer reviews | Empty copy that implied valid empty data | No backend endpoint | None | Explicit unavailable state |
| Buyer notifications | “All caught up” empty state | No backend endpoint | None | Explicit unavailable state; no count |
| Buyer security | 2FA preparation statement | Static frontend claim | No 2FA endpoint | Replaced with unavailable explanation |

The persisted storefront cart/wishlist stores remain guest-capable UI state. They are no longer used as authoritative Buyer Dashboard account metrics. A backend wishlist/merge contract is required before authenticated wishlist synchronization can be completed.
