-- Script to set a user as super admin
-- Replace 'USER_EMAIL_HERE' with the actual email of the user you want to make super admin
-- Or replace 'USER_ID_HERE' with the actual UUID of the user

-- Method 1: Set super admin by email
UPDATE profiles 
SET is_super_admin = TRUE
WHERE email = 'USER_EMAIL_HERE';

-- Method 2: Set super admin by user ID (UUID)
-- UPDATE profiles 
-- SET is_super_admin = TRUE
-- WHERE id = 'USER_ID_HERE'::UUID;

-- Verify the update
SELECT id, username, email, is_super_admin 
FROM profiles 
WHERE is_super_admin = TRUE;

