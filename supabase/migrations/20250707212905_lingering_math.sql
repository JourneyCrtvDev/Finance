/*
  # Create payment tracker tables

  1. New Tables
    - `monthly_payment_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `month` (integer)
      - `year` (integer)
      - `name` (text)
      - `payment_items` (jsonb)
      - `total_amount` (numeric)
      - `paid_amount` (numeric)
      - `remaining_amount` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `monthly_payment_plans` table
    - Add policies for users to manage their own payment plans

  3. Indexes
    - Add indexes for efficient querying by user, month, and year
*/

CREATE TABLE IF NOT EXISTS monthly_payment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL CHECK (year >= 2020 AND year <= 2100),
  name text NOT NULL,
  payment_items jsonb DEFAULT '[]'::jsonb,
  total_amount numeric(12,2) DEFAULT 0 CHECK (total_amount >= 0),
  paid_amount numeric(12,2) DEFAULT 0 CHECK (paid_amount >= 0),
  remaining_amount numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE monthly_payment_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payment plans"
  ON monthly_payment_plans
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own payment plans"
  ON monthly_payment_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payment plans"
  ON monthly_payment_plans
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own payment plans"
  ON monthly_payment_plans
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_monthly_payment_plans_user_id ON monthly_payment_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_payment_plans_user_month_year ON monthly_payment_plans(user_id, year DESC, month DESC);
CREATE INDEX IF NOT EXISTS idx_monthly_payment_plans_created_at ON monthly_payment_plans(created_at DESC);

-- Create unique constraint to prevent duplicate payment plans for same user/month/year
CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_payment_plans_user_month_year_unique 
  ON monthly_payment_plans(user_id, month, year);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_monthly_payment_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_monthly_payment_plans_updated_at_trigger
  BEFORE UPDATE ON monthly_payment_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_payment_plans_updated_at();