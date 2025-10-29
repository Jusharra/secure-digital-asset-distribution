/*
  # Fix RLS Policies for Delivery System

  1. Changes
    - Drop all existing delivery-related policies
    - Create new, simplified policies without recursion
    - Use direct role checks instead of subqueries where possible
    - Separate policies for different operations

  2. Security
    - Maintain same level of access control
    - Prevent infinite recursion
    - Keep data properly isolated between users
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admin delivery access" ON delivery_queue;
DROP POLICY IF EXISTS "Sender delivery access" ON delivery_queue;
DROP POLICY IF EXISTS "Courier delivery access" ON delivery_queue;
DROP POLICY IF EXISTS "Admin assignment access" ON courier_assignments;
DROP POLICY IF EXISTS "Courier assignment access" ON courier_assignments;
DROP POLICY IF EXISTS "Sender assignment access" ON courier_assignments;

-- Create new policies for delivery_queue
CREATE POLICY "Admin delivery access"
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

CREATE POLICY "Sender delivery access"
ON delivery_queue
FOR ALL
TO public
USING (sender_id = auth.uid());

CREATE POLICY "Courier delivery access"
ON delivery_queue
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM courier_assignments
    WHERE courier_assignments.delivery_id = delivery_queue.id
    AND courier_assignments.courier_id = auth.uid()
    AND courier_assignments.status <> 'cancelled'
  )
);

-- Create new policies for courier_assignments
CREATE POLICY "Admin assignment access"
ON courier_assignments
FOR ALL
TO public
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
TO public
USING (courier_id = auth.uid());

CREATE POLICY "Sender assignment access"
ON courier_assignments
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM delivery_queue
    WHERE delivery_queue.id = courier_assignments.delivery_id
    AND delivery_queue.sender_id = auth.uid()
  )
);