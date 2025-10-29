/*
  # Add retailer profile data
  
  1. Changes
    - Insert retailer profile data for user de7d4a3d-d519-4977-9ba3-a20bf4f7e1bb
    - Add retailer regions and preferences
    - Set up payment details and business info
*/

-- Insert retailer profile
INSERT INTO retailer_profiles (
  id,
  business_name,
  business_type,
  tax_id,
  website,
  phone,
  address,
  payment_details,
  preferences,
  verification_status,
  created_at,
  updated_at
) VALUES (
  'de7d4a3d-d519-4977-9ba3-a20bf4f7e1bb',
  'Digital Hub Store',
  'hybrid',
  'TX123456789',
  'https://digitalhubstore.com',
  '+1-555-123-4567',
  jsonb_build_object(
    'street', '123 Tech Lane',
    'city', 'Austin',
    'state', 'TX',
    'zip', '78701',
    'country', 'USA'
  ),
  jsonb_build_object(
    'type', 'bank',
    'account_holder', 'Digital Hub LLC',
    'account_number', '****1234',
    'routing_number', '****5678',
    'bank_name', 'Chase Bank',
    'preferred_currency', 'USD'
  ),
  jsonb_build_object(
    'auto_accept_bids', true,
    'minimum_profit_share', 15,
    'notification_preferences', jsonb_build_object(
      'email_notifications', true,
      'new_bid_alerts', true,
      'sales_reports', true
    )
  ),
  'verified',
  now(),
  now()
);

-- Insert retailer regions
INSERT INTO retailer_regions (
  retailer_id,
  region,
  is_primary,
  radius_km,
  created_at,
  updated_at
) VALUES 
(
  'de7d4a3d-d519-4977-9ba3-a20bf4f7e1bb',
  'TX-AUSTIN',
  true,
  25,
  now(),
  now()
),
(
  'de7d4a3d-d519-4977-9ba3-a20bf4f7e1bb',
  'TX-DALLAS',
  false,
  20,
  now(),
  now()
);

-- Initialize retailer stats
INSERT INTO retailer_stats (
  retailer_id,
  date,
  cards_activated,
  cards_redeemed,
  total_revenue,
  commission_earned,
  unique_assets,
  active_bids,
  created_at,
  updated_at
) VALUES (
  'de7d4a3d-d519-4977-9ba3-a20bf4f7e1bb',
  CURRENT_DATE,
  0,
  0,
  0,
  0,
  0,
  0,
  now(),
  now()
);