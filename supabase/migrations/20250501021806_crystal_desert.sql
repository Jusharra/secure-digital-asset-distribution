/*
  # Fix delivery queue RLS policies

  1. Changes
    - Drop existing RLS policies on delivery_queue table
    - Create new, optimized policies without circular dependencies
    
  2. Security
    - Maintain same access control but with better performance
    - Prevent infinite recursion in policy evaluation
    - Keep row level security enabled
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admins can manage all deliveries" ON delivery_queue;
DROP POLICY IF EXISTS "Couriers can view assigned deliveries" ON delivery_queue;
DROP POLICY IF EXISTS "Senders can manage their deliveries" ON delivery_queue;

-- Recreate policies without circular dependencies
CREATE POLICY "Admins can manage all deliveries"
ON delivery_queue
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

CREATE POLICY "Senders can manage their deliveries"
ON delivery_queue
FOR ALL
TO public
USING (sender_id = auth.uid());

-- Simplified courier policy that avoids recursion
CREATE POLICY "Couriers can view assigned deliveries"
ON delivery_queue
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM courier_assignments
    WHERE courier_assignments.delivery_id = delivery_queue.id
    AND courier_assignments.courier_id = auth.uid()
    AND courier_assignments.status != 'cancelled'
  )
);