# Clarity — Mental Health & Wellness Platform

> Supporting UN SDG Target 3.4 · Privacy-first · Evidence-based

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| Auth & DB | Supabase (PostgreSQL + Auth) |
| Routing | React Router v7 |
| Icons | Lucide React |

---

## Features

- 🧠 **Mood & Stress Tracking** — Log daily entries with mood, stress level, and journal notes
- 📊 **Analytics Dashboard** — Stress trend chart, mood donut, weekly bar chart
- 🛡 **ZK Wellness Proof** — Privacy-preserving streak verification (see below)
- 💬 **Therapy Resources** — Curated mental health tools and exercises
- 🔒 **Secure Auth** — Email/password login via Supabase Auth

---

## ZK Wellness Proof

Generate a **privacy-preserving proof** of your wellness streak:

1. Go to **Analytics** → click **"Generate ZK Wellness Proof"**
2. SHA-256 hash of entry IDs/timestamps only — no mood/journal/stress data included
3. Hash stored in public `wellness_proofs` Supabase table
4. Share via **"Copy Shareable Verify Link"** → `yourapp.com/verify?hash=xxx`
5. Anyone visits `/verify` (no login) → sees a certificate-style card confirming your streak

> **Note:** This is a simulated ZK-proof pattern for hackathon purposes (hash + Supabase lookup).
> A production version would use Midnight's testnet with a Compact circuit for real zero-knowledge verification.

---

## Before vs After

| | Before | After |
|---|---|---|
| Proving a streak | Required sharing raw journal entries, mood logs, and stress scores | Only a SHA-256 hash is shared — no personal data leaves the user's device |
| Verification | Verifier had to see your private wellness data | Verifier queries `wellness_proofs` by hash — gets streak length only |
| Privacy | Zero — full data exposure | Full — no mood, journal, or stress data is ever revealed |

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create `.env` in the project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```
Get values from: **Supabase Dashboard → Settings → API**

### 3. Run Supabase migration
**Supabase Dashboard → SQL Editor:**
```sql
create table if not exists public.wellness_proofs (
  id            uuid primary key default gen_random_uuid(),
  proof_hash    text not null unique,
  streak_length int not null,
  proof_type    text not null default 'streak',
  avg_stress    numeric,
  created_at    timestamptz not null default now()
);
alter table public.wellness_proofs enable row level security;
create policy "Public can read proofs" on public.wellness_proofs for select using (true);
create policy "Authenticated users can insert proofs" on public.wellness_proofs for insert to authenticated with check (true);
```

### 4. Enable Email Auth
**Supabase Dashboard → Authentication → Providers → Email → Enable**

### 5. Start dev server
```bash
npm run dev
```

---

## Project Structure

```
src/
├── context/
│   ├── AuthContext.tsx        # Supabase auth state
│   └── WellnessContext.tsx   # Diagnostics CRUD + ZK proof logic
├── pages/
│   ├── RootLandingPage.tsx   # Public home page
│   ├── LoginPage.tsx
│   ├── SignUpPage.tsx
│   ├── DashboardPage.tsx
│   ├── AnalyticsPage.tsx     # Charts + ZK Wellness Proof modal
│   ├── TherapyPage.tsx
│   ├── AboutPage.tsx
│   └── VerifyPage.tsx        # Public proof verification (no login)
├── components/
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   └── ErrorBoundary.tsx
└── lib/
    └── supabase.ts           # Supabase client
```

---

## Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home / landing page |
| `/login` | Public | Login |
| `/signup` | Public | Sign up |
| `/verify` | Public | Verify a wellness proof hash (certificate card) |
| `/dashboard` | Auth required | Daily check-in |
| `/analytics` | Auth required | Charts + ZK proof |
| `/therapy` | Auth required | Resources |

---

© 2026 Clarity. Supporting UN SDG Target 3.4.
