-- Seed data: Insert ME (root member)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('me', 'ME', 100000.00, 0, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert first level members
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('f1', 'Alice Johnson', 50000.00, 1, 'me'),
('f2', 'Bob Smith', 45000.00, 1, 'me'),
('f3', 'Carol Williams', 48000.00, 1, 'me'),
('f4', 'David Brown', 42000.00, 1, 'me'),
('f5', 'Emma Davis', 46000.00, 1, 'me'),
('f6', 'Frank Miller', 44000.00, 1, 'me'),
('f7', 'Grace Wilson', 47000.00, 1, 'me')
ON CONFLICT (id) DO NOTHING;

-- Insert second level members (under Alice Johnson - f1)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('s1-1', 'Henry Taylor', 25000.00, 2, 'f1'),
('s1-2', 'Ivy Anderson', 23000.00, 2, 'f1'),
('s1-3', 'Jack Thomas', 24000.00, 2, 'f1'),
('s1-4', 'Kate Jackson', 22000.00, 2, 'f1'),
('s1-5', 'Leo White', 26000.00, 2, 'f1'),
('s1-6', 'Mia Harris', 21000.00, 2, 'f1'),
('s1-7', 'Noah Martin', 23500.00, 2, 'f1')
ON CONFLICT (id) DO NOTHING;

-- Insert second level members (under Bob Smith - f2)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('s2-1', 'Olivia Garcia', 24500.00, 2, 'f2'),
('s2-2', 'Paul Martinez', 22500.00, 2, 'f2'),
('s2-3', 'Quinn Rodriguez', 25500.00, 2, 'f2'),
('s2-4', 'Rachel Lee', 21500.00, 2, 'f2'),
('s2-5', 'Samuel Walker', 26500.00, 2, 'f2'),
('s2-6', 'Tina Hall', 20500.00, 2, 'f2'),
('s2-7', 'Uma Young', 24500.00, 2, 'f2')
ON CONFLICT (id) DO NOTHING;

-- Insert second level members (under Carol Williams - f3)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('s3-1', 'Victor King', 25000.00, 2, 'f3'),
('s3-2', 'Wendy Wright', 23000.00, 2, 'f3'),
('s3-3', 'Xavier Lopez', 24000.00, 2, 'f3'),
('s3-4', 'Yara Hill', 22000.00, 2, 'f3'),
('s3-5', 'Zoe Scott', 26000.00, 2, 'f3'),
('s3-6', 'Adam Green', 21000.00, 2, 'f3'),
('s3-7', 'Bella Adams', 23500.00, 2, 'f3')
ON CONFLICT (id) DO NOTHING;

-- Insert second level members (under David Brown - f4)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('s4-1', 'Charlie Baker', 24500.00, 2, 'f4'),
('s4-2', 'Diana Nelson', 22500.00, 2, 'f4'),
('s4-3', 'Ethan Carter', 25500.00, 2, 'f4'),
('s4-4', 'Fiona Mitchell', 21500.00, 2, 'f4'),
('s4-5', 'George Perez', 26500.00, 2, 'f4'),
('s4-6', 'Hannah Roberts', 20500.00, 2, 'f4'),
('s4-7', 'Ian Turner', 24500.00, 2, 'f4')
ON CONFLICT (id) DO NOTHING;

-- Insert second level members (under Emma Davis - f5)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('s5-1', 'Julia Phillips', 25000.00, 2, 'f5'),
('s5-2', 'Kevin Campbell', 23000.00, 2, 'f5'),
('s5-3', 'Luna Parker', 24000.00, 2, 'f5'),
('s5-4', 'Marcus Evans', 22000.00, 2, 'f5'),
('s5-5', 'Nora Edwards', 26000.00, 2, 'f5'),
('s5-6', 'Oscar Collins', 21000.00, 2, 'f5'),
('s5-7', 'Penelope Stewart', 23500.00, 2, 'f5')
ON CONFLICT (id) DO NOTHING;

-- Insert second level members (under Frank Miller - f6)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('s6-1', 'Quinn Sanchez', 24500.00, 2, 'f6'),
('s6-2', 'Riley Morris', 22500.00, 2, 'f6'),
('s6-3', 'Sophia Rogers', 25500.00, 2, 'f6'),
('s6-4', 'Theo Reed', 21500.00, 2, 'f6'),
('s6-5', 'Uma Cook', 26500.00, 2, 'f6'),
('s6-6', 'Violet Morgan', 20500.00, 2, 'f6'),
('s6-7', 'William Bell', 24500.00, 2, 'f6')
ON CONFLICT (id) DO NOTHING;

-- Insert second level members (under Grace Wilson - f7)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('s7-1', 'Xara Murphy', 25000.00, 2, 'f7'),
('s7-2', 'Yuki Bailey', 23000.00, 2, 'f7'),
('s7-3', 'Zara Rivera', 24000.00, 2, 'f7'),
('s7-4', 'Alex Cooper', 22000.00, 2, 'f7'),
('s7-5', 'Blake Richardson', 26000.00, 2, 'f7'),
('s7-6', 'Cameron Cox', 21000.00, 2, 'f7'),
('s7-7', 'Dakota Howard', 23500.00, 2, 'f7')
ON CONFLICT (id) DO NOTHING;

-- Insert third level members (sample - under first few second level members)
-- Under Henry Taylor (s1-1)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('t1-1-1', 'Aria Ward', 12000.00, 3, 's1-1'),
('t1-1-2', 'Blake Torres', 11500.00, 3, 's1-1'),
('t1-1-3', 'Cora Peterson', 12500.00, 3, 's1-1'),
('t1-1-4', 'Drew Gray', 11000.00, 3, 's1-1'),
('t1-1-5', 'Eden Ramirez', 13000.00, 3, 's1-1'),
('t1-1-6', 'Finley James', 10500.00, 3, 's1-1'),
('t1-1-7', 'Grey Watson', 11750.00, 3, 's1-1')
ON CONFLICT (id) DO NOTHING;

-- Under Ivy Anderson (s1-2)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('t1-2-1', 'Harper Brooks', 12000.00, 3, 's1-2'),
('t1-2-2', 'Indigo Kelly', 11500.00, 3, 's1-2'),
('t1-2-3', 'Jasper Sanders', 12500.00, 3, 's1-2'),
('t1-2-4', 'Kai Price', 11000.00, 3, 's1-2'),
('t1-2-5', 'Luna Bennett', 13000.00, 3, 's1-2'),
('t1-2-6', 'Maya Wood', 10500.00, 3, 's1-2'),
('t1-2-7', 'Nova Barnes', 11750.00, 3, 's1-2')
ON CONFLICT (id) DO NOTHING;

-- Add more third level members as needed (continuing the pattern for other second level members)
-- This is a sample - you can add more following the same pattern

