-- Create a function to get user emails from auth.users
-- This function can access auth.users which regular queries cannot
CREATE OR REPLACE FUNCTION get_user_emails(user_ids UUID[])
RETURNS TABLE(user_id UUID, email TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id::UUID as user_id,
    au.email::TEXT as email
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_emails(UUID[]) TO authenticated;

