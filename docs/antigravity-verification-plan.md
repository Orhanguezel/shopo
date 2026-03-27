# Verification Plan - Antigravity

This document outlines the specific verification steps for each task assigned to Antigravity as defined in `docs/gorev-dagilimi.md`.

## Faza 1: Guvenlik (Security)

### 1.1 CORS Verification
- **Goal:** Verify that CORS headers are no longer using wildcard `*`.
- **Steps:**
    1. Send a request from an unauthorized domain and verify it fails.
    2. Send a request from an authorized domain (localhost:3000 / seyfibaba.com) and verify the `Access-Control-Allow-Origin` header.
    3. Verify standard frontend-backend API calls work correctly.

### 1.2 Admin Route Middleware
- **Goal:** Ensure all admin routes are protected.
- **Steps:**
    1. Try to access any endpoint starting with `/api/admin` without an authorization token.
    2. Verify 401 Unauthorized response.

### 1.4 XSS Middleware
- **Goal:** Verify that `<script>`, `<iframe>` (if forbidden), etc., are stripped or blocked.
- **Steps:**
    1. Submit a form (e.g., contact message or product review) containing `<script>alert(1)</script>`.
    2. Check the database/API response to see if the tag was stripped.
    3. Repeat with other high-risk tags mentioned in the security plan.

## Faza 1.5: Odeme Temizligi (Payment Cleanup)

### Checkout Checkout Verification
- **Goal:** Verify that only COD and Bank Transfer options remain.
- **Steps:**
    1. Go to the checkout page.
    2. Ensure Stripe, PayPal, and Razorpay options are removed from the UI.
    3. Verify total functionality with remaining options.

## Faza 2: Iyzico Odeme (Iyzico Payment)

### 2.2 Frontend Verification
- **Goal:** Verify Iyzico checkout flow.
- **Steps:**
    1. Select Iyzico as payment method.
    2. Fill in test card details.
    3. Verify 3D Secure redirect works.
    4. Verify callback handler processes success/failure correctly.

### 2.3 Admin Panel Verification
- **Goal:** Verify Iyzico settings UI.
- **Steps:**
    1. Navigate to admin panel settings.
    2. Verify Iyzico API key/secret fields exist and are visually correct.

## Faza 3: SMS/OTP

### 3.2 Registration Flow Verification
- **Goal:** Verify OTP SMS registration.
- **Steps:**
    1. Start a signup process.
    2. Verify OTP is requested via UI.
    3. Verify successful registration with valid OTP.
    4. Verify failure with invalid OTP / timeout.

## Faza 4: UI/UX Verification
- **Detailed checks for:**
    - **Blog detail:** Content render, Responsive, SEO Meta.
    - **Product detail:** Variant selection, Gallery, Null handling.
    - **Filter page:** Fiyat slider, Kategori selection, Results update.
    - **Seller Shop:** Profile details, Responsive product list.
    - **Return Request:** Form validation, Submit flow.

## Faza 7: SEO
- **Bot Simulation:** Use bot simulators to verify SSR/SSG output.
- **Lighthouse:** Run audit to ensure 95+ SEO score.
- **Structured Data:** Use Google Structured Data Testing Tool (or equivalent) to verify Product, Organization, and Breadcrumb schemas.

## Faza 8: Performance
- **Lighthouse:** Verify 90+ Performance score.

---
*Note: I will update `docs/gorev-dagilimi.md` by marking tasks as completed after successful verification.*
