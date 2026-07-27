# Storefront backend gaps

| Priority | Feature | Missing operation / suggested contract | Auth and business rules |
|---|---|---|---|
| P0 | Database rollout | Alembic migration for `wishlist_items` and `checkout_attempts` | Reversible deploy; unique buyer/product and buyer/idempotency constraints |
| P0 | Product detail aggregate | `GET /products/{id}` should include images, variants, attributes, stock, seller, brand/category, ratings | Public only for approved active products; stock must be authoritative |
| P0 | Provider payments | Config endpoint plus initialize/verify/webhook/retry contracts | Signed webhooks, provider reference uniqueness, reconciliation and audit |
| P0 | Shipping/delivery | Delivery areas, method/rate calculation and order fulfilment snapshot | Address eligibility, weight/dimensions, seller/warehouse rules |
| P1 | Shipment tracking | `/orders/{id}/shipment` and tracking-event history | Buyer ownership; seller/logistics updates; immutable event history |
| P1 | Reviews | `/products/{id}/reviews`, `/reviews/eligibility`, create/update and moderation | Delivered purchase, one review per item, moderation |
| P1 | Coupon policy | Extend validation with buyer/product/category/brand/seller usage | Atomic redemption and per-buyer limits |
| P1 | Catalog pagination/filtering | Paginated response with total/facets, price/rating/stock/sort filters | Approved active catalog only |
| P1 | Recommendations | Related, trending and personalized endpoints | Clearly label source; do not infer personalization |
| P1 | Featured/best sellers | Curated collections and sales-ranked endpoint | Admin merchandising or analytics source |
| P2 | Guest wishlist merge | `/users/me/wishlist/merge` | Preserve rejected IDs; do not overwrite account list |
| P2 | Order failure/retry | Order creation failure reference and eligible payment retry | Reuse idempotency key; never duplicate order/payment |
| P2 | Auth hardening | HttpOnly access/refresh cookie flow | CSRF protection, rotation, revocation and secure cookie policy |

## APIs added by this implementation

- `POST /cart/merge`
- `POST /cart/validate`
- `GET/POST/DELETE /users/me/wishlist`
- `DELETE /users/me/wishlist/{product_id}`
- `GET /checkout/shipping-options`
- `GET /checkout/payment-options`
- `POST /checkout/quote`
- Idempotent `POST /orders` contract using `idempotency_key`

The configured shipping option and COD option are backend source-of-truth configuration, not claims of live carrier or online-provider integration.
