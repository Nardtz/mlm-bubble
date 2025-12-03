-- Set doris91903@yahoo.com as super admin
-- Run these queries one by one

-- Step 1: Check if user exists in auth.users and get their ID
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'doris91903@yahoo.com';

-- Step 2: Check if profile exists
SELECT id, username, email, is_super_admin 
FROM profiles 
WHERE email = 'doris91903@yahoo.com';

-- Step 3: If Step 1 returned a user ID but Step 2 returned nothing,
--         then create the profile. Replace USER_ID_FROM_STEP_1 with the actual ID:
-- INSERT INTO profiles (id, username, email, is_super_admin, created_at, updated_at)
-- VALUES (
--     'USER_ID_FROM_STEP_1'::UUID,
--     'doris91903',
--     'doris91903@yahoo.com',
--     TRUE,
--     NOW(),
--     NOW()
-- )
-- ON CONFLICT (id) DO UPDATE
-- SET is_super_admin = TRUE,
--     updated_at = NOW();

-- Step 4: If Step 2 returned a profile, just update it:
UPDATE profiles 
SET is_super_admin = TRUE,
    updated_at = NOW()
WHERE email = 'doris91903@yahoo.com';

-- Step 5: Verify it worked
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

-- Step 6: Show all super admins
SELECT 
  id,
  username,
  email,
  is_super_admin,
  created_at
FROM profiles
WHERE is_super_admin = TRUE
ORDER BY created_at;

