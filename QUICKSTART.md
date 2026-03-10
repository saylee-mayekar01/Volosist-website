# Quick Start Guide

## 🚀 Quick Commands

### Development
```bash
npm run dev
# Open http://localhost:3000
```

### Payment Backend (Cashfree)
```bash
npm run dev:server
# Runs secure Cashfree API on http://localhost:3001
```

### Production Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

## 🔗 Available Routes

```
/ → Home
/signin → Sign In
/signup → Sign Up
/dashboard → Dashboard (protected)
/contact → Contact Form
/workflows → AI Workflows
/infrastructure → Infrastructure
/audits → System Audits
/company → Company Info
/about → About
/privacy → Privacy Policy
/terms → Terms
/pricing → Pricing
```

## 📝 Form State Example

```tsx
import { useState } from 'react';
import { validateEmail } from '../lib/utils';

function ContactForm() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErrors({ email: 'Invalid email' });
      return;
    }
    // Submit form
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={handleChange} />
      {errors.email && <p>{errors.email}</p>}
    </form>
  );
}
```

## 🔄 Navigation Example

```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate('/contact')}>
      Go to Contact
    </button>
  );
}
```

## 📡 API Call Example

```tsx
import { apiClient } from '../lib/utils';

// GET
const data = await apiClient.get('/api/users');

// POST
const result = await apiClient.post('/api/contact', formData);

// With error handling
try {
  await apiClient.post('/api/submit', data);
} catch (error) {
  console.error(error.message);
}
```

## ⚙️ Environment Variables

No frontend env vars needed for Cashfree — all keys stay in backend.

Edit `server/.env.local`:
```env
PORT=3001
CASHFREE_APP_ID=your_production_app_id
CASHFREE_SECRET_KEY=your_production_secret_key
CASHFREE_API_VERSION=2023-08-01
CASHFREE_DEFAULT_REFUND_SPEED=STANDARD
APP_ORIGIN=https://volosist.com
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_REFUNDS_TABLE=refunds
SUPABASE_USER_PAYMENTS_TABLE=user_payments
```

⚠️ Cashfree credentials must be in `server/.env.local` (backend only), never in frontend code.

## 🗄️ Supabase Payment + Refund Setup

Run the SQL script once in Supabase SQL Editor:

```sql
-- file in this repo
supabase-user-payments.sql
```

This creates the `user_payments` table with refund lifecycle fields used by dashboard/admin flows.
It also creates a dedicated `refunds` table for Cashfree refund reconciliation and webhook updates.

Refund execution also requires running the local backend server:

```bash
npm run dev:server
```

The admin refund approval action calls `POST /api/cashfree/refund-order` on this backend.

Request supports:

- Order refund:
  - `orderId`, `refundAmount`, `refundId`, `refundSpeed`
- Subscription refund:
  - `entityType: "subscription"`, `subscriptionId`, `refundAmount`, `refundId`, `refundSpeed`

## 🔔 Cashfree Webhook Setup

Set webhook URL in Cashfree dashboard:

```text
https://<your-domain>/api/cashfree/webhook
```

The backend verifies webhook signature and updates refund status into:

- in-memory refund ledger (`/api/cashfree/refunds`)
- Supabase `refunds` table
- Supabase `user_payments` refund status fields (for order-linked refunds)

## 🔐 Protected Routes

Dashboard requires authentication - automatically redirects to sign in if not logged in.

## 📦 Key Packages

- `react-router-dom` - Routing
- `@supabase/supabase-js` - Backend
- `framer-motion` - Animations
- `tailwindcss` - Styling

## ✅ Status

- ✅ Routing implemented
- ✅ Form state management added
- ✅ CORS configured
- ✅ Validation utilities added
- ✅ Build successful
- ✅ Ready to use

## 📞 Support

Check `ROUTING_SETUP.md` for detailed documentation.
Check `PROJECT_UPDATES.md` for complete change log.

---
Everything is configured and ready to go! 🎉
