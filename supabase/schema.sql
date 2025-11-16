-- Create members table to store all MLM members
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  starting_capital DECIMAL(12, 2) NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 0 AND level <= 3),
  parent_id TEXT REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on parent_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_members_parent_id ON members(parent_id);

-- Create index on level for filtering
CREATE INDEX IF NOT EXISTS idx_members_level ON members(level);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can restrict this later)
CREATE POLICY "Allow all operations on members" ON members
  FOR ALL
  USING (true)
  WITH CHECK (true);

