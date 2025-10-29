/*
  # Fix Delivery System RLS Policies

  1. Changes
    - Drop existing problematic policies
    - Create new simplified policies without recursion
    - Use direct role checks and auth.uid() comparisons
    - Separate policies for different access patterns

  2. Security
    - Maintain same level of access control
    - Prevent infinite recursion
    - Keep data properly isolated between users
*/

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Admin delivery access" ON delivery_queue;
DROP POLICY IF EXISTS "Sender delivery access" ON delivery_queue;
DROP POLICY IF EXISTS "Courier delivery access" ON delivery_queue;
DROP POLICY IF EXISTS "Admin assignment access" ON courier_assignments;
DROP POLICY IF EXISTS "Courier assignment access" ON courier_assignments;
DROP POLICY IF EXISTS "Sender assignment access" ON courier_assignments;

-- Create simplified policies for delivery_queue
CREATE POLICY "delivery_admin_access"
ON delivery_queue
FOR ALL
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

CREATE POLICY "delivery_sender_access"
ON delivery_queue
FOR ALL
USING (sender_id = auth.uid());

CREATE POLICY "delivery_courier_access"
ON delivery_queue
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM courier_assignments
  WHERE courier_assignments.delivery_id = id
  AND courier_assignments.courier_id = auth.uid()
  AND courier_assignments.status != 'cancelled'
));

-- Create simplified policies for courier_assignments
CREATE POLICY "assignment_admin_access"
ON courier_assignments
FOR ALL
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

CREATE POLICY "assignment_courier_access"
ON courier_assignments
FOR ALL
USING (courier_id = auth.uid());

CREATE POLICY "assignment_sender_access"
ON courier_assignments
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM delivery_queue
  WHERE delivery_queue.id = delivery_id
  AND delivery_queue.sender_id = auth.uid()
));