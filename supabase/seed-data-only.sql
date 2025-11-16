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
('s2-1', 'Olivia Garcia', 20000.00, 2, 'f2'),
('s2-2', 'Paul Martinez', 22000.00, 2, 'f2'),
('s2-3', 'Quinn Rodriguez', 21000.00, 2, 'f2'),
('s2-4', 'Rachel Lee', 23000.00, 2, 'f2'),
('s2-5', 'Sam Walker', 19000.00, 2, 'f2'),
('s2-6', 'Tina Hall', 24000.00, 2, 'f2'),
('s2-7', 'Uma Young', 20500.00, 2, 'f2')
ON CONFLICT (id) DO NOTHING;

-- Insert second level members (under Carol Williams - f3)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('s3-1', 'Victor King', 18000.00, 2, 'f3'),
('s3-2', 'Wendy Wright', 20000.00, 2, 'f3'),
('s3-3', 'Xavier Lopez', 19000.00, 2, 'f3'),
('s3-4', 'Yara Hill', 21000.00, 2, 'f3'),
('s3-5', 'Zoe Scott', 17000.00, 2, 'f3'),
('s3-6', 'Adam Green', 22000.00, 2, 'f3'),
('s3-7', 'Bella Adams', 19500.00, 2, 'f3')
ON CONFLICT (id) DO NOTHING;

-- Insert second level members (under David Brown - f4)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('s4-1', 'Charlie Baker', 16000.00, 2, 'f4'),
('s4-2', 'Diana Nelson', 18000.00, 2, 'f4'),
('s4-3', 'Ethan Carter', 17000.00, 2, 'f4'),
('s4-4', 'Fiona Mitchell', 19000.00, 2, 'f4'),
('s4-5', 'George Perez', 15000.00, 2, 'f4'),
('s4-6', 'Hannah Roberts', 20000.00, 2, 'f4'),
('s4-7', 'Ian Turner', 16500.00, 2, 'f4')
ON CONFLICT (id) DO NOTHING;

-- Insert second level members (under Emma Davis - f5)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('s5-1', 'Julia Phillips', 14000.00, 2, 'f5'),
('s5-2', 'Kevin Campbell', 16000.00, 2, 'f5'),
('s5-3', 'Luna Parker', 15000.00, 2, 'f5'),
('s5-4', 'Mike Evans', 17000.00, 2, 'f5'),
('s5-5', 'Nina Edwards', 13000.00, 2, 'f5'),
('s5-6', 'Oscar Collins', 18000.00, 2, 'f5'),
('s5-7', 'Penny Stewart', 14500.00, 2, 'f5')
ON CONFLICT (id) DO NOTHING;

-- Insert second level members (under Frank Miller - f6)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('s6-1', 'Quinn Sanchez', 12000.00, 2, 'f6'),
('s6-2', 'Ryan Morris', 14000.00, 2, 'f6'),
('s6-3', 'Sara Rogers', 13000.00, 2, 'f6'),
('s6-4', 'Tom Reed', 15000.00, 2, 'f6'),
('s6-5', 'Uma Cook', 11000.00, 2, 'f6'),
('s6-6', 'Vince Morgan', 16000.00, 2, 'f6'),
('s6-7', 'Willa Bell', 12500.00, 2, 'f6')
ON CONFLICT (id) DO NOTHING;

-- Insert second level members (under Grace Wilson - f7)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('s7-1', 'Xander Murphy', 10000.00, 2, 'f7'),
('s7-2', 'Yuki Bailey', 12000.00, 2, 'f7'),
('s7-3', 'Zara Rivera', 11000.00, 2, 'f7'),
('s7-4', 'Alex Cooper', 13000.00, 2, 'f7'),
('s7-5', 'Blake Richardson', 9000.00, 2, 'f7'),
('s7-6', 'Casey Cox', 14000.00, 2, 'f7'),
('s7-7', 'Drew Howard', 10500.00, 2, 'f7')
ON CONFLICT (id) DO NOTHING;

-- Insert third level members (under Henry Taylor - s1-1)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('t1-1-1', 'Eva Ward', 12000.00, 3, 's1-1'),
('t1-1-2', 'Finn Torres', 11000.00, 3, 's1-1'),
('t1-1-3', 'Gina Peterson', 11500.00, 3, 's1-1'),
('t1-1-4', 'Hugo Gray', 10000.00, 3, 's1-1'),
('t1-1-5', 'Iris Ramirez', 13000.00, 3, 's1-1'),
('t1-1-6', 'Jake James', 9500.00, 3, 's1-1'),
('t1-1-7', 'Kara Watson', 11250.00, 3, 's1-1')
ON CONFLICT (id) DO NOTHING;

-- Insert third level members (under Ivy Anderson - s1-2)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('t1-2-1', 'Liam Brooks', 10000.00, 3, 's1-2'),
('t1-2-2', 'Maya Kelly', 11000.00, 3, 's1-2'),
('t1-2-3', 'Noah Sanders', 10500.00, 3, 's1-2'),
('t1-2-4', 'Olivia Price', 12000.00, 3, 's1-2'),
('t1-2-5', 'Paul Bennett', 9000.00, 3, 's1-2'),
('t1-2-6', 'Quinn Wood', 13000.00, 3, 's1-2'),
('t1-2-7', 'Ruby Barnes', 10250.00, 3, 's1-2')
ON CONFLICT (id) DO NOTHING;

-- Insert third level members (under Olivia Garcia - s2-1)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('t2-1-1', 'Sam Ross', 8000.00, 3, 's2-1'),
('t2-1-2', 'Tina Henderson', 9000.00, 3, 's2-1'),
('t2-1-3', 'Uma Coleman', 8500.00, 3, 's2-1'),
('t2-1-4', 'Victor Jenkins', 10000.00, 3, 's2-1'),
('t2-1-5', 'Wendy Perry', 7500.00, 3, 's2-1'),
('t2-1-6', 'Xavier Powell', 11000.00, 3, 's2-1'),
('t2-1-7', 'Yara Long', 8250.00, 3, 's2-1')
ON CONFLICT (id) DO NOTHING;

-- Insert third level members (under Paul Martinez - s2-2)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('t2-2-1', 'Zoe Patterson', 7000.00, 3, 's2-2'),
('t2-2-2', 'Adam Hughes', 8000.00, 3, 's2-2'),
('t2-2-3', 'Bella Flores', 7500.00, 3, 's2-2'),
('t2-2-4', 'Charlie Washington', 9000.00, 3, 's2-2'),
('t2-2-5', 'Diana Butler', 6500.00, 3, 's2-2'),
('t2-2-6', 'Ethan Simmons', 10000.00, 3, 's2-2'),
('t2-2-7', 'Fiona Foster', 7250.00, 3, 's2-2')
ON CONFLICT (id) DO NOTHING;

-- Insert third level members (under Victor King - s3-1)
INSERT INTO members (id, name, starting_capital, level, parent_id) VALUES
('t3-1-1', 'George Gonzales', 6000.00, 3, 's3-1'),
('t3-1-2', 'Hannah Bryant', 7000.00, 3, 's3-1'),
('t3-1-3', 'Ian Alexander', 6500.00, 3, 's3-1'),
('t3-1-4', 'Julia Russell', 8000.00, 3, 's3-1'),
('t3-1-5', 'Kevin Griffin', 5500.00, 3, 's3-1'),
('t3-1-6', 'Luna Diaz', 9000.00, 3, 's3-1'),
('t3-1-7', 'Mike Hayes', 6250.00, 3, 's3-1')
ON CONFLICT (id) DO NOTHING;

