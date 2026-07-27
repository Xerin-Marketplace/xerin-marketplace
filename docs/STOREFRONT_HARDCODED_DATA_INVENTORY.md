# Storefront hardcoded-data and state inventory

| Area | Previous value/source | Resolution |
|---|---|---|
| Checkout shipping | Free/FedEx/DHL and `$10.99`/`$12.50` | Replaced by backend shipping-options and quote |
| Checkout payments | Cash/bank/PayPal template choices | Replaced by backend payment-options; COD only |
| Checkout total | Frontend item sum + static shipping | Replaced by backend quote |
| Product detail | `productDetails` localStorage/Zustand | Removed as authoritative source |
| Authenticated cart | Backend page plus independent persisted cart store | Backend is authoritative; store is guest-only |
| Authenticated wishlist | Backend call plus persisted mirror | Backend response is rendered directly |
| Search | Header-only input | URL route backed by `/products?search=` |
| Best seller/trending | First/newest backend products | Relabelled “latest products” |
| Fast delivery | Static badge/banner | Reworded to delivery options confirmed at checkout |
| Verified seller | Static storefront claim | Removed from reachable product tabs/filters |
| Product reviews/specifications | Template records/specs | Tabs removed from reachable UI; backend capability remains a gap |
| Currency | Dollar shipping and template order data | Core purchase flow uses `formatCurrency` and backend currency |

## Legacy files not used as buyer purchase truth

- `src/components/Orders/ordersData.tsx` is legacy template data and is not used by `/account/orders`.
- `src/store/useProductDetailsStore.ts` remains only for preview-slider UI state.
- `src/store/useCartStore.ts` and `src/store/useWishlistStore.ts` are guest-device stores.
