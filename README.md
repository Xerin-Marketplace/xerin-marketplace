# Xerin Market Frontend

Xerin Market is a pan-African multi-vendor marketplace frontend built with Next.js, React, TypeScript, Tailwind CSS, and Redux Toolkit.

The platform connects buyers, sellers, and logistics providers through a modern e-commerce experience with product discovery, cart, wishlist, checkout, account dashboard, and future integration points for payments, logistics tracking, seller tools, and admin workflows.

## Current Status

This repository contains the Xerin Market frontend application for the marketplace web platform.

Completed so far:

- Xerin Market branding and metadata
- Header and footer customization
- Homepage marketplace sections
- Shop, product details, cart, wishlist, checkout, and account cleanup
- Blog content cleanup
- Centralized route and external link management
- Pending integration tracker for mobile, backend, logistics, payments, and social links
- Production build verification

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Redux Toolkit
- App Router

## Getting Started

Clone the repository:

    git clone https://github.com/Xerin-Marketplace/xerin-marketplace.git
    cd xerin-marketplace

Install dependencies:

    npm install

Create your environment file:

    cp .env.example .env

Start the development server:

    npm run dev

Build for production:

    npm run build

## Important Routes

- / : Home
- /shop-with-sidebar : Shop page
- /shop-details : Product details
- /cart : Cart
- /wishlist : Wishlist
- /checkout : Checkout
- /my-account : Buyer account
- /signin : Sign in
- /signup : Sign up
- /contact : Help and support

## Link Management

Routes and external placeholders are managed in:

    src/constants/links.ts

Pending final URLs and integrations are tracked in:

    docs/PENDING_LINKS.md

Before hardcoding any new link, check these files first.

## Pending Integrations

The frontend is ready for future integration with:

- Backend authentication
- Product APIs
- Order APIs
- Payment providers
- Xerin Logistics tracking
- Seller onboarding and KYC
- Admin dashboard APIs
- Mobile app links
- Social media links

## Collaboration Notes

Backend and mobile teams should use docs/PENDING_LINKS.md to confirm pending API routes, mobile app URLs, payment references, logistics links, and authentication or OAuth requirements.

Frontend changes should be committed through Git and pushed to this repository so all teams remain aligned.
