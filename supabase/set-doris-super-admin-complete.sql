-- Set doris91903@yahoo.com as super admin
-- This script handles both cases: profile exists or needs to be created

-- Step 1: Check if user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'doris91903@yahoo.com';

-- Step 2: Check if profile exists
SELECT id, username, email, is_super_admin 
FROM profiles 
WHERE email = 'doris91903@yahoo.com';

-- Step 3: If profile doesn't exist, we need to get the user ID from auth.users first
-- Then create the profile with super admin status
-- (Replace USER_ID_HERE with the actual ID from Step 1)

-- Step 4: Create or update profile with super admin status
-- First, try to get the user ID
DO $$
DECLARE
    user_uuid UUID;
    profile_exists BOOLEAN;
BEGIN
    -- Get user ID from auth.users
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = 'doris91903@yahoo.com'
    LIMIT 1;
    
    IF user_uuid IS NULL THEN
        RAISE NOTICE 'User doris91903@yahoo.com not found in auth.users';
        RETURN;
    END IF;
    
    -- Check if profile exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_uuid) INTO profile_exists;
    
    IF profile_exists THEN
        -- Update existing profile
        UPDATE profiles 
        SET is_super_admin = TRUE,
            updated_at = NOW()
        WHERE id = user_uuid;
        RAISE NOTICE 'Updated existing profile for doris91903@yahoo.com';
    ELSE
        -- Create new profile with super admin status
        INSERT INTO profiles (id, username, email, is_super_admin, created_at, updated_at)
        VALUES (
            user_uuid,
            'doris91903',
            'doris91903@yahoo.com',
            TRUE,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET is_super_admin = TRUE,
            updated_at = NOW();
        RAISE NOTICE 'Created new profile for doris91903@yahoo.com with super admin status';
    END IF;
END $$;

-- Step 5: Verify the result
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

