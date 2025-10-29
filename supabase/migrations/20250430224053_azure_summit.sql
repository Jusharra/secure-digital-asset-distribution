-- Create sample data for authenticated users
CREATE OR REPLACE FUNCTION create_sample_data() 
RETURNS void AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user's ID
  SELECT auth.uid() INTO current_user_id;
  
  -- Exit if no user is authenticated
  IF current_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Clean up existing test data
  DELETE FROM public.user_profiles WHERE id = current_user_id;
  DELETE FROM public.digital_assets WHERE creator_id = current_user_id;
  DELETE FROM public.prepaid_cards WHERE redeemed_by = current_user_id;
  DELETE FROM public.asset_access_logs WHERE user_id = current_user_id;
  DELETE FROM public.referrals WHERE referrer_id = current_user_id;

  -- Create user profile
  INSERT INTO public.user_profiles (
    id,
    full_name,
    phone,
    avatar_url,
    notification_preferences,
    privacy_settings
  ) VALUES (
    current_user_id,
    'John Doe',
    '+1234567890',
    'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
    jsonb_build_object(
      'email_notifications', true,
      'push_notifications', true,
      'marketing_emails', false,
      'security_alerts', true
    ),
    jsonb_build_object(
      'profile_visibility', 'public',
      'show_activity', true,
      'allow_messages', true,
      'show_email', false
    )
  );

  -- Create sample digital assets
  WITH new_assets AS (
    INSERT INTO public.digital_assets (
      id,
      title,
      description,
      type,
      creator_id,
      metadata
    ) VALUES
      (
        gen_random_uuid(),
        'Photography Basics',
        'Learn the fundamentals of digital photography',
        'video',
        current_user_id,
        jsonb_build_object(
          'sourceSize', 1048576000,
          'masterSize', 2097152000,
          'duration', '1h 30m',
          'quality', '4K'
        )
      ),
      (
        gen_random_uuid(),
        'Digital Marketing 101',
        'Introduction to digital marketing strategies',
        'ebook',
        current_user_id,
        jsonb_build_object(
          'sourceSize', 10485760,
          'masterSize', 15728640,
          'pages', 250,
          'format', 'PDF'
        )
      )
    RETURNING id
  ),
  new_codes AS (
    INSERT INTO public.id_bank (code)
    VALUES ('PHOTO2025'), ('MKTG2025')
    RETURNING code
  )
  -- Create prepaid cards
  INSERT INTO public.prepaid_cards (
    id,
    asset_id,
    serial_code,
    retailer_id,
    redeemed,
    redeemed_by,
    redeemed_at
  )
  SELECT
    gen_random_uuid(),
    a.id,
    c.code,
    current_user_id,
    true,
    current_user_id,
    now() - (interval '1 day' * row_number() over ())
  FROM new_assets a
  JOIN new_codes c ON true;

  -- Create access logs
  INSERT INTO public.asset_access_logs (
    id,
    user_id,
    asset_id,
    method,
    timestamp
  )
  SELECT
    gen_random_uuid(),
    current_user_id,
    asset_id,
    'card',
    redeemed_at
  FROM public.prepaid_cards
  WHERE redeemed_by = current_user_id;

  -- Create referrals
  INSERT INTO public.referrals (
    id,
    referrer_id,
    referred_user_id,
    created_at
  )
  SELECT
    gen_random_uuid(),
    current_user_id,
    current_user_id,
    now() - (interval '1 day' * generate_series(1, 2))
  FROM generate_series(1, 2);
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_sample_data();

-- Clean up the function
DROP FUNCTION create_sample_data();