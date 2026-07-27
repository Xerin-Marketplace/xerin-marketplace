# Admin backend integration report

## Fully integrated modules

- Users, roles, permissions and active sessions
- Seller listing, applications, documents, approval and rejection
- Payment transactions, methods, failed payments, refunds and full-payment refund action
- Promotions: coupons, discounts and campaigns
- Communications: notifications, email and SMS records/actions exposed by the backend
- Reports: sales, orders, products, inventory, customers and payments
- System management: audit logs, events, jobs and persisted application settings
- Categories and brands for the operations actually exposed by the backend (list/create/delete)

## Partially integrated modules

- Products: pending moderation, approval and rejection are live; full CRUD/list is unavailable.
- Orders: list, detail and shared status mutation are live; tracking/cancel/refund APIs are unavailable.
- Customers: summary, list, composite detail, global addresses, reviews and support-ticket lists are live; nested notes/wishlist/history and ticket mutations are unavailable.
- Reviews: live backend list, read-only because moderation mutations are unavailable.
- Dashboard: live users and moderation queues; finance/catalog/inventory summary cards are withheld where no authoritative summary exists.

## Unavailable backend capabilities

- Admin catalog summary and analytics chart series
- Admin inventory, warehouse, adjustment, transfer and low-stock APIs
- Admin finance summary, payout ledger and dispute workflow
- Full admin product CRUD
- Customer internal notes and persisted wishlist/login-history subresources
- Support ticket detail/assignment/status mutations
- Order tracking, cancellation and order-level refund contracts

The affected screens render an explicit unavailable state and never substitute mock records, silent fallback arrays or fake successful actions.

## Removed runtime data and dead integrations

- Literal dashboard wallet, commission, delivery, tax, auction and payout figures
- Static platform-health claims and fake live states
- Hardcoded payment-provider cards
- Static system-setting fallback records
- Fake inventory, warehouse, product-management and order-operation endpoint clients
- Unsupported customer-note, support-update and review-moderation mutations
- Dead admin hooks and modal flows that called nonexistent endpoints

## Business-rule and contract risks

- Pending product moderation has a backend enum/query naming mismatch.
- Sensitive finance totals cannot be calculated authoritatively from paginated frontend lists; summary endpoints remain required.
- Customer detail fields that are backend placeholders are not treated as confirmed zero values in the UI.
- Permission-aware route/action visibility remains dependent on the permission arrays returned by the existing access APIs.

## Verification

| Check | Result |
|---|---|
| TypeScript (`npx tsc --noEmit`) | Passed |
| Production build (`npm run build`) | Passed |
| Static route generation | Passed, 70 routes |
| Git whitespace check (`git diff --check`) | Passed |
| Lint (`npm run lint`) | Blocked by obsolete `next lint` script under Next.js 16 |

The build reports only the existing Next.js warning that the `middleware` convention is deprecated in favor of `proxy`.
