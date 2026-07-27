# Seller backend integration report

## Fully integrated

- Seller and user identity
- Business profile updates
- KYC status, backend-defined required documents, uploads and document review records
- Payout account list/create/delete
- Product list/create/update/delete using existing contracts
- Seller-owned inventory list and stock updates
- Password changes and active sessions

## Partial

- Product management: backend lacks total metadata, server-side search/status filters, explicit submit/resubmit/archive/activate operations and a dashboard summary.
- Payouts: backend lacks update, verification, set-default and payout-history contracts.
- Store settings: backend provides business profile fields but no dedicated storefront identity/status/policy schema.

## Unavailable without backend support

- Seller-scoped orders, returns and cancellations
- Earnings, commission, balances, settlements, transactions and analytics
- Seller reviews, responses, messages and notification preferences/unread counts
- Authoritative store-setup percentage, onboarding workflow and consolidated next-action feed
- Inventory creation UI requires product/variant-aware workflow work; the current operational page safely updates existing seller-owned records.

## Error/data integrity changes

- API failure no longer becomes product/KYC/account zero values.
- KYC requirements are read from the backend instead of a frontend checklist.
- Limited product results are not labelled as complete totals.
- Local-only notification preference success was removed.
- Fake notification unread indicator and generic seller status defaults were removed.
- Seller profile loading was added to the Seller Center shell.

## Known backend mismatches

- `/orders/my-orders` filters `Order.user_id == current_user.id`, so it is a buyer order endpoint and cannot power Seller Center orders.
- `/products/my-products` supports `skip` and `limit` but returns a plain array without `total`, search, status or sort metadata.
- KYC status combines seller workflow status with document readiness; a distinct KYC review status would make account/KYC separation unambiguous.
- Payout account responses do not include verification/failure status, and no payout history/earnings endpoints exist.
