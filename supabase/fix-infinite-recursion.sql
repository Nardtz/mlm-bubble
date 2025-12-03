-- Quick fix for infinite recursion in profiles RLS policy
-- This should be run immediately to fix the issue

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Users can view own profile or super admin can view all" ON profiles;

-- Create a security definer function to check super admin status (bypasses RLS)
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

-- Recreate the policy using the function (no recursion)
CREATE POLICY "Users can view own profile or super admin can view all" ON profiles
  FOR SELECT
  USING (
    auth.uid() = id 
    OR is_user_super_admin(auth.uid())
  );

-- Also update members policies to use the function
DROP POLICY IF EXISTS "Users can view own members or super admin can view all" ON members;
DROP POLICY IF EXISTS "Users can update own members or super admin can update all" ON members;
DROP POLICY IF EXISTS "Users can delete own members or super admin can delete all" ON members;

CREATE POLICY "Users can view own members or super admin can view all" ON members
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_user_super_admin(auth.uid())
  );

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

CREATE POLICY "Users can delete own members or super admin can delete all" ON members
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR is_user_super_admin(auth.uid())
  );

