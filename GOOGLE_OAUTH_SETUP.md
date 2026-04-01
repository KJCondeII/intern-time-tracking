# Step-by-Step Google OAuth Setup

## Step 1: Go to Google Cloud Console

1. Open [console.cloud.google.com](https://console.cloud.google.com) in your browser
2. Sign in with your Google account (the same one you used to create the project)
3. At the top, you should see a project selector dropdown
4. Click on it and select your project (or create a new one if you don't have one)

## Step 2: Enable Google+ API

1. In the left sidebar, click **APIs & Services**
2. Click **Library**
3. Search for **"Google+ API"** in the search box
4. Click on "Google+ API" from the results
5. Click the **ENABLE** button (blue button at the top)
6. Wait for it to enable (takes a few seconds)

## Step 3: Create OAuth Credentials

1. In the left sidebar, click **APIs & Services** → **Credentials**
2. Click the **+ CREATE CREDENTIALS** button (top left)
3. Choose **OAuth client ID**
4. A dialog appears saying "To create an OAuth client ID, you must first set a consent screen"
5. Click **CONFIGURE CONSENT SCREEN**

## Step 4: Configure Consent Screen

1. Select **External** (for testing/development)
2. Click **CREATE**
3. Fill in the form:
   - **App name**: "Intern Time Tracker"
   - **User support email**: Use your email
   - **Developer contact**: Use your email
4. Scroll down and click **SAVE AND CONTINUE**
5. Skip the "Scopes" step, just click **SAVE AND CONTINUE**
6. Skip "Test users", click **SAVE AND CONTINUE**
7. Review and click **BACK TO DASHBOARD**

## Step 5: Create OAuth 2.0 Client ID

1. Go back to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. For **Application type**, select **Web application**
4. Give it a name: "Intern Time Tracker"
5. Under **Authorized redirect URIs**, click **+ ADD URI**
6. Add this URL: `http://localhost:3000/auth/callback`
7. Click **CREATE**
8. A popup shows your **Client ID** and **Client Secret**
9. **COPY your Client ID** (you'll need this for Supabase)
10. Keep this page open

## Step 6: Go to Supabase Dashboard

1. Open [app.supabase.com](https://app.supabase.com)
2. Sign in with your Supabase account
3. Select your project: "qkfoyfdkketgwhgouznv"

## Step 7: Enable Google Provider in Supabase

1. In the left sidebar, click **Authentication**
2. Click **Providers** (or "Auth Providers")
3. Find **Google** in the list
4. Click on **Google** to expand it
5. Toggle the switch to **ENABLE** it
6. You'll see a form asking for:
   - **Client ID** (Authorized Client IDs)
   - **Client Secret** (Service account JSON)

## Step 8: Add Google Client ID to Supabase

1. Go back to Google Cloud Console (your OAuth credentials page)
2. Copy your **Client ID** (the long string)
3. Go back to Supabase in the browser
4. In the Google provider settings, paste the **Client ID** in the "Authorized Client IDs" field
5. For now, leave **Client Secret** empty (it's optional for browser clients)
6. Click **SAVE**

## Step 9: Verify Callback URL in Supabase

1. In Supabase, still on the Authentication page
2. Click on **URL Configuration** (left sidebar)
3. Check that your **Site URL** is set to: `http://localhost:3000`
4. Make sure **Redirect URLs** includes: `http://localhost:3000/auth/callback`
5. If not there, click **+ Add URL** and add it

## Step 10: Test It

1. Go to `http://localhost:3000` in your browser
2. You should be redirected to `/login`
3. Click **"Sign in with Google"**
4. You should be redirected to Google login
5. Sign in with your Google account
6. Accept the permissions
7. You should be redirected back to your app and logged in!

---

## If You Still Get an Error:

**"redirect_uri_mismatch"** error means:
- Double-check the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/auth/callback`
- Make sure there are no extra spaces or typos

**"This app's request is invalid"** error means:
- Supabase might not have Google provider enabled
- Check that you clicked SAVE in Supabase

**"Unsupported provider"** error means:
- Google is not enabled in Supabase yet
- Go to Supabase Authentication → Providers and make sure Google switch is ON

---

## Important Notes:

- Your Supabase credentials are already in `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://qkfoyfdkketgwhgouznv.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_nVgexlidpEqbMyOXMgO8Yw_NNFrYjoB
  ```

- Once working locally, for production you'll need to:
  1. Add production URL to Google Cloud Console: `https://yourdomain.com/auth/callback`
  2. Change Supabase Site URL to: `https://yourdomain.com`
  3. Update `.env.local` with production values

---

## Quick Checklist:

- [ ] Google+ API is **ENABLED**
- [ ] OAuth Client ID is created in Google Cloud
- [ ] Redirect URI in Google Cloud is: `http://localhost:3000/auth/callback`
- [ ] Google provider is **ENABLED** in Supabase
- [ ] Google Client ID is pasted in Supabase
- [ ] Site URL in Supabase is: `http://localhost:3000`
- [ ] Supabase has redirect URL: `http://localhost:3000/auth/callback`

✅ After these steps, your login should work!
