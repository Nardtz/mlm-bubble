-- Set cruzialmethod@gmail.com as super admin
UPDATE profiles 
SET is_super_admin = TRUE
WHERE email = 'cruzialmethod@gmail.com';

-- Verify the update
SELECT id, username, email, is_super_admin 
FROM profiles 
WHERE email = 'cruzialmethod@gmail.com';

-- Show all super admins
SELECT id, username, email, is_super_admin 
FROM profiles 
WHERE is_super_admin = TRUE;

