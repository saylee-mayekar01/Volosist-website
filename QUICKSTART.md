# Quick Start Guide

## 🚀 Quick Commands

### Development
```bash
npm run dev
# Open http://localhost:3000
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

Edit `.env.local`:
```env
VITE_API_URL=http://localhost:3001
VITE_API_TIMEOUT=30000
VITE_CORS_ENABLED=true
```

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
