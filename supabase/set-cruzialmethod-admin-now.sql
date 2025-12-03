-- Set cruzialmethod@gmail.com as super admin
-- User ID: 0e2affa1-381e-4085-b79c-9ac2182cf3b5

UPDATE profiles 
SET is_super_admin = TRUE
WHERE id = '0e2affa1-381e-4085-b79c-9ac2182cf3b5'::UUID;

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
WHERE id = '0e2affa1-381e-4085-b79c-9ac2182cf3b5'::UUID;

