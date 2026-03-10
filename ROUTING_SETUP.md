# Routing & State Management Setup Guide

## Overview
This project has been fully migrated from manual view state management to **React Router v6** with comprehensive form state management and CORS handling.

## ✅ What Has Been Implemented

### 1. React Router Integration
- **Installed**: `react-router-dom` package
- **Router Setup**: Implemented `BrowserRouter` with proper route configuration
- **Protected Routes**: Dashboard route is protected and requires authentication
- **Route Map**:
  - `/` - Home page (landing page with all sections)
  - `/signin` - Sign in page
  - `/signup` - Sign up page
  - `/dashboard` - Protected dashboard (requires authentication)
  - `/contact` - Contact form page
  - `/workflows` - AI Workflows solution page
  - `/infrastructure` - Infrastructure solution page
  - `/audits` - System Audits solution page
  - `/company` - Company & Process page
  - `/about` - About page
  - `/privacy` - Privacy Policy page
  - `/terms` - Terms & Conditions page
  - `/pricing` - Pricing page
  - `/careers`, `/help`, `/community`, `/cases` - Expansion pages

### 2. Form State Management
All pages now have proper `useState` for user inputs:

#### ContactPage
- **Form Fields with State**:
  - `firstName` - First name input
  - `lastName` - Last name input
  - `email` - Email input
  - `phone` - Phone number input
  - `service` - Service dropdown
  - `budget` - Budget dropdown
  - `message` - Message textarea

- **Validation**:
  - Email validation using `validateEmail()` utility
  - Phone validation using `validatePhoneNumber()` utility
  - Required field checking
  - Real-time error clearing on user input

- **Features**:
  - Form validation before submission
  - Error display for invalid fields
  - Loading state during submission
  - Success message display
  - API integration with fallback to simulation

#### DashboardPage
- **Form Fields with State**:
  - `activeTab` - Current dashboard tab
  - `searchQuery` - Search input for resources
  - Settings form fields (firstName, lastName)
  - Save success state

- **Features**:
  - Input field state management
  - Settings persistence
  - Success feedback on save

### 3. CORS & API Configuration

#### Environment Variables (.env.local)
```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_TIMEOUT=30000

# CORS Configuration
VITE_CORS_ENABLED=true
VITE_CORS_ORIGIN=*

# Development Settings
VITE_DEV_PORT=3000
VITE_DEBUG_MODE=false
```

#### Vite Config CORS Proxy
The `vite.config.ts` now includes a proxy for API calls:
```typescript
proxy: {
  '/api': {
    target: process.env.VITE_API_URL || 'http://localhost:3001',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  }
}
```

#### API Client Utilities
New `apiClient` in `lib/utils.ts` with:
- `request()` - Generic request handler with timeout
- `get()` - GET requests
- `post()` - POST requests
- `put()` - PUT requests
- `delete()` - DELETE requests

**Features**:
- Automatic timeout handling (30 seconds default)
- Error handling with detailed messages
- CORS-friendly headers
- AbortController for cancellation

### 4. Validation Utilities
Added validation functions in `lib/utils.ts`:
- `validateEmail()` - Regex-based email validation
- `validatePhoneNumber()` - Phone number validation
- `validateUrl()` - URL validation using URL API

## 🚀 How to Use

### Navigation
```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  // Navigate to a route
  navigate('/contact');
  navigate('/dashboard');
}
```

### API Calls
```tsx
import { apiClient } from '../lib/utils';

// GET request
const data = await apiClient.get('/api/data');

// POST request with data
const result = await apiClient.post('/api/submit', formData);

// Error handling
try {
  await apiClient.get('/api/users');
} catch (error) {
  console.error('Failed to fetch:', error.message);
}
```

### Form State Management
```tsx
import { useState } from 'react';
import { validateEmail } from '../lib/utils';

function Form() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e) => {
    setEmail(e.target.value);
    // Clear error on change
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };
  
  const validate = () => {
    if (!validateEmail(email)) {
      setErrors({ email: 'Invalid email' });
      return false;
    }
    return true;
  };
  
  return (
    <input 
      value={email}
      onChange={handleChange}
      placeholder="Enter email"
    />
  );
}
```

## 🔧 Running the Application

### Development
```bash
npm run dev
# Server will run on http://localhost:3000
```

### Build
```bash
npm run build
# Creates optimized production build in dist/
```

### Production Preview
```bash
npm run preview
# Preview production build locally
```

## 🛡️ CORS Handling

### How CORS Issues Are Solved
1. **Vite Proxy**: Development server proxies API calls to prevent CORS
2. **Supabase Integration**: Uses built-in CORS support for Supabase
3. **API Client**: Handles proper CORS headers automatically
4. **Fallback Mechanism**: Forms work without backend (simulation mode)

### Backend Setup (if needed)
If you have your own backend API, ensure it includes CORS headers:
```javascript
// Express.js example
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
```

## 📱 Route Protection
The dashboard route is automatically protected:
```tsx
<Route 
  path="/dashboard" 
  element={user ? <DashboardPage /> : <Navigate to="/signin" replace />} 
/>
```

## 🔄 Supabase Authentication
Authentication is automatically managed:
- On app load, checks for existing session
- Automatically redirects to dashboard if logged in
- Logs out clears session and redirects to home
- Real-time auth state updates

## 📝 Form Validation Examples

### Contact Form
```tsx
const validateForm = (): boolean => {
  const newErrors: Partial<ContactFormData> = {};
  
  if (!formData.firstName.trim()) 
    newErrors.firstName = "First name is required";
  
  if (!validateEmail(formData.email)) 
    newErrors.email = "Valid email is required";
  
  if (!validatePhoneNumber(formData.phone)) 
    newErrors.phone = "Valid phone number is required";
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

## 🚨 Troubleshooting

### Routes Not Working
- Ensure `BrowserRouter` wraps your app
- Check route paths match your links
- Verify useNavigate() is called inside Router context

### CORS Errors
- Check `VITE_API_URL` in `.env.local`
- Ensure proxy is configured in `vite.config.ts`
- Verify backend allows CORS headers
- Check browser DevTools Network tab for actual error

### Form Not Submitting
- Validate form before submission
- Check error console for API errors
- Ensure apiClient is imported correctly
- Fallback to simulation mode if no backend

### State Not Updating
- Use `value={state}` and `onChange={handleChange}`
- Ensure handlers update state correctly
- Check for typos in input `id` attributes

## 📦 Dependencies
- `react-router-dom` - v6+ (routing)
- `react` - 19.0.0 (ui framework)
- `framer-motion` - animations
- `@supabase/supabase-js` - backend as a service

## 🎯 Next Steps
1. Run `npm run dev` to start development server
2. Test all routes by navigating through the app
3. Submit contact form to verify API/simulation
4. Check console for any errors
5. Connect to your backend API by updating `VITE_API_URL`

---
**Last Updated**: January 2026
**Version**: 1.0.0
