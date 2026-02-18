-- Seed data for Medical Utility Companion App
-- Run after schema.sql
-- Populates all 11 tables to match the ERD

-- Users
INSERT INTO "user" (username, password) VALUES
  ('demo', 'demo'),
  ('testuser', 'testpass');

-- Countries
INSERT INTO country (country_name) VALUES
  ('United States'), ('United Kingdom'), ('Canada'), ('Australia'), ('Germany'),
  ('France'), ('India'), ('Brazil'), ('Japan'), ('South Korea'), ('Mexico'),
  ('Spain'), ('Italy'), ('Netherlands'), ('Sweden'), ('Switzerland');

-- User data (1:1 with user)
INSERT INTO user_data (user_id, age, gender, height_cm, weight_kg, country_id) VALUES
  (1, 30, 'Male', 175.0, 70.0, 1),
  (2, 45, 'Female', 165.0, 60.0, 2);

-- Medicines
INSERT INTO medicine (generic_name, brand_name, description, drug_facts) VALUES
  ('Paracetamol', 'Tylenol', 'Pain reliever and fever reducer', 'Take as directed. Do not exceed 4g/day.'),
  ('Acetaminophen', 'Tylenol', 'Same as Paracetamol (US name)', 'Take as directed. Do not exceed 4g/day.'),
  ('Ibuprofen', 'Advil', 'NSAID pain reliever', 'Take with food. Max 1200mg/day OTC.'),
  ('Amoxicillin', 'Amoxil', 'Penicillin antibiotic', 'Complete full course. Take every 8 hours.'),
  ('Omeprazole', 'Prilosec', 'Proton pump inhibitor', 'Take before breakfast. 20mg daily.'),
  ('Loratadine', 'Claritin', 'Antihistamine', 'One tablet daily for allergies.');

-- Country_Medicine (link medicines to countries)
-- US: 1, UK: 2, Canada: 3
INSERT INTO country_medicine (country_id, medicine_id) VALUES
  (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),  -- US: Acetaminophen, Ibuprofen, Amoxicillin, Omeprazole, Loratadine
  (2, 1), (2, 3), (2, 4), (2, 5), (2, 6),  -- UK: Paracetamol, Ibuprofen, etc.
  (3, 1), (3, 3), (3, 4), (3, 5), (3, 6);  -- Canada: Paracetamol, Ibuprofen, etc.

-- Country_Medicine_Equivalent (Paracetamol UK = Acetaminophen US, etc.)
-- cm_id: US Acetaminophen=1, UK Paracetamol=6, Canada Paracetamol=11, US Ibuprofen=2, UK Ibuprofen=7
INSERT INTO country_medicine_equivalent (source_country_medicine_id, target_country_medicine_id, view_count) VALUES
  (1, 6, 0),   -- US Acetaminophen -> UK Paracetamol
  (6, 1, 0),   -- UK Paracetamol -> US Acetaminophen
  (1, 11, 0),  -- US Acetaminophen -> Canada Paracetamol
  (11, 1, 0),  -- Canada Paracetamol -> US Acetaminophen
  (2, 7, 0),   -- US Ibuprofen -> UK Ibuprofen
  (7, 2, 0),   -- UK Ibuprofen -> US Ibuprofen
  (2, 12, 0),  -- US Ibuprofen -> Canada Ibuprofen
  (12, 2, 0);  -- Canada Ibuprofen -> US Ibuprofen

-- CMCME (link country_medicine to equivalence relationships)
INSERT INTO cmcme (country_medicine_id, country_medicine_equivalent_id) VALUES
  (1, 1), (6, 1), (1, 2), (6, 2), (1, 3), (11, 3), (1, 4), (11, 4),
  (2, 5), (7, 5), (2, 6), (7, 6), (2, 7), (12, 7), (2, 8), (12, 8);

-- Medicine_Availability
INSERT INTO medicine_availability (country_id, medicine_id, is_available) VALUES
  (1, 2, true), (1, 3, true), (1, 4, true), (1, 5, true), (1, 6, true),
  (2, 1, true), (2, 3, true), (2, 4, true), (2, 5, true), (2, 6, true),
  (3, 1, true), (3, 3, true), (3, 4, true), (3, 5, true), (3, 6, true);

-- Symptoms
INSERT INTO symptom (symptom_name) VALUES
  ('Cold'), ('Fever'), ('Cough'), ('Headache'), ('Allergies'),
  ('Pain'), ('Heartburn'), ('Acid reflux');

-- Medicine_Symptom (which medicine treats which symptom)
INSERT INTO medicine_symptom (medicine_id, symptom_id) VALUES
  (1, 1), (1, 2), (1, 4), (1, 6),   -- Paracetamol/Acetaminophen
  (2, 1), (2, 2), (2, 4), (2, 6),   -- same
  (3, 4), (3, 6),                    -- Ibuprofen
  (5, 7), (5, 8),                    -- Omeprazole
  (6, 5);                            -- Loratadine

-- Dosage_Guide
INSERT INTO dosage_guide (medicine_id, min_age, max_age, min_weight, max_weight, gender, dosage_text) VALUES
  (1, 12, 65, 40, 120, 'Any', '500mg every 4-6 hours. Max 4g/day.'),
  (1, 66, 120, 40, 120, 'Any', '500mg every 6 hours. Max 3g/day. Consider renal function.'),
  (3, 12, 65, 40, 120, 'Any', '200-400mg every 6-8 hours. Max 1200mg/day OTC.'),
  (3, 66, 120, 40, 120, 'Any', '200mg every 8 hours. Take with food. Monitor kidney function.');
