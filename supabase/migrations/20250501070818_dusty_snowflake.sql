/*
  # Create delivery system tables

  1. New Tables
    - `courier_assignments`
      - `id` (uuid, primary key)
      - `delivery_id` (uuid, references delivery_queue)
      - `courier_id` (uuid, references users)
      - `role` (text, check: pickup or delivery)
      - `status` (text, check: assigned, completed, cancelled)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `delivery_queue`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references users)
      - `asset_id` (uuid, references digital_assets)
      - `encrypted_label` (text)
      - `recipient_pubkey` (text)
      - `status` (text, check: pending, picked_up, in_transit, delivered)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for admins, senders, and couriers
*/

-- Create courier assignments table first
CREATE TABLE IF NOT EXISTS courier_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid,
  courier_id uuid REFERENCES users(id) ON DELETE SET NULL,
  role text NOT NULL CHECK (role IN ('pickup', 'delivery')),
  status text NOT NULL CHECK (status IN ('assigned', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE courier_assignments ENABLE ROW LEVEL SECURITY;

-- Create the delivery queue table
CREATE TABLE IF NOT EXISTS delivery_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES users(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES digital_assets(id) ON DELETE CASCADE,
  encrypted_label text NOT NULL,
  recipient_pubkey text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'picked_up', 'in_transit', 'delivered')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key after both tables exist
ALTER TABLE courier_assignments 
  ADD CONSTRAINT courier_assignments_delivery_id_fkey 
  FOREIGN KEY (delivery_id) 
  REFERENCES delivery_queue(id) 
  ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE delivery_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for courier_assignments
CREATE POLICY "Admins can manage all assignments"
  ON courier_assignments
  FOR ALL
  TO public
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

CREATE POLICY "Couriers can manage own assignments"
  ON courier_assignments
  FOR ALL
  TO public
  USING (courier_id = auth.uid());

-- Create policies for delivery_queue
CREATE POLICY "Admins manage all deliveries"
  ON delivery_queue
  FOR ALL
  TO public
  USING (EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

CREATE POLICY "Senders manage own deliveries"
  ON delivery_queue
  FOR ALL
  TO public
  USING (sender_id = auth.uid());

CREATE POLICY "Couriers view assigned deliveries"
  ON delivery_queue
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM courier_assignments
    WHERE courier_assignments.delivery_id = delivery_queue.id
    AND courier_assignments.courier_id = auth.uid()
    AND courier_assignments.status != 'cancelled'
  ));

-- Create updated_at triggers
CREATE TRIGGER update_courier_assignments_updated_at
  BEFORE UPDATE ON courier_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_queue_updated_at
  BEFORE UPDATE ON delivery_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();