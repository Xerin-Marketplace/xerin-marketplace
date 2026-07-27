# Storefront audit and buyer-flow completion report

Audit date: 2026-07-23

## Executive result

The storefront now has one intentional cart flow: a device-local guest cart before authentication and the backend cart after authentication. Login merges guest identifiers through the backend and retains rejected local items. Checkout reads backend cart totals, backend address ownership, backend shipping/payment options, an authoritative quote, idempotent order creation, and backend payment state.

This release does **not** claim that reviews, personalized recommendations, best-seller analytics, provider-backed online payments, or shipment tracking are complete. Their missing contracts are documented rather than simulated.

## Route audit

| Route | Result | Data source / behaviour |
|---|---|---|
| `/` | Working | Backend products/categories; unsupported commerce claims were qualified |
| `/shop-with-sidebar` | Partial | Backend list/categories; several legacy visual filters are not connected and are documented |
| `/shop-without-sidebar` | Working list | Backend list with loading/empty/error states |
| `/products/[id]` | Working canonical route | Fetches product from URL/backend; no product localStorage dependency |
| `/shop-details` | Deprecated | Redirects to the catalog; no selected-product local state |
| `/search?q=` | Working | Backend `search` query with URL state and loading/empty/error handling |
| `/cart` | Working | Guest cart or authenticated backend cart; never presents API failure as empty |
| `/wishlist` | Working | Guest device list or authenticated backend wishlist |
| `/checkout` | Working for configured capability | Buyer auth, cart, address, shipping quote, COD, order and payment initiation |
| `/order-success/[orderId]` | Working | Backend order/payment data |
| `/account/orders` | Working | Backend buyer-owned order list |
| `/account/orders/[orderId]` | Working | Backend ownership-protected order detail/status history |
| `/categories/[slug]` | Missing | No route or slug lookup contract |
| `/brands/[slug]` | Missing | No route or slug lookup contract |
| `/order-failed` | Missing | Checkout errors stay on checkout with safe retry |
| `/track-order` | Missing | No shipment/tracking model or buyer tracking API |

## Confirmed working features

- Product list, product-by-ID, categories and brands use backend routes.
- Search now queries backend product name, description, SKU, brand, category and seller business name.
- All audited product cards and quick-purchase entry points use the shared add-to-cart mutation.
- Guest add-to-cart persists stable product/variant identifiers; prices remain display-only.
- Backend merge combines identical product/variant quantities, validates availability/stock and reports rejected items.
- Authenticated cart add/update/remove/clear/coupon/validate are backend mutations.
- Wishlist list/add/remove/clear is persisted per buyer.
- Checkout validates buyer-owned address and backend-configured delivery/payment choices.
- Order totals include backend coupon and shipping rules; the frontend does not submit totals.
- Order creation rejects seller/admin checkout and uses a per-buyer idempotency key.
- Payment initiation is backend-owned and duplicate pending payment initiation is idempotent.
- Success page reloads real order and payment data.

## Mabadiliko yaliyoshughulikiwa

| Eneo | Tatizo lililokuwepo | Kilichofanyika | Status |
|---|---|---|---|
| Add to Cart | Guest buyer alikuwa anatuma request kwenye authenticated cart API na kupata 401 | Shared cart mutation sasa inaweka guest item kwenye device store, ikiwa na product/variant IDs; authenticated buyer anaandika backend cart | Imekamilika |
| Cart source of truth | Header, drawer, page na account zingeweza kusoma sources tofauti | `useCartView` sasa inachagua guest store kabla ya login na backend/TanStack Query baada ya login | Imekamilika |
| Cart badge na drawer | Zilikuwa backend-only na hazikuonyesha guest additions | Header na drawer sasa zinatumia shared cart view na totals zinazolingana na cart page | Imekamilika |
| Cart mutations | Guest remove/update/clear hazikuwa na intentional handling | Update, remove na clear sasa zina-route guest mutations locally na authenticated mutations backend | Imekamilika |
| Guest cart merge | Hakukuwa na backend merge endpoint | `POST /cart/merge` imeongezwa; ina-combine duplicate product/variant, kuvalidate stock na kurudisha rejected items | Imekamilika |
| Login cart synchronization | Login iliingia account bila kuhamisha guest cart | Sign-in na buyer registration sasa zina-merge guest cart; local items zinafutwa baada ya success tu | Imekamilika |
| Cart validation | Hakukuwa na explicit price/availability revalidation endpoint | `POST /cart/validate` imeongezwa kwa product status, stock na price-change validation | Imekamilika |
| Coupon feedback | Invalid/expired/ineligible coupon ingeweza kuhifadhiwa na kutoa zero discount | Backend sasa inakataa coupon isiyostahili kwa message badala ya fake success | Imekamilika kwa basic coupon rules |
| Product detail route | `/products/[id]` ilifetch backend kisha ikategemea Zustand/localStorage | Product page sasa inapitisha backend product moja kwa moja kwenye details component | Imekamilika |
| Legacy `/shop-details` | Ilitegemea selected product object ya local state | Route sasa ina-redirect kwenye catalog; product links zote zinaenda `/products/{id}` | Imekamilika |
| Product availability | Public detail ingeweza kurudisha inactive/non-approved product | Backend product detail sasa inaruhusu approved na active product tu | Imekamilika |
| Search | Header search haikuwa na working results route | `/search?q=&page=` imeongezwa na inatumia backend query, loading, empty na error states | Imekamilika |
| Search coverage | Backend search ilikuwa name/description/SKU pekee | Search imepanuliwa kujumuisha brand, category na seller business name | Imekamilika |
| Wishlist backend | Frontend calls zilikuwepo lakini backend endpoints hazikuwepo | Buyer wishlist table na GET/POST/DELETE/clear endpoints zimeongezwa | Imekamilika |
| Wishlist source | Authenticated wishlist ili-copy backend data kwenye persisted local store | Authenticated page sasa inarender backend query moja kwa moja; local store ni guest wishlist | Imekamilika |
| Checkout products | Checkout ilikuwa na client-calculated lines/totals | Checkout sasa inaleta items na subtotal kutoka backend cart | Imekamilika |
| Shipping methods | Free/FedEx/DHL na dollar charges zilikuwa hardcoded | `GET /checkout/shipping-options` sasa ndiyo source; UI inaonyesha method na ETA iliyorudishwa backend | Imekamilika kwa configured Tanzania option |
| Checkout calculation | Shipping na total zilihesabiwa frontend | `POST /checkout/quote` inahesabu subtotal, discount, shipping, tax na total backend | Imekamilika |
| Delivery eligibility | Address haikutumika kuamua shipping availability | Backend inathibitisha buyer ownership na country eligibility kabla ya kurudisha shipping option | Imekamilika kwa current country rule |
| Payment methods | Cash, bank na PayPal zilionyeshwa bila configuration | `GET /checkout/payment-options` ndiyo source; COD pekee inaonyeshwa kwa sasa | Imekamilika kwa supported option |
| Buyer checkout access | Guest/seller/admin flow haikuwa fully enforced | Guest anaelekezwa login na return URL; backend order creation inakataa seller/admin accounts | Imekamilika |
| Order totals | Order ilikuwa na zero shipping na incomplete checkout contract | Order sasa inarecalculate coupon na backend shipping amount; frontend haitumi totals | Imekamilika |
| Duplicate orders | Double click/retry ingeweza kutengeneza order nyingine | `idempotency_key` na `checkout_attempts` unique mapping zimeongezwa | Imekamilika |
| Duplicate payments | Pending payment ya order ileile ilirudisha error | Payment initiation sasa inarudisha existing pending/processing payment | Imekamilika |
| Order success | Hakukuwa na real confirmation route | `/order-success/[orderId]` inafetch buyer-owned order na backend payment status | Imekamilika |
| Static review/spec data | Product page ilikuwa na template reviews/specifications zisizo backend | Tabs hizo zimeondolewa kwenye reachable UI hadi real backend contracts zitakapopatikana | Imeshughulikiwa bila fake data |
| Best-seller claims | Newest products ziliitwa best sellers/trending | Section imeitwa “Latest products”; sales-ranking gap imeandikwa | Imeshughulikiwa |
| Delivery/payment claims | “Fast delivery”, “verified sellers” na payment claims zilikuwa static | Claims zimeondolewa au kuandikwa “options confirmed at checkout” | Imeshughulikiwa |
| Currency | Checkout ilikuwa na hardcoded dollar shipping | Purchase flow sasa inatumia shared formatter na backend currency, default TZS | Imekamilika |
| Lint tooling | `next lint` haifanyi kazi kwenye Next 16/ESLint 9 | Flat ESLint config na `eslint src` script zimeongezwa | Imekamilika |

## Backend contracts zilizoongezwa

| Endpoint | Purpose |
|---|---|
| `POST /cart/merge` | Merge guest cart into buyer cart with stock validation |
| `POST /cart/validate` | Revalidate cart availability and latest prices |
| `GET /users/me/wishlist` | Get authenticated buyer wishlist |
| `POST /users/me/wishlist` | Add an available product to buyer wishlist |
| `DELETE /users/me/wishlist/{product_id}` | Remove one wishlist item |
| `DELETE /users/me/wishlist` | Clear buyer wishlist |
| `GET /checkout/shipping-options` | Return address-eligible configured shipping methods |
| `GET /checkout/payment-options` | Return enabled payment methods |
| `POST /checkout/quote` | Calculate authoritative checkout totals |
| `POST /orders` | Extended with shipping/payment selection and idempotency key |

## Storefront files/refactors muhimu

- `src/hooks/useCartActions.ts`: unified guest/authenticated cart behaviour.
- `src/hooks/useAuth.ts`: post-authentication guest-cart merge.
- `src/hooks/useWishlist.ts`: guest/backend wishlist separation.
- `src/components/Cart/index.tsx`: shared cart view, explicit loading/error/empty states.
- `src/components/Header/index.tsx`: shared cart badge and working search navigation.
- `src/components/Common/CartSidebarModal/index.tsx`: shared guest/backend cart drawer.
- `src/components/Checkout/index.tsx`: backend cart, address, quote, order and payment flow.
- `src/components/Checkout/ShippingMethod.tsx`: backend-provided shipping methods.
- `src/components/Checkout/PaymentMethod.tsx`: backend-provided payment methods.
- `src/app/(site)/(pages)/products/[id]/page.tsx`: direct canonical backend product rendering.
- `src/app/(site)/(pages)/search/page.tsx`: backend search results route.
- `src/app/(site)/(pages)/order-success/[orderId]/page.tsx`: real confirmation state.

## Incorrectly reported as working before this audit

- Wishlist frontend calls existed, but the backend routes did not.
- Cart cards used a backend mutation, but anonymous calls produced 401 and there was no merge contract.
- The canonical product page fetched backend data, then rendered through Zustand/localStorage.
- Checkout created an order, but FedEx/DHL, dollar shipping amounts and PayPal/bank choices were hardcoded.
- “Best seller”, “fast delivery”, “verified seller” and payment-method claims lacked authoritative sources.
- Search UI had an input but no result route/navigation.

## Business and security findings

- Existing access/refresh tokens remain in localStorage. An HttpOnly-cookie migration is recommended.
- Online provider payment callback verification is not production-ready; online methods are therefore not advertised by the new payment-options endpoint.
- COD is the only enabled checkout payment option.
- Shipping is currently a backend-configured Tanzania-wide standard method, not carrier/rate-engine integration.
- `Base.metadata.create_all` is not a production migration strategy. Wishlist and checkout-attempt tables need a versioned migration.
- Coupon logic still lacks per-buyer usage, product/category/seller eligibility and stackability.

## QA evidence

| Check | Result |
|---|---|
| TypeScript | Pass: `npx tsc --noEmit` |
| ESLint | Pass with 0 errors; 27 pre-existing hook-dependency warnings outside the core flow |
| Production build | Pass: Next.js 16.2.9, 72 routes |
| Backend OpenAPI contract | Pass for cart merge/validate, wishlist, checkout options/quote and orders |
| Public live smoke | Pass: home/search/cart/checkout/products HTTP 200 |
| Auth protection | Pass: wishlist, checkout options and cart merge return HTTP 401 without token |
| Transactional buyer E2E | Pass: cart → wishlist → shipping → quote → idempotent order → COD payment → cleared cart |

## Remaining risks and next phase

1. Add Alembic migrations and deploy the new tables safely.
2. Add product-detail aggregate DTO (images, variants, inventory, seller/category/brand).
3. Implement review eligibility/moderation, shipment tracking, delivery areas/rates and provider-verified payments.
4. Add total-count pagination and backend-driven shop filters.
5. Remove legacy hidden template specifications/review markup after design approval.
6. Migrate authentication tokens out of localStorage.
