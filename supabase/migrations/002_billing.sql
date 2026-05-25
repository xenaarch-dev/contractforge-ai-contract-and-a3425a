-- Free trial tracker
CREATE TABLE IF NOT EXISTS free_trials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text UNIQUE NOT NULL,
  contract_id text,
  used_at timestamptz DEFAULT now()
);

-- Subscriptions / entitlements
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text UNIQUE NOT NULL,
  ls_order_id text,
  ls_customer_id text,
  ls_subscription_id text,
  plan text NOT NULL CHECK (plan IN ('per_contract', 'monthly')),
  contracts_remaining integer DEFAULT 0,
  active boolean DEFAULT true,
  activated_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS \$\$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
\$\$ language plpgsql;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
