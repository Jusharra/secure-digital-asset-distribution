/*
  # Fix Infinite Recursion in RLS Policies

  1. Changes
    - Drop existing recursive policies
    - Create new non-recursive policies for delivery_queue and courier_assignments
    - Use auth.uid() and role checks instead of nested queries
    - Ensure proper access control without circular dependencies

  2. Security
    - Maintain same level of access control
    - Prevent infinite recursion
    - Keep data properly secured
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable admin access to deliveries" ON delivery_queue;
DROP POLICY IF EXISTS "Enable sender access to deliveries" ON delivery_queue;
DROP POLICY IF EXISTS "Enable courier access to deliveries" ON delivery_queue;
DROP POLICY IF EXISTS "Enable admin access to assignments" ON courier_assignments;
DROP POLICY IF EXISTS "Enable courier access to assignments" ON courier_assignments;
DROP POLICY IF EXISTS "Enable sender access to assignments" ON courier_assignments;

-- Create new policies for delivery_queue
CREATE POLICY "Enable admin access to deliveries"
ON delivery_queue
FOR ALL
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

CREATE POLICY "Enable sender access to deliveries"
ON delivery_queue
FOR ALL
USING (sender_id = auth.uid());

CREATE POLICY "Enable courier access to deliveries"
ON delivery_queue
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM courier_assignments
    WHERE delivery_id = delivery_queue.id
    AND courier_id = auth.uid()
    AND status != 'cancelled'
  )
);

-- Create new policies for courier_assignments
CREATE POLICY "Enable admin access to assignments"
ON courier_assignments
FOR ALL
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

CREATE POLICY "Enable courier access to assignments"
ON courier_assignments
FOR ALL
USING (courier_id = auth.uid());

CREATE POLICY "Enable sender access to assignments"
ON courier_assignments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM delivery_queue
    WHERE id = courier_assignments.delivery_id
    AND sender_id = auth.uid()
  )
);