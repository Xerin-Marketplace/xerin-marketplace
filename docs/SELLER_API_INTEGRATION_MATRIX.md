# Seller API integration matrix

| Seller module | Frontend route | Backend contract | Method | Auth / role | Integration |
|---|---|---|---|---|---|
| Identity | Seller shell/account | `/users/me`, `/sellers/me` | GET/PATCH | Authenticated seller | Integrated |
| Business profile/store | `/seller/account`, `/seller/store` | `/sellers/profile` | GET/PATCH | Authenticated seller | Integrated |
| KYC status | `/seller/dashboard`, `/seller/kyc` | `/sellers/kyc-status` | GET | Authenticated seller | Integrated |
| KYC documents | `/seller/kyc` | `/sellers/kyc-documents` | GET/POST | Authenticated seller | Integrated |
| Payout accounts | `/seller/kyc?tab=payouts` | `/sellers/payout-accounts`, `/{id}` | GET/POST/DELETE | Authenticated seller | Integrated; update/default mutation absent |
| Products | `/seller/products` | `/products/my-products`, `/products`, `/products/{id}` | GET/POST/PATCH/DELETE | Authenticated seller/ownership | Integrated; total metadata and server filters absent |
| Inventory | `/seller/inventory` | `/inventory/my-inventory`, `/inventory/{id}` | GET/PUT | Authenticated seller/ownership | Integrated |
| Password/sessions | `/seller/account/security` | `/auth/change-password`, `/users/me/sessions` | POST/GET/DELETE | Authenticated user | Integrated |
| Seller orders | Dashboard/sidebar | None; `/orders/my-orders` is buyer-owned | — | Seller scope required | Missing |
| Earnings/analytics | Dashboard/sidebar | None | — | Seller finance permission required | Missing |
| Notifications/reviews | Account/store operations | None | — | Seller scope required | Missing |
| Setup/workflow summary | Dashboard | None | — | Authenticated seller | Missing |
