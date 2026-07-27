# Buyer API integration matrix

| Module | Frontend route | Backend contract | Method | Auth | Integration |
|---|---|---|---|---|---|
| Profile | `/account`, `/account/details` | `/users/me` | GET/PATCH | Buyer | Integrated |
| Cart summary | `/account` | `/cart` | GET | Buyer | Integrated |
| Cart operations | Storefront/cart services | `/cart`, `/cart/items`, `/cart/items/{id}`, `/cart/apply-coupon` | GET/POST/PUT/DELETE | Buyer | API service exists; storefront local-store migration remains partial |
| Orders | `/account/orders` | `/orders/my-orders` | GET | Buyer | Integrated with backend total metadata |
| Order details | `/account/orders/{orderId}` | `/orders/{id}` | GET | Buyer ownership | Integrated |
| Payments | `/account/payments` | `/payments/my-payments`, `/payments/{id}` | GET | Buyer ownership | List integrated; receipt capability absent |
| Addresses | `/account/addresses` | `/addresses`, `/addresses/{id}` | GET/POST/PATCH/DELETE | Buyer ownership | Integrated |
| Password/sessions | `/account/security` | `/auth/change-password`, `/users/me/sessions` | POST/GET/DELETE | Authenticated user | Integrated |
| Wishlist | `/wishlist`, account summary | None | — | Buyer contract required | Missing |
| Reviews | `/account/reviews` | None | — | Buyer contract required | Missing |
| Notifications | `/account/notifications` | None | — | Buyer contract required | Missing |
| Phone verification/2FA | Account/security | None | — | Authenticated user | Missing |
