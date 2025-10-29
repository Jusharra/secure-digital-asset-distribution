/*
  # Delivery System Tables and Policies

  1. New Tables
    - delivery_queue: Manages delivery requests
    - courier_assignments: Tracks courier assignments

  2. Security
    - Enable RLS on both tables
    - Add policies for senders, couriers, and admins
    - Ensure proper access control for all operations

  3. Changes
    - Add status tracking for deliveries and assignments
    - Include timestamps for auditing
*/

-- Create delivery queue table
CREATE TABLE IF NOT EXISTS public.delivery_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES public.digital_assets(id) ON DELETE CASCADE,
  encrypted_label text NOT NULL,
  recipient_pubkey text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'picked_up', 'in_transit', 'delivered')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.delivery_queue ENABLE ROW LEVEL SECURITY;

-- Create courier assignments table
CREATE TABLE IF NOT EXISTS public.courier_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid REFERENCES public.delivery_queue(id) ON DELETE CASCADE,
  courier_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  role text NOT NULL CHECK (role IN ('pickup', 'delivery')),
  status text NOT NULL CHECK (status IN ('assigned', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.courier_assignments ENABLE ROW LEVEL SECURITY;

-- Delivery Queue Policies
DO $$
BEGIN
  -- Senders can manage their own deliveries
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'delivery_queue' 
    AND policyname = 'Senders can manage their deliveries'
  ) THEN
    CREATE POLICY "Senders can manage their deliveries"
      ON public.delivery_queue
      FOR ALL
      USING (sender_id = auth.uid());
  END IF;

  -- Couriers can view assigned deliveries
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'delivery_queue' 
    AND policyname = 'Couriers can view assigned deliveries'
  ) THEN
    CREATE POLICY "Couriers can view assigned deliveries"
      ON public.delivery_queue
      FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.courier_assignments
        WHERE delivery_id = delivery_queue.id
        AND courier_id = auth.uid()
      ));
  END IF;

  -- Admins can manage all deliveries
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'delivery_queue' 
    AND policyname = 'Admins can manage all deliveries'
  ) THEN
    CREATE POLICY "Admins can manage all deliveries"
      ON public.delivery_queue
      FOR ALL
      USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
      ));
  END IF;
END
$$;

-- Courier Assignments Policies
DO $$
BEGIN
  -- Couriers can view and update their assignments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courier_assignments' 
    AND policyname = 'Couriers can manage their assignments'
  ) THEN
    CREATE POLICY "Couriers can manage their assignments"
      ON public.courier_assignments
      FOR ALL
      USING (courier_id = auth.uid());
  END IF;

  -- Senders can view assignments for their deliveries
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courier_assignments' 
    AND policyname = 'Senders can view delivery assignments'
  ) THEN
    CREATE POLICY "Senders can view delivery assignments"
      ON public.courier_assignments
      FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.delivery_queue
        WHERE id = courier_assignments.delivery_id
        AND sender_id = auth.uid()
      ));
  END IF;

  -- Admins can manage all assignments
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'courier_assignments' 
    AND policyname = 'Admins can manage all assignments'
  ) THEN
    CREATE POLICY "Admins can manage all assignments"
      ON public.courier_assignments
      FOR ALL
      USING (EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
      ));
  END IF;
END
$$;