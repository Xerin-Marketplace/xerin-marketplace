# Buyer backend integration report

## Fully integrated

- Buyer profile and account updates
- Email/account status fields supplied by `/users/me`
- Buyer dashboard backend cart summary
- Paginated buyer orders and authoritative order total
- Buyer order details and item totals
- Buyer payment history
- Address list/create/update/delete with error/empty separation
- Password changes and active-session revocation
- Buyer/seller/admin route separation through the existing account guard

## Partial

- Cart: backend service and Buyer Dashboard summary are live, but storefront components still use the guest-capable persisted cart store. A controlled guest-to-account merge/synchronization flow is required to eliminate the dual source safely.
- Payments: backend does not expose receipt URLs or a dedicated pending-payment dashboard summary.
- Orders: backend detail does not expose consolidated payment, delivery/tracking, cancellation or refund-request state.

## Missing backend capabilities

- Wishlist list/add/remove/move-to-cart
- Buyer reviews, eligibility and mutations
- Buyer notifications, unread count and preferences
- Phone verification status/workflow
- Two-factor authentication enrollment/challenge
- Consolidated buyer dashboard summary and recent-activity feed

## Data-integrity improvements

- Local cart and wishlist values are no longer presented as backend Buyer Dashboard facts.
- Order counts use backend pagination totals rather than current-page length.
- Address request failure no longer appears as an empty address book.
- Phone verification is no longer inferred from a populated phone field.
- Fake receipt availability, fake notification empty success and static 2FA readiness were removed.
- Buyer address contact labels now use the authenticated backend profile.

## Known contract risks

- Cart response has monetary totals but no explicit currency field; the frontend uses the marketplace currency formatter.
- `/payments/my-payments` returns a plain list without pagination metadata.
- The user schema exposes `is_verified` but does not distinguish email and phone verification.

## Validation

| Check | Result |
|---|---|
| TypeScript (`npx tsc --noEmit`) | Passed |
| Production build (`npm run build`) | Passed; 71 routes |
| Git whitespace (`git diff --check`) | Passed |
| Lint (`npm run lint`) | Blocked by the obsolete `next lint` script under Next.js 16 |

The production build reports only the existing deprecation warning for migrating `middleware` to `proxy`.
