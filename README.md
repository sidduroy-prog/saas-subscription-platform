# SaaS Subscription Management Platform

A full-stack platform to manage SaaS subscriptions, plans, and billing — with Stripe-powered checkout, automated invoicing, and an admin analytics dashboard.

## Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Payments:** Stripe API (Checkout + Webhooks, test mode)
- **Auth:** JWT-based authentication with role-based access control

## Features
- Subscription plans (Free / Pro / Enterprise) with Stripe Checkout
- Automated billing via Stripe webhooks (subscription created/updated, invoice paid)
- Billing/invoice history per user
- Admin dashboard: total users, active subscriptions, revenue by plan
- Role-based access control (User / Admin)

## Project Structure
```
saas-platform/
├── backend/
│   ├── config/ (db.js, schema.sql)
│   ├── models/ (User, Plan, Subscription, Invoice)
│   ├── middleware/auth.js
│   ├── routes/ (auth, plans, subscriptions, webhooks, invoices, dashboard)
│   └── server.js
└── frontend/
    ├── app/ (login, register, pricing, dashboard, admin)
    ├── components/Navbar.jsx
    ├── context/AuthContext.js
    └── lib/api.js
```

## Setup Instructions

### 1. PostgreSQL Database
Create a database and run the schema:
```bash
createdb saas_subscription
psql -U postgres -d saas_subscription -f backend/config/schema.sql
```

### 2. Stripe Test Account
1. Sign up at https://dashboard.stripe.com/register (free)
2. Get your test **Secret Key** from Developers → API keys
3. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks locally:
   ```bash
   stripe listen --forward-to localhost:5001/api/webhooks/stripe
   ```
   This prints a webhook signing secret (`whsec_...`) — use it in `.env`.

### 3. Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in PG_PASSWORD, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
npm run dev
```

### 4. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Visit `http://localhost:3000`.

### Test Stripe Payments
Use Stripe's test card: `4242 4242 4242 4242`, any future expiry, any CVC.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and get JWT |
| GET | /api/plans | List all subscription plans |
| POST | /api/subscriptions/create-checkout-session | Start Stripe Checkout |
| GET | /api/subscriptions/me | Get logged-in user's subscription |
| GET | /api/subscriptions/all | Admin: all subscriptions |
| POST | /api/webhooks/stripe | Stripe webhook receiver |
| GET | /api/invoices | Billing history |
| GET | /api/dashboard/stats | Admin analytics |

## Author
Mitturoy
