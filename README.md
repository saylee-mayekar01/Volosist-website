<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1cgMuuFIYtAtZIpaV5wphEnGSVgbqOEvJ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set secure payment env in `server/.env.local` (backend only, never expose to frontend):
   - `CASHFREE_APP_ID=your_production_app_id`
   - `CASHFREE_SECRET_KEY=your_production_secret_key`
   - `CASHFREE_DEFAULT_REFUND_SPEED=STANDARD`
   - `APP_ORIGIN=https://volosist.com`
   - `SUPABASE_URL=https://<your-project>.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=<service-role-key>`
   - `SUPABASE_REFUNDS_TABLE=refunds`
   - `SUPABASE_USER_PAYMENTS_TABLE=user_payments`
3. Run frontend:
   `npm run dev`
4. Run payment backend in another terminal:
   `npm run dev:server`

## Refund Flow (Cashfree + Supabase)

- Merchant-initiated refund endpoint: `POST /api/cashfree/refund-order`
- Supports both:
  - order refunds (`orderId`)
  - subscription refunds (`subscriptionId`, `entityType: "subscription"`)
- Tracks `refund_id`, `refund_speed` (`STANDARD`/`INSTANT`), and `refund_status` in Supabase `refunds` table.

### Required SQL migration

Run in Supabase SQL Editor:

- `supabase-user-payments.sql`

This now provisions both `user_payments` and `refunds` tables.

### Cashfree webhook

Configure Cashfree webhook URL to:

- `https://<your-domain>/api/cashfree/webhook`

Webhook events that include refund payloads (for example refund status check events) are verified and reconciled into Supabase.
