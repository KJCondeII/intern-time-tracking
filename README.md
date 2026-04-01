# Intern Time Tracker - DTR System

A modern, simple time tracking application built with Next.js and Supabase for managing daily time records (DTR) with Google authentication.

## Features

✅ **Google Authentication** - Secure login with Google OAuth via Supabase  
✅ **Daily Time Tracking** - Record AM/PM in and out times  
✅ **Automatic Hour Calculation** - Calculates total hours worked automatically  
✅ **Export Options** - Export records to PDF or CSV format  
✅ **Responsive Design** - Mobile-friendly interface  
✅ **User Sessions** - Automatic session management and persistence  

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Supabase account (free at [supabase.com](https://supabase.com))
- A Google Cloud project with OAuth credentials

### 1. Setup Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Google OAuth

For detailed setup instructions, see **[GETTING_STARTED.md](./GETTING_STARTED.md)**

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and sign in with Google!

## Documentation

- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Complete setup guide for Google OAuth and Supabase
- **[AUTH_SETUP.md](./AUTH_SETUP.md)** - Detailed authentication configuration steps

## Project Structure

```
app/
├── login/                  # Google login page
├── auth/callback/          # OAuth callback handler  
├── api/time-records/       # REST API for time records
└── page.tsx               # Main DTR dashboard

hooks/
└── useAuth.ts             # Authentication hook

lib/
├── supabase.js            # Legacy Supabase client
└── supabase.ts            # Supabase client configuration

middleware.ts              # Route protection
```

## Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous API key |

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in the Vercel dashboard
4. Deploy automatically on git push

For more details, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

