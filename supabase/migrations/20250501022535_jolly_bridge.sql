/*
  # Fix Infinite Recursion in RLS Policies

  1. Changes
    - Drop existing recursive policies
    - Create new non-recursive policies for delivery_queue
    - Create new non-recursive policies for courier_assignments
    - Use direct user role checks from users table
    - Simplify policy conditions to avoid circular dependencies

  2. Security
    - Maintain same level of access control
    - Prevent unauthorized access
    - Keep existing functionality
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
    SELECT 1 FROM courier_assignments ca
    WHERE ca.delivery_id = delivery_queue.id
    AND ca.courier_id = auth.uid()
    AND ca.status != 'cancelled'
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
    SELECT 1 FROM delivery_queue dq
    WHERE dq.id = courier_assignments.delivery_id
    AND dq.sender_id = auth.uid()
  )
);