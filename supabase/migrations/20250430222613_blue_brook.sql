/*
  # Add Profile Settings Columns

  1. Changes
    - Add notification_preferences and privacy_settings columns to user_profiles
    - Add default values for new columns
    - Ensure backwards compatibility

  2. Security
    - Maintain existing RLS policies
    - Keep data integrity with JSONB validation
*/

-- Add new columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT jsonb_build_object(
  'email_notifications', true,
  'push_notifications', true,
  'marketing_emails', false,
  'security_alerts', true
),
ADD COLUMN IF NOT EXISTS privacy_settings jsonb DEFAULT jsonb_build_object(
  'profile_visibility', 'public',
  'show_activity', true,
  'allow_messages', true,
  'show_email', false
);

-- Add check constraints to ensure valid JSON structure
ALTER TABLE user_profiles
ADD CONSTRAINT notification_preferences_check
  CHECK (
    notification_preferences ? 'email_notifications' AND
    notification_preferences ? 'push_notifications' AND
    notification_preferences ? 'marketing_emails' AND
    notification_preferences ? 'security_alerts'
  ),
ADD CONSTRAINT privacy_settings_check
  CHECK (
    privacy_settings ? 'profile_visibility' AND
    privacy_settings ? 'show_activity' AND
    privacy_settings ? 'allow_messages' AND
    privacy_settings ? 'show_email'
  );