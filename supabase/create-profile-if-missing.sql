-- Create profile for user if it doesn't exist
-- Replace the UUID with your actual user ID: 0e2affa1-381e-4085-b79c-9ac2182cf3b5

-- First, check if profile exists
SELECT id, username, email, is_super_admin 
FROM profiles 
WHERE id = '0e2affa1-381e-4085-b79c-9ac2182cf3b5'::UUID;

-- If the above returns no rows, create the profile
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
  email = 'cruzialmethod@gmail.com';

-- Verify it worked
SELECT id, username, email, is_super_admin 
FROM profiles 
WHERE id = '0e2affa1-381e-4085-b79c-9ac2182cf3b5'::UUID;

