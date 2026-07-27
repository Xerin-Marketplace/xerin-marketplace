# Storefront frontend-to-backend integration matrix

| Feature | Frontend | Backend contract | Method / auth | Status | Remaining gap |
|---|---|---|---|---|---|
| Product listing | Home/shop cards | `/products` | GET / public | Working | No total pagination metadata |
| Product details | `/products/[id]` | `/products/{id}` | GET / public | Working base DTO | Images, variants, stock and seller aggregate absent |
| Categories | Shop/home | `/products/categories` | GET / public | Working | No slug page |
| Brands | API service | `/products/brands` | GET / public | Working | No slug page |
| Search | `/search?q=` | `/products?search=&skip=&limit=` | GET / public | Working | No result total/facets |
| Cart | Header/drawer/cart | `/cart`, `/cart/items*` | GET/POST/PUT/DELETE / buyer | Working | No tax engine |
| Guest cart merge | Login/register | `/cart/merge` | POST / buyer | Working | Guest wishlist merge not implemented |
| Cart validation | Checkout/API | `/cart/validate` | POST / buyer | Working | UI can expose price-change messages more prominently |
| Coupon | Cart/checkout | `/cart/apply-coupon`, `/cart/coupon` | POST/DELETE / buyer | Working basic rules | Buyer/product/category usage rules absent |
| Wishlist | Cards/wishlist | `/users/me/wishlist*` | GET/POST/DELETE / buyer | Working | Move-to-cart is composed client-side |
| Addresses | Checkout/account | `/addresses*` | CRUD / buyer permission | Working | No district/ward/coordinates |
| Shipping options | Checkout | `/checkout/shipping-options` | GET / buyer | Working configured option | No live carrier/rate engine |
| Checkout totals | Checkout | `/checkout/quote` | POST / buyer | Working | Tax remains zero until tax policy exists |
| Payment options | Checkout | `/checkout/payment-options` | GET / buyer | Working | COD only |
| Order creation | Checkout | `/orders` | POST / buyer | Working, idempotent | No explicit order failure resource |
| Payment initiation | Checkout | `/payments/initiate` | POST / buyer | Working COD pending state | Provider verification/retry absent |
| Order confirmation | `/order-success/[orderId]` | `/orders/{id}`, `/payments/my-payments` | GET / owner | Working | Payment lookup should be embedded/paginated |
| Orders | Buyer account | `/orders/my-orders`, `/orders/{id}` | GET / owner | Working | Cancellation UI is partial |
| Tracking | Order detail | Status history only | GET / owner | Partial | Shipment/carrier/tracking events missing |
| Reviews | Hidden/disabled storefront template | None | — | Missing | Review list/eligibility/create/moderation |
| Recommendations | None authoritative | None | — | Missing | Related/recommendation endpoint |
| Featured products | None authoritative | None | — | Missing | Curated flag/collection endpoint |
| Best sellers | Renamed to latest products | `/products` newest-first | GET / public | Correctly labelled | Sales ranking endpoint missing |
| Recently viewed | UI section | Local UI state | guest UI | Partial | Store IDs only and refetch products |

## Data-source rules after refactor

- Backend/TanStack Query: authenticated cart, wishlist, orders, payments, checkout quote/options.
- Zustand persisted state: guest cart and guest wishlist only.
- Zustand transient state: quick view, preview slider and modal behaviour.
- URL: product ID, search query, search page.
- localStorage: authentication legacy storage, theme, guest stores; no authoritative product detail or authenticated cart totals.
