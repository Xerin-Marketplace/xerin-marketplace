# Xerin Market - Pending Links Register

This document tracks all frontend links, URLs, API routes, and external integrations that are not yet final.

Purpose:
- Avoid permanent fake links
- Track links needed from backend, mobile, logistics, payments, and business teams
- Make future updates easy
- Replace placeholders quickly once official links are provided

---

## 1. Mobile App Links

Source team: Mobile App Team  
Status: Pending

| Area | Current Placeholder | Final Link Needed | Notes |
|---|---|---|---|
| Footer - App Store button | # | iOS App Store URL | SRS marks iOS app as Phase 2 |
| Footer - Google Play button | # | Google Play Store URL | SRS marks Android app as Phase 2 |

---

## 2. Social Media Links

Source team: Business / Marketing Team  
Status: Pending

| Area | Current Placeholder | Final Link Needed | Notes |
|---|---|---|---|
| Footer - Facebook | # | Official Facebook URL | Waiting for official brand account |
| Footer - X/Twitter | # | Official X/Twitter URL | Waiting for official brand account |
| Footer - Instagram | # | Official Instagram URL | Waiting for official brand account |
| Footer - LinkedIn | # | Official LinkedIn URL | Waiting for official company page |

---

## 3. Payment Links / Payment Provider References

Source team: Backend / Payments Team  
Status: Pending

| Area | Current Placeholder | Final Link Needed | Notes |
|---|---|---|---|
| Footer - Visa icon | # | Payment info page or provider route | Payment methods depend on backend/payment gateway |
| Footer - Mastercard icon | # | Payment info page or provider route | Payment methods depend on backend/payment gateway |
| Footer - PayPal icon | # | Confirm if PayPal is supported | SRS focuses on mobile money, cards, USSD, bank transfer |
| Footer - Apple Pay icon | # | Confirm if Apple Pay is supported | May be future/market-specific |
| Footer - Google Pay icon | # | Confirm if Google Pay is supported | May be future/market-specific |

---

## 4. Buyer Account / Order Tracking Links

Source team: Backend Team  
Status: Temporary routes used

| Area | Current Route | Final Route Needed | Notes |
|---|---|---|---|
| Track Order | /my-account | /track-order or backend-defined route | Temporary route until order tracking page is created |
| Returns & Refunds | /contact | /returns-refunds or backend-defined route | Needs return/refund workflow |
| Help Center | /contact | /help or /support | Needs support/help center page |

---

## 5. Seller Links

Source team: Backend / Product Team  
Status: Temporary routes used

| Area | Current Route | Final Route Needed | Notes |
|---|---|---|---|
| Sell on Xerin | /signup | /seller/register | Needs separate seller registration flow |
| Seller Dashboard | Not created yet | /seller/dashboard | Needed after seller module begins |
| Seller KYC Upload | Not created yet | /seller/kyc | Needed for seller verification |
| Seller Product Management | Not created yet | /seller/products | Needed for product listing and inventory |

---

## 6. Admin Links

Source team: Backend / Admin Team  
Status: Not created yet

| Area | Current Route | Final Route Needed | Notes |
|---|---|---|---|
| Admin Dashboard | Not created yet | /admin/dashboard | Needed for platform governance |
| Seller Approval | Not created yet | /admin/sellers/approvals | Needed for KYC approval |
| Product Moderation | Not created yet | /admin/products/moderation | Needed for product review |
| Disputes | Not created yet | /admin/disputes | Needed for order dispute handling |
| Financial Reports | Not created yet | /admin/finance | Needed for commissions and payouts |

---

## 7. Logistics Links / API Routes

Source team: Backend / Xerin Logistics Team  
Status: Pending

| Area | Current Route | Final Route/API Needed | Notes |
|---|---|---|---|
| Shipment Tracking | Not created yet | GET /api/orders/:id/tracking | Needed for buyer tracking timeline |
| Shipping Cost Calculator | Not created yet | POST /api/logistics/rates | Needed during checkout |
| Pickup Points | Not created yet | GET /api/logistics/pickup-points | Needed for pickup option |
| Proof of Delivery | Not created yet | GET /api/orders/:id/proof-of-delivery | Needed after delivery |

---

## 8. Authentication / OAuth Links

Source team: Backend Team  
Status: Pending

| Area | Current Route | Final Route/API Needed | Notes |
|---|---|---|---|
| Google Login | Not connected yet | Backend OAuth route | Required by SRS |
| Facebook Login | Not connected yet | Backend OAuth route | Required by SRS |
| Apple Login | Not connected yet | Backend OAuth route | Required by SRS |
| OTP Verification | Not connected yet | Backend OTP API | Email/SMS OTP required |
| Password Reset | Not connected yet | Backend password reset API | Required for account recovery |

---

## Update Rule

When a final link or route is received:
1. Update this file first
2. Update src/constants/links.ts if it affects frontend links
3. Update the frontend component if needed
4. Test the link in browser
5. Mark status as Done
6. Add the date and source team that provided the link
