-- Schema for Medical Utility Companion App
-- Matches the ERD (crow's foot notation)
--
-- Prerequisite: Create the database first:
--   createdb medical_utility
-- Or: psql -c "CREATE DATABASE medical_utility;"
--
-- Run this file: psql medical_utility -f db/schema.sql

-- Drop existing tables (order matters due to foreign keys)
DROP TABLE IF EXISTS cmcme;
DROP TABLE IF EXISTS country_medicine_equivalent;
DROP TABLE IF EXISTS country_medicine;
DROP TABLE IF EXISTS medicine_symptom;
DROP TABLE IF EXISTS medicine_availability;
DROP TABLE IF EXISTS dosage_guide;
DROP TABLE IF EXISTS user_data;
DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS symptom;
DROP TABLE IF EXISTS medicine;
DROP TABLE IF EXISTS country;

-- 1. USER: authentication
CREATE TABLE "user" (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- 2. COUNTRY: countries for equivalence and availability
CREATE TABLE country (
  country_id SERIAL PRIMARY KEY,
  country_name VARCHAR(100) NOT NULL
);

-- 3. USER_DATA: demographic data (1:1 with USER, references COUNTRY)
CREATE TABLE user_data (
  user_id INTEGER PRIMARY KEY REFERENCES "user"(user_id) ON DELETE CASCADE,
  age INTEGER,
  gender VARCHAR(50),
  height_cm REAL,
  weight_kg REAL,
  country_id INTEGER REFERENCES country(country_id)
);

-- 4. MEDICINE: medicine catalog
CREATE TABLE medicine (
  medicine_id SERIAL PRIMARY KEY,
  generic_name VARCHAR(200) NOT NULL,
  brand_name VARCHAR(200),
  description TEXT,
  drug_facts TEXT
);

-- 5. COUNTRY_MEDICINE: junction (medicine available/registered in country)
CREATE TABLE country_medicine (
  country_medicine_id SERIAL PRIMARY KEY,
  country_id INTEGER NOT NULL REFERENCES country(country_id) ON DELETE CASCADE,
  medicine_id INTEGER NOT NULL REFERENCES medicine(medicine_id) ON DELETE CASCADE
);

-- 6. COUNTRY_MEDICINE_EQUIVALENT: equivalence between country-medicine pairs
-- view_count: tracks lookups (used by Find Equivalent button)
CREATE TABLE country_medicine_equivalent (
  equivalent_relationship_id SERIAL PRIMARY KEY,
  source_country_medicine_id INTEGER NOT NULL REFERENCES country_medicine(country_medicine_id) ON DELETE CASCADE,
  target_country_medicine_id INTEGER NOT NULL REFERENCES country_medicine(country_medicine_id) ON DELETE CASCADE,
  view_count INTEGER NOT NULL DEFAULT 0
);

-- 7. CMCME: links country_medicine to equivalence relationships
CREATE TABLE cmcme (
  cmcme_id SERIAL PRIMARY KEY,
  country_medicine_id INTEGER NOT NULL REFERENCES country_medicine(country_medicine_id) ON DELETE CASCADE,
  country_medicine_equivalent_id INTEGER NOT NULL REFERENCES country_medicine_equivalent(equivalent_relationship_id) ON DELETE CASCADE
);

-- 8. MEDICINE_AVAILABILITY: medicine availability per country
CREATE TABLE medicine_availability (
  availability_id SERIAL PRIMARY KEY,
  country_id INTEGER NOT NULL REFERENCES country(country_id) ON DELETE CASCADE,
  medicine_id INTEGER NOT NULL REFERENCES medicine(medicine_id) ON DELETE CASCADE,
  is_available BOOLEAN NOT NULL DEFAULT true
);

-- 9. SYMPTOM: symptom catalog
CREATE TABLE symptom (
  symptom_id SERIAL PRIMARY KEY,
  symptom_name VARCHAR(100) NOT NULL
);

-- 10. MEDICINE_SYMPTOM: junction (medicine treats symptom)
CREATE TABLE medicine_symptom (
  medicine_id INTEGER NOT NULL REFERENCES medicine(medicine_id) ON DELETE CASCADE,
  symptom_id INTEGER NOT NULL REFERENCES symptom(symptom_id) ON DELETE CASCADE,
  PRIMARY KEY (medicine_id, symptom_id)
);

-- 11. DOSAGE_GUIDE: dosage guidelines by demographics
CREATE TABLE dosage_guide (
  dosage_id SERIAL PRIMARY KEY,
  medicine_id INTEGER NOT NULL REFERENCES medicine(medicine_id) ON DELETE CASCADE,
  min_age INTEGER,
  max_age INTEGER,
  min_weight INTEGER,
  max_weight INTEGER,
  gender VARCHAR(50),
  dosage_text TEXT NOT NULL
);
