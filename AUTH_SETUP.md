# Google Authentication Setup Guide

This guide will help you configure Google Login with Supabase for the Intern Time Tracker application.

## Prerequisites
- A Google Cloud project with OAuth 2.0 credentials
- A Supabase project
- Node.js and npm installed

## Step 1: Create a Google OAuth 2.0 Credential

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - In the left sidebar, go to **APIs & Services** > **Library**
   - Search for "Google+ API"
   - Click on it and press **Enable**
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Select **Web application**
   - Add authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (for local development)
     - `https://yourdomain.com/auth/callback` (for production)
   - Click **Create**
   - Copy your **Client ID** (you'll need this later)

## Step 2: Configure Supabase for Google OAuth

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to **Authentication** > **Providers**
4. Find **Google** and click **Enable**
5. Paste your Google OAuth **Client ID** from Step 1
6. Configure the Authorized redirect URIs in Google Cloud Console (if not done already)

## Step 3: Get Supabase Credentials

1. In your Supabase project, go to **Settings** > **API**
2. Copy:
   - **Project URL** (copy this to `NEXT_PUBLIC_SUPABASE_URL`)
   - **Public API key (anon)** (copy this to `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in the project root (if not already created)
2. Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Replace the values with your actual Supabase credentials.

## Step 5: Run the Application

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and you should be redirected to `/login` where you can sign in with Google.

## Features

### Automatic Redirects
- **Not logged in?** → Redirected to `/login`
- **Logged in?** → Can access the DTR tracker at `/`

### User Session Management
- User email displayed in the top-right corner
- **Logout** button to sign out and return to login page
- Session persists across page refreshes

### Authentication Flow
1. User clicks "Sign in with Google" on `/login`
2. Redirected to Google login page
3. Upon successful authentication, redirected to `/auth/callback`
4. Session is saved and user is redirected to home page

## Troubleshooting

### Issue: Redirect URI mismatch
- **Solution:** Ensure the redirect URI in Google Cloud Console matches exactly with your app's callback URL
- For local development: `http://localhost:3000/auth/callback`
- For production: `https://yourdomain.com/auth/callback`

### Issue: "Missing Supabase environment variables"
- **Solution:** Make sure `.env.local` file exists in the root directory with the correct credentials

### Issue: Cannot sign out
- **Solution:** Clear browser cookies/cache and try again

## Database Setup (Optional)

To store user DTR records, you can create a Supabase table:

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
```

## Next Steps

- Customize the login page styling in `/app/login/page.tsx`
- Update your API routes to filter records by authenticated user
- Configure additional Supabase security rules (RLS)

For more information, visit:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth/overview)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
