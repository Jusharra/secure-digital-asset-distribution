/*
  # Update Delivery Queue Table Structure

  1. Changes
    - Drop and recreate delivery_queue table with updated structure
    - Add required columns for secure delivery tracking
    - Set up proper foreign key relationships
    - Add RLS policies for access control

  2. Security
    - Enable RLS
    - Add policies for admins, senders, and couriers
    - Ensure proper data isolation
*/

-- Drop existing table and recreate with new structure
DROP TABLE IF EXISTS delivery_queue CASCADE;

CREATE TABLE delivery_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES digital_assets(id) ON DELETE CASCADE,
  encrypted_label text NOT NULL,
  recipient_pubkey text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'picked_up', 'in_transit', 'delivered')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE delivery_queue ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at
CREATE TRIGGER update_delivery_queue_updated_at
  BEFORE UPDATE ON delivery_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create simple, non-recursive policies
CREATE POLICY "Senders manage own deliveries"
ON delivery_queue
FOR ALL
TO public
USING (sender_id = auth.uid());

CREATE POLICY "Admins manage all deliveries"
ON delivery_queue
FOR ALL
TO public
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

CREATE POLICY "Couriers view assigned deliveries"
ON delivery_queue
FOR SELECT
TO public
USING (EXISTS (
  SELECT 1 FROM courier_assignments
  WHERE delivery_id = delivery_queue.id
  AND courier_id = auth.uid()
  AND status != 'cancelled'
));