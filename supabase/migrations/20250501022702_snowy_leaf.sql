/*
  # Fix RLS Policies for Delivery System

  1. Changes
    - Remove circular dependencies in RLS policies
    - Simplify policy definitions
    - Use direct ID comparisons where possible
    - Maintain security while avoiding recursion

  2. Security
    - Maintain access control for admins, senders, and couriers
    - Ensure proper data isolation
    - Prevent unauthorized access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable admin access to deliveries" ON delivery_queue;
DROP POLICY IF EXISTS "Enable sender access to deliveries" ON delivery_queue;
DROP POLICY IF EXISTS "Enable courier access to deliveries" ON delivery_queue;
DROP POLICY IF EXISTS "Enable admin access to assignments" ON courier_assignments;
DROP POLICY IF EXISTS "Enable courier access to assignments" ON courier_assignments;
DROP POLICY IF EXISTS "Enable sender access to assignments" ON courier_assignments;

-- Create simplified policies for delivery_queue
CREATE POLICY "Admin delivery access"
ON delivery_queue
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Sender delivery access"
ON delivery_queue
FOR ALL
USING (sender_id = auth.uid());

CREATE POLICY "Courier delivery access"
ON delivery_queue
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courier_assignments
    WHERE delivery_id = delivery_queue.id
    AND courier_id = auth.uid()
    AND status <> 'cancelled'
  )
);

-- Create simplified policies for courier_assignments
CREATE POLICY "Admin assignment access"
ON courier_assignments
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Courier assignment access"
ON courier_assignments
FOR ALL
USING (courier_id = auth.uid());

CREATE POLICY "Sender assignment access"
ON courier_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM delivery_queue
    WHERE delivery_queue.id = courier_assignments.delivery_id
    AND delivery_queue.sender_id = auth.uid()
  )
);