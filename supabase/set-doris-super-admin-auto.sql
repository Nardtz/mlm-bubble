-- Set doris91903@yahoo.com as super admin
-- This script automatically handles both cases: profile exists or needs to be created

-- First, get the user ID from auth.users and create/update the profile
INSERT INTO profiles (id, username, email, is_super_admin, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(p.username, 'doris91903'),
    'doris91903@yahoo.com',
    TRUE,
    COALESCE(p.created_at, NOW()),
    NOW()
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'doris91903@yahoo.com'
ON CONFLICT (id) DO UPDATE
SET 
    is_super_admin = TRUE,
    email = 'doris91903@yahoo.com',
    updated_at = NOW();

-- Verify it worked
SELECT 
  id, 
  username, 
  email, 
  is_super_admin,
  CASE 
    WHEN is_super_admin = TRUE THEN '✅ YES - Super Admin'
    ELSE '❌ NO - Not Super Admin'
  END as status,
  created_at
FROM profiles 
WHERE email = 'doris91903@yahoo.com';

-- Show all super admins
SELECT 
  id,
  username,
  email,
  is_super_admin,
  created_at
FROM profiles
WHERE is_super_admin = TRUE
ORDER BY created_at;

