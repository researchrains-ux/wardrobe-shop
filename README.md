# The Leftover Wardrobe

A clean, minimal clothing shop with Stripe payments, cash-on-pickup option, photo uploads from phone, and a password-protected admin panel.

---

## Tech Stack

- **Next.js 14** — frontend + API routes
- **Supabase** — database + photo storage (free tier)
- **Stripe** — card payments + webhooks
- **Vercel** — hosting (free tier)

---

## Setup (step by step)

### 1. Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In the SQL Editor, paste and run the contents of `supabase-schema.sql`
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Stripe

1. Go to [stripe.com](https://stripe.com) and create a free account
2. Go to **Developers → API keys** and copy:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
3. Link your Revolut account under **Settings → Bank accounts** in Stripe — payouts land there automatically
4. Set up webhook after deploying (see step 5)

### 3. Install and run locally

```bash
npm install
cp .env.local.example .env.local
# Fill in .env.local with your keys
npm run dev
```

Visit http://localhost:3000 for the shop, http://localhost:3000/admin for the admin panel.

### 4. Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com and import the repo
3. Add all environment variables from .env.local in the Vercel dashboard
4. Set NEXT_PUBLIC_BASE_URL to your Vercel URL (e.g. https://your-shop.vercel.app)
5. Deploy

### 5. Set up Stripe webhook (after deploying)

1. In Stripe dashboard → Developers → Webhooks → Add endpoint
2. URL: https://your-shop.vercel.app/api/webhooks/stripe
3. Select event: checkout.session.completed
4. Copy the Signing secret → paste as STRIPE_WEBHOOK_SECRET in Vercel env vars
5. Redeploy

---

## Using the admin panel

Go to /admin and log in with your ADMIN_PASSWORD.

**Adding items:** Items tab → + Add item → tap photo area to upload from phone camera roll → fill in details → Add item

**Managing pickup slots:** Slots tab → + Add slot → enter date, time, location. Active slots show on storefront immediately. Hide or delete anytime.

**Tracking orders:**
- Card payments: automatically marked Paid via Stripe webhook
- Cash pickups: shown as "Cash due" — click "Mark as paid" once you collect the money

---

## How payment tracking works

- **Card**: Stripe webhook fires when payment succeeds → order marked paid, items marked sold automatically
- **Cash**: Order created as pending, items reserved immediately → you manually mark paid in admin after collecting cash

---

## Folder structure

```
pages/
  index.js                  storefront
  order-confirmed.js        confirmation page
  admin/
    index.js                login
    dashboard.js            admin panel
  api/
    checkout.js             creates Stripe session or cash order
    admin/
      login.js / logout.js
      items.js              add/edit/delete items
      slots.js              manage pickup slots
      orders.js             mark orders paid
    webhooks/
      stripe.js             handles Stripe payment confirmation

components/
  ItemCard.js               product card
  CartDrawer.js             3-step checkout drawer
  AddItemModal.js           add item form with photo upload
  SlotModal.js              add pickup slot form

lib/
  supabase.js / stripe.js / auth.js

styles/                     CSS modules
supabase-schema.sql         run once in Supabase SQL editor
```
