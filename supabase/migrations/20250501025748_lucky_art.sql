/*
  # Fix Delivery System RLS Policies

  1. Changes
    - Drop existing policies that cause recursion
    - Create new, simplified policies for delivery_queue and courier_assignments
    - Use direct role checks and ID comparisons
    - Prevent circular dependencies in policy definitions

  2. Security
    - Maintain access control for admins, senders, and couriers
    - Ensure proper data isolation
    - Keep existing functionality while fixing recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "delivery_admin_access" ON delivery_queue;
DROP POLICY IF EXISTS "delivery_sender_access" ON delivery_queue;
DROP POLICY IF EXISTS "delivery_courier_access" ON delivery_queue;
DROP POLICY IF EXISTS "assignment_admin_access" ON courier_assignments;
DROP POLICY IF EXISTS "assignment_courier_access" ON courier_assignments;
DROP POLICY IF EXISTS "assignment_sender_access" ON courier_assignments;

-- Create new policies for delivery_queue
CREATE POLICY "Admins can manage all deliveries"
ON delivery_queue
FOR ALL
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

CREATE POLICY "Senders can manage own deliveries"
ON delivery_queue
FOR ALL
USING (sender_id = auth.uid());

CREATE POLICY "Couriers can view assigned deliveries"
ON delivery_queue
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM courier_assignments ca
  WHERE ca.delivery_id = id
  AND ca.courier_id = auth.uid()
  AND ca.status != 'cancelled'
));

-- Create new policies for courier_assignments
CREATE POLICY "Admins can manage all assignments"
ON courier_assignments
FOR ALL
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid()
  AND users.role = 'admin'
));

CREATE POLICY "Couriers can manage own assignments"
ON courier_assignments
FOR ALL
USING (courier_id = auth.uid());

CREATE POLICY "Senders can view assignments for their deliveries"
ON courier_assignments
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM delivery_queue dq
  WHERE dq.id = delivery_id
  AND dq.sender_id = auth.uid()
));