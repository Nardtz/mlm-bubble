-- Add is_super_admin field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Create index on is_super_admin for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin ON profiles(is_super_admin);

-- Create a function to check super admin status (security definer bypasses RLS)
-- This must be created before the policies that use it
CREATE OR REPLACE FUNCTION is_user_super_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = check_user_id 
    AND is_super_admin = TRUE
  );
END;
$$;

-- Update RLS policies for members table to allow super admins to view all members
-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own members" ON members;
DROP POLICY IF EXISTS "Users can view own members or super admin can view all" ON members;
DROP POLICY IF EXISTS "Users can insert own members" ON members;
DROP POLICY IF EXISTS "Users can update own members" ON members;
DROP POLICY IF EXISTS "Users can update own members or super admin can update all" ON members;
DROP POLICY IF EXISTS "Users can delete own members" ON members;
DROP POLICY IF EXISTS "Users can delete own members or super admin can delete all" ON members;

-- Policy: Users can view their own members OR super admins can view all members
CREATE POLICY "Users can view own members or super admin can view all" ON members
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_user_super_admin(auth.uid())
  );

-- Policy: Users can insert their own members (super admins still need to respect user_id)
CREATE POLICY "Users can insert own members" ON members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own members OR super admins can update any
CREATE POLICY "Users can update own members or super admin can update all" ON members
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR is_user_super_admin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR is_user_super_admin(auth.uid())
  );

-- Policy: Users can delete their own members OR super admins can delete any
CREATE POLICY "Users can delete own members or super admin can delete all" ON members
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR is_user_super_admin(auth.uid())
  );

-- Update profiles RLS to allow super admins to view all profiles
-- Use the security definer function created above to avoid infinite recursion
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile or super admin can view all" ON profiles;

-- Policy: Users can view their own profile OR super admins can view all profiles
CREATE POLICY "Users can view own profile or super admin can view all" ON profiles
  FOR SELECT
  USING (
    auth.uid() = id 
    OR is_user_super_admin(auth.uid())
  );

