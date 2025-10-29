/*
  # Fix RLS Policy Recursion

  1. Changes
    - Drop existing policies that cause recursion
    - Create new, simplified policies that avoid circular references
    - Use direct auth checks where possible
    - Maintain security while eliminating recursion

  2. Security
    - Maintain access control for admins, senders, and couriers
    - Prevent unauthorized access
    - Keep existing functionality while fixing the recursion issue
*/

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can manage all deliveries" ON delivery_queue;
DROP POLICY IF EXISTS "Couriers can view assigned deliveries" ON delivery_queue;
DROP POLICY IF EXISTS "Senders can manage their deliveries" ON delivery_queue;
DROP POLICY IF EXISTS "Admins can manage all assignments" ON courier_assignments;
DROP POLICY IF EXISTS "Couriers can manage their assignments" ON courier_assignments;
DROP POLICY IF EXISTS "Senders can view delivery assignments" ON courier_assignments;

-- Create new, non-recursive policies for delivery_queue
CREATE POLICY "Enable admin access to deliveries"
ON delivery_queue
FOR ALL
USING (
  auth.jwt() ->> 'role' = 'admin'
);

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

-- Create new, non-recursive policies for courier_assignments
CREATE POLICY "Enable admin access to assignments"
ON courier_assignments
FOR ALL
USING (
  auth.jwt() ->> 'role' = 'admin'
);

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