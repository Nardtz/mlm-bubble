-- First, check if 'me' exists, if not create it
INSERT INTO members (id, name, starting_capital, level, parent_id) 
VALUES ('me', 'ME', 100000.00, 0, NULL)
ON CONFLICT (id) DO NOTHING;

-- Check and insert first level members if missing
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('f1', 'Alice Johnson', 50000.00, 1, 'me'),
('f2', 'Bob Smith', 45000.00, 1, 'me'),
('f3', 'Carol Williams', 48000.00, 1, 'me'),
('f4', 'David Brown', 42000.00, 1, 'me'),
('f5', 'Emma Davis', 46000.00, 1, 'me'),
('f6', 'Frank Miller', 44000.00, 1, 'me'),
('f7', 'Grace Wilson', 47000.00, 1, 'me')
ON CONFLICT (id) DO NOTHING;

-- Check and insert second level members under f1 (Alice Johnson)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('s1-1', 'Henry Taylor', 25000.00, 2, 'f1'),
('s1-2', 'Ivy Anderson', 23000.00, 2, 'f1'),
('s1-3', 'Jack Thomas', 24000.00, 2, 'f1'),
('s1-4', 'Kate Jackson', 22000.00, 2, 'f1'),
('s1-5', 'Leo White', 26000.00, 2, 'f1'),
('s1-6', 'Mia Harris', 21000.00, 2, 'f1'),
('s1-7', 'Noah Martin', 23500.00, 2, 'f1')
ON CONFLICT (id) DO NOTHING;

-- Check what members exist
SELECT id, name, level, parent_id FROM members ORDER BY level, id;

