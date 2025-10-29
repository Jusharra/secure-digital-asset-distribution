/*
  # Add retailer profile data
  
  1. Updates
    - Add retailer profile if not exists
    - Add retailer regions
    - Initialize retailer statistics
    
  2. Changes
    - Uses DO blocks with EXISTS checks to prevent duplicate key violations
    - Safely inserts data only if not already present
*/

-- Update retailer profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM retailer_profiles 
    WHERE id = 'de7d4a3d-d519-4977-9ba3-a20bf4f7e1bb'
  ) THEN
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
      '12-3456789',
      'https://digitalhubstore.com',
      '+1-512-555-0123',
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
  END IF;
END $$;

-- Add retailer regions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM retailer_regions 
    WHERE retailer_id = 'de7d4a3d-d519-4977-9ba3-a20bf4f7e1bb' AND region = 'Austin, TX'
  ) THEN
    INSERT INTO retailer_regions (
      retailer_id,
      region,
      is_primary,
      radius_km,
      created_at,
      updated_at
    ) VALUES (
      'de7d4a3d-d519-4977-9ba3-a20bf4f7e1bb',
      'Austin, TX',
      true,
      25,
      now(),
      now()
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM retailer_regions 
    WHERE retailer_id = 'de7d4a3d-d519-4977-9ba3-a20bf4f7e1bb' AND region = 'Dallas, TX'
  ) THEN
    INSERT INTO retailer_regions (
      retailer_id,
      region,
      is_primary,
      radius_km,
      created_at,
      updated_at
    ) VALUES (
      'de7d4a3d-d519-4977-9ba3-a20bf4f7e1bb',
      'Dallas, TX',
      false,
      25,
      now(),
      now()
    );
  END IF;
END $$;

-- Initialize retailer stats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM retailer_stats 
    WHERE retailer_id = 'de7d4a3d-d519-4977-9ba3-a20bf4f7e1bb' AND date = CURRENT_DATE
  ) THEN
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
      0.00,
      0.00,
      0,
      0,
      now(),
      now()
    );
  END IF;
END $$;