# Getting Started with Google Authentication

## Overview

Your Intern Time Tracker app now includes Google Login authentication powered by Supabase. This guide will walk you through the complete setup process.

## What's Been Implemented

✅ **Login Page** - Clean, simple Google OAuth login page  
✅ **Route Protection** - Unauthenticated users redirected to login  
✅ **User Session** - User info displayed with logout button  
✅ **Auth Hooks** - `useAuth()` hook for managing authentication state  

## Quick Start

### 1. Get Supabase & Google Credentials (5 minutes)

**Supabase Setup:**
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings → API**
4. Copy:
   - `Project URL` → paste to `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
   - `anon public key` → paste to `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

**Google OAuth Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Search for and enable **"Google+ API"**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Choose **Web application**
   - Add Authorized Redirect URI: `http://localhost:3000/auth/callback`
   - Click **Create** and copy your **Client ID**
5. Go back to Supabase → **Authentication** → **Providers** → **Google**
   - Paste your Google Client ID
   - Click **Save**

### 2. Setup Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run the App

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and you'll be redirected to the login page.

---

## File Structure

New files created for authentication:

```
app/
├── login/
│   └── page.tsx          # Login page with Google button
├── auth/
│   └── callback/
│       └── route.ts      # OAuth callback handler
└── page.tsx              # Updated with auth protection

hooks/
└── useAuth.ts            # Authentication hook

lib/
└── supabase.ts           # Supabase client configuration

middleware.ts             # Route protection middleware
```

---

## Authentication Flow

```
1. User visits app → Middleware checks session
   ↓
2. No session? → Redirect to /login
   ↓
3. User clicks "Sign in with Google"
   ↓
4. Redirected to Google login
   ↓
5. User authenticates with Google
   ↓
6. Redirected to /auth/callback with auth code
   ↓
7. Session created, redirected to home page
   ↓
8. User can now access DTR tracker
```

---

## Using the Auth Hook

In any component, use the `useAuth()` hook to access authentication:

```typescript
import { useAuth } from "@/hooks/useAuth";

export default function MyComponent() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) return <p>Loading...</p>;
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Not authenticated</p>
      )}
    </div>
  );
}
```

---

## Next Steps: Connect to Supabase Database

Currently, time records are stored in memory. To persist data per user:

### 1. Create a table in Supabase:

Go to Supabase → **SQL Editor** and run:

```sql
CREATE TABLE time_records (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  am_in TIME,
  am_out TIME,
  pm_in TIME,
  pm_out TIME,
  total_hours DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS (Row Level Security)
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;

-- Create policy so users can only see their own records
CREATE POLICY "Users can see own records"
  ON time_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own records"
  ON time_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records"
  ON time_records
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records"
  ON time_records
  FOR DELETE
  USING (auth.uid() = user_id);
```

### 2. Update your API route to use Supabase:

Update `/app/api/time-records/route.ts` to fetch from Supabase instead of in-memory storage.

---

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure your redirect URI in Google Cloud matches your app URL
- For local: `http://localhost:3000/auth/callback`
- For production: `https://yourdomain.com/auth/callback`

### "Missing Supabase environment variables"
- Check that `.env.local` exists in the project root
- Verify the variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### User can't logout
- Clear browser cookies and try again
- Check that the logout button is working in the page header

### Login page appears but button doesn't work
- Make sure Google OAuth is enabled in Supabase
- Verify Client ID is correct in Supabase settings

---

## Customization

### Change login page design
Edit `/app/login/page.tsx` to customize styles and layout

### Change redirect after login
Edit `/app/login/page.tsx` - the `router.push("/")` determines where users go after login

### Add additional user info
The `user` object from `useAuth()` contains:
- `user.email`
- `user.id` (unique user ID for database records)
- `user.user_metadata` (any custom data you add)

---

## Security Notes

✅ Environment variables are prefixed with `NEXT_PUBLIC_` so they're safe for frontend  
✅ Middleware protects routes automatically  
✅ Supabase handles password hashing and security  
✅ Use Row Level Security (RLS) policies to protect database records  

---

## Support

For more help:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
