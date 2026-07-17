# Xerin Gateway API inventory

Source of truth: FastAPI router registration in `Xerin-Gateway/BACKEND/api/main.py`, router dependencies, Pydantic schemas, and the generated OpenAPI document. The application currently exposes 158 operations with no global `/api` prefix.

## Contract conventions

- Base paths start at `/auth`, `/users`, `/products`, `/cart`, `/orders`, `/payments`, `/sellers`, `/stores`, `/inventory`, `/admin`, `/coupons`, `/promotions`, `/communications`, and `/system`.
- Authentication uses `Authorization: Bearer <access token>`. Login and refresh return access and refresh tokens in JSON.
- Protected profile operations use permission dependencies. `super_admin` bypasses granular permission checks.
- Paginated responses use `{ total, page, page_size, results }`. Query names are `page` and `page_size`, except product lists which use `skip` and `limit`.
- Validation and business errors use FastAPI `{ detail }`; validation errors use an array in `detail`.
- KYC upload uses multipart fields `document_type` and `file`; bulk KYC uses `tin_file`, `business_profile_file`, and `business_registration_file`.
- Store uploads use multipart fields `logo` and `banner`.

## Public and authentication APIs

| Area | Operations |
|---|---|
| Auth | `POST /auth/register`, `/auth/register-seller`, `/auth/login`, `/auth/refresh-token`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/send-otp`, `/auth/verify-otp`; protected: `/auth/logout`, `/auth/change-password` |
| Catalog | `GET /products`, `/products/{id}`, `/products/categories`, `/products/categories/{id}`, `/products/brands`, `/products/brands/{id}`, plus public product images, variants and tags |
| Stores | `GET /stores`, `/stores/{store_slug}` |
| Payment callback | `POST /payments/callback/{provider}` |

## Buyer APIs

| Area | Operations |
|---|---|
| Profile | `GET/PATCH /users/me`, `GET /users/me/sessions`, `DELETE /users/me/sessions/{id}` |
| Addresses | `GET/POST /addresses`, `PATCH/DELETE /addresses/{id}` |
| Cart | `GET/DELETE /cart`, `POST /cart/items`, `PUT/DELETE /cart/items/{id}`, `POST /cart/apply-coupon`, `DELETE /cart/coupon` |
| Orders | `POST /orders`, `GET /orders/my-orders`, `GET /orders/{id}`, `PATCH /orders/{id}/status` |
| Payments | `POST /payments/initiate`, `GET /payments/my-payments`, `GET /payments/{id}` |

## Seller APIs

| Area | Operations |
|---|---|
| Seller and business profile | `GET/PATCH /sellers/me`, `GET/PATCH /sellers/profile` |
| Store | `GET/PATCH /stores/me`, `POST /stores/me/logo`, `POST /stores/me/banner` |
| KYC | `GET/POST /sellers/kyc-documents`, `POST /sellers/kyc-documents/bulk`, `GET /sellers/kyc-status` |
| Payout accounts | `GET/POST /sellers/payout-accounts`, `DELETE /sellers/payout-accounts/{id}` |
| Products | `GET /products/my-products`; authenticated create/update/delete, image, variant and tag mutations under `/products` |
| Inventory | `POST /inventory`, `GET /inventory/my-inventory`, `GET /inventory/low-stock`, `PUT /inventory/{id}` |

There is no seller-specific order list, earnings, transaction, payout-history, promotion, review, message, return, or cancellation API in the current backend.

## Admin APIs

Available admin operations cover users, roles, permissions, sellers, pending-product moderation, customers, customer addresses/reviews/support summaries, payments/refunds, six report types, coupons, promotions, communications, and system operations.

Important limitations:

- Full admin product CRUD/list/detail routes under `/admin/products` do not exist; only `GET /admin/products/pending` and approve/reject operations exist.
- Admin order routes under `/admin/orders` do not exist. The available list is `GET /orders/admin/all`; order detail and the shared status mutation are under `/orders/{id}`.
- Warehouse, stock-movement, stock-transfer, finance-summary, dispute and analytics-overview routes do not exist.
- Admin customer detail is available, but the nested customer routes used by parts of the frontend (orders, payments, wishlist, notes and login history) do not exist.

## Backend business rules observed

- Login rejects suspended, inactive, and unverified accounts.
- Seller registration requires agreement acceptance and at least one valid business category ID.
- Cart only accepts purchasable products, validates variants and stock, and rejects insufficient stock.
- Order creation rejects an empty cart and validates ownership of the shipping address.
- Payment initiation is allowed only for the buyer's pending order, validates payment method, and prevents concurrent in-progress payment.
- Delivered orders cannot be cancelled; invalid order transitions are rejected.
- Inventory quantity and reserved quantity cannot be negative; seller ownership is checked.
- Seller KYC upload validates document type, content and file constraints independently from seller account approval.
- Completed payments alone can be refunded, and an admin refund reason must contain at least five characters.
