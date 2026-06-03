-- Webhook event log — every inbound LS event is recorded here
CREATE TABLE IF NOT EXISTS webhooks_log (
  id          uuid      DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type  text      NOT NULL,
  lemon_squeezy_id text,
  payload     jsonb,
  received_at timestamptz DEFAULT now(),
  processed   boolean   DEFAULT false,
  error       text
);

-- Add subscription_ends_at to subscriptions if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'subscription_ends_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN subscription_ends_at timestamptz;
  END IF;
END $$;
