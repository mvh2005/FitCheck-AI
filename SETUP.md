# FitCheck.ai — Setup Guide (Post-Migration)

## Prerequisites
- Node.js 20+
- Expo CLI: `npm install -g expo-cli`
- Supabase CLI: `npm install -g supabase`
- Expo Go app on your phone (for dev) OR Android emulator/iOS simulator

---

## Step 1: Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Note your **Project URL** and **anon public key** from Settings → API

---

## Step 2: Run the database migration

In the Supabase **SQL Editor**, paste and run:
```
supabase/migrations/001_initial_schema.sql
```

This creates all tables, RLS policies, storage bucket, and triggers.

---

## Step 3: Configure Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Set your OpenAI secret (NEVER commit this)
supabase secrets set OPENAI_API_KEY=sk-...

# Deploy both functions
supabase functions deploy analyze-clothing
supabase functions deploy generate-outfits
```

---

## Step 4: Configure the mobile app

```bash
cd mobile
cp .env.example .env
```

Edit `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Step 5: Install and run

```bash
cd mobile
npm install
npm start
```

Scan the QR code with **Expo Go** on your phone.

---

## Architecture recap

```
Mobile App (React Native + Expo Router + TypeScript)
  │
  ▼
Supabase Auth → JWT → RLS on all tables
Supabase Storage → wardrobe/{user_id}/photos
Supabase PostgreSQL → profiles, clothing_items, outfits, favorites
  │
  ▼ (via supabase.functions.invoke)
Edge Functions (Deno)
  │
  ├── analyze-clothing → OpenAI GPT-4o Vision
  └── generate-outfits → OpenAI GPT-4o Text + structured JSON
```

## Key security properties

| Property | Implementation |
|----------|---------------|
| OpenAI key | Lives only in Supabase Edge Function secrets |
| Auth tokens | Stored in device Keychain via expo-secure-store |
| Data isolation | Row Level Security on every table |
| Image access | Supabase Storage with path-based RLS |

## File structure (new)

```
mobile/
├── app/                    ← Expo Router screens
│   ├── _layout.tsx         ← Root: auth gate + QueryClient
│   ├── (auth)/             ← Login + Signup
│   ├── (tabs)/             ← Home, Collections, Profile
│   ├── outfit/[id].tsx     ← Outfit detail modal
│   └── add-item.tsx        ← Add clothing modal
├── components/             ← Reusable UI
├── lib/
│   ├── supabase.ts         ← Client + all DB types
│   └── api.ts              ← Storage upload + Edge Function calls
├── store/
│   ├── authStore.ts        ← Zustand auth state
│   └── wardrobeStore.ts    ← Zustand wardrobe cache
└── utils/
    └── theme.ts            ← Design tokens (TypeScript)

supabase/
├── migrations/
│   └── 001_initial_schema.sql
├── functions/
│   ├── analyze-clothing/index.ts
│   └── generate-outfits/index.ts
└── config.toml
```
