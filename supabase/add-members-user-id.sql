-- Add user_id column to members table to associate members with users
-- First add as nullable to handle existing data
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Delete any existing members without user_id (old seed data)
-- This ensures clean data for authenticated users
DELETE FROM members WHERE user_id IS NULL;

-- Now make user_id NOT NULL
ALTER TABLE members 
ALTER COLUMN user_id SET NOT NULL;

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);

-- Drop the old policy that allows all operations
DROP POLICY IF EXISTS "Allow all operations on members" ON members;

-- Policy: Users can only view their own members
CREATE POLICY "Users can view own members" ON members
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own members
CREATE POLICY "Users can insert own members" ON members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own members
CREATE POLICY "Users can update own members" ON members
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own members
CREATE POLICY "Users can delete own members" ON members
  FOR DELETE
  USING (auth.uid() = user_id);

