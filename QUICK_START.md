# Quick Setup Checklist

Complete authentication setup in 10 minutes!

## ✅ Checklist

- [ ] **Step 1: Create Supabase Account**
  - [ ] Go to [supabase.com](https://supabase.com)
  - [ ] Create free account
  - [ ] Create new project
  - [ ] Copy Project URL and anon key

- [ ] **Step 2: Get Google OAuth Credentials**
  - [ ] Go to [console.cloud.google.com](https://console.cloud.google.com)
  - [ ] Create/select project
  - [ ] Enable Google+ API
  - [ ] Create OAuth 2.0 credential (Web app)
  - [ ] Add redirect URI: `http://localhost:3000/auth/callback`
  - [ ] Copy Client ID

- [ ] **Step 3: Enable Google OAuth in Supabase**
  - [ ] Go to Authentication → Providers
  - [ ] Enable Google
  - [ ] Paste Google Client ID
  - [ ] Click Save

- [ ] **Step 4: Setup Environment Variables**
  - [ ] Create `.env.local` file in project root
  - [ ] Add: `NEXT_PUBLIC_SUPABASE_URL=<your_url>`
  - [ ] Add: `NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_key>`

- [ ] **Step 5: Install & Run**
  - [ ] Run `npm install`
  - [ ] Run `npm run dev`

- [ ] **Step 6: Test**
  - [ ] Visit http://localhost:3000
  - [ ] Click "Sign in with Google"
  - [ ] Should see DTR tracker dashboard
  - [ ] Check user email in top-right corner

## 📍 Key URLs

| Resource | URL |
|----------|-----|
| Supabase | https://app.supabase.com |
| Google Cloud | https://console.cloud.google.com |
| Local Dev | http://localhost:3000 |
| Login Page | http://localhost:3000/login |

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.env.local` | Store Supabase credentials |
| `app/login/page.tsx` | Login page |
| `hooks/useAuth.ts` | Auth hook |
| `middleware.ts` | Route protection |
| `GETTING_STARTED.md` | Full setup guide |

## 🔧 Environment Variables Template

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Redirect URI mismatch | Check Google console has exact URI |
| Missing env vars | Ensure `.env.local` exists in root |
| Login button unresponsive | Verify Google OAuth enabled in Supabase |
| Stuck on loading | Check browser console for errors |

## 📞 Need Help?

1. Read [GETTING_STARTED.md](./GETTING_STARTED.md)
2. Check [AUTH_SETUP.md](./AUTH_SETUP.md)
3. Review browser console for errors (F12)

---

**Time to complete:** ~10 minutes ⏱️
