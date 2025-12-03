-- Complete script to verify and set super admin for cruzialmethod@gmail.com
-- Run this entire script in Supabase SQL Editor

-- Step 1: Check if the function exists, create if not
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

-- Step 2: Check current status of the user (by email)
SELECT 
  id, 
  username, 
  email, 
  is_super_admin,
  CASE 
    WHEN is_super_admin = TRUE THEN 'YES - Super Admin'
    ELSE 'NO - Not Super Admin'
  END as status
FROM profiles 
WHERE email = 'cruzialmethod@gmail.com';

-- Step 2b: Check by user ID (from the API response)
SELECT 
  id, 
  username, 
  email, 
  is_super_admin,
  CASE 
    WHEN is_super_admin = TRUE THEN 'YES - Super Admin'
    ELSE 'NO - Not Super Admin'
  END as status
FROM profiles 
WHERE id = '0e2affa1-381e-4085-b79c-9ac2182cf3b5'::UUID;

-- Step 3: Create profile if it doesn't exist, or update if it does
INSERT INTO profiles (id, username, email, is_super_admin)
VALUES (
  '0e2affa1-381e-4085-b79c-9ac2182cf3b5'::UUID,
  'cruzialmethod',
  'cruzialmethod@gmail.com',
  TRUE
)
ON CONFLICT (id) 
DO UPDATE SET 
  is_super_admin = TRUE,
  email = COALESCE(profiles.email, 'cruzialmethod@gmail.com'),
  username = COALESCE(profiles.username, 'cruzialmethod');

-- Step 4: Verify the update worked
SELECT 
  id, 
  username, 
  email, 
  is_super_admin,
  CASE 
    WHEN is_super_admin = TRUE THEN '✅ YES - Super Admin'
    ELSE '❌ NO - Not Super Admin'
  END as status
FROM profiles 
WHERE id = '0e2affa1-381e-4085-b79c-9ac2182cf3b5'::UUID;

-- Step 5: Show all super admins
SELECT 
  id, 
  username, 
  email, 
  is_super_admin,
  created_at
FROM profiles 
WHERE is_super_admin = TRUE
ORDER BY created_at DESC;

-- Step 6: Fix RLS policies if needed
DROP POLICY IF EXISTS "Users can view own profile or super admin can view all" ON profiles;

CREATE POLICY "Users can view own profile or super admin can view all" ON profiles
  FOR SELECT
  USING (
    auth.uid() = id 
    OR is_user_super_admin(auth.uid())
  );

-- Step 7: Verify policies are correct
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('profiles', 'members')
ORDER BY tablename, policyname;

