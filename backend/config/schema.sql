-- Run this once to set up the database schema
-- Usage: psql -U postgres -d saas_subscription -f schema.sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'user' or 'admin'
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10, 2) NOT NULL,
  stripe_price_id VARCHAR(255),
  features JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES plans(id),
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'inactive', -- active, canceled, past_due, inactive
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id),
  stripe_invoice_id VARCHAR(255),
  amount_paid NUMERIC(10, 2),
  status VARCHAR(50),
  invoice_date TIMESTAMP DEFAULT NOW()
);

-- Seed default plans
INSERT INTO plans (name, description, price_monthly, features) VALUES
  ('Free', 'Get started at no cost', 0, '["1 project", "Community support"]'),
  ('Pro', 'For growing teams', 29.00, '["Unlimited projects", "Priority support", "Advanced analytics"]'),
  ('Enterprise', 'For large organizations', 99.00, '["Unlimited everything", "Dedicated support", "Custom integrations"]')
ON CONFLICT DO NOTHING;
