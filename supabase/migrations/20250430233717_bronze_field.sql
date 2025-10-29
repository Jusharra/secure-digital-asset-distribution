-- Add payment_details to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS payment_details jsonb DEFAULT jsonb_build_object(
  'type', null,
  'account_holder', null,
  'account_number', null,
  'routing_number', null,
  'bank_name', null,
  'paypal_email', null,
  'preferred_currency', 'USD'
);

-- Add check constraint to ensure valid payment details structure
ALTER TABLE user_profiles
ADD CONSTRAINT payment_details_check
  CHECK (
    payment_details ? 'type' AND
    payment_details ? 'account_holder' AND
    payment_details ? 'account_number' AND
    payment_details ? 'routing_number' AND
    payment_details ? 'bank_name' AND
    payment_details ? 'paypal_email' AND
    payment_details ? 'preferred_currency'
  );