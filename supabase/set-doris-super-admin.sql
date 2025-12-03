-- Set doris91903@yahoo.com as super admin

-- First, find the user ID by email
SELECT id, username, email, is_super_admin 
FROM profiles 
WHERE email = 'doris91903@yahoo.com';

-- Update to set as super admin
UPDATE profiles 
SET is_super_admin = TRUE
WHERE email = 'doris91903@yahoo.com';

-- Verify it worked - should show is_super_admin = true
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

