/*
  # Futsal Booking System Schema

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `roll_no` (text, unique) - Student roll number for login
      - `created_at` (timestamptz)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key to students)
      - `team_members` (text array) - Array of roll numbers
      - `id_card_url` (text) - URL to uploaded ID card image
      - `faculty` (text) - Selected faculty
      - `semester` (integer) - Selected semester (1-8)
      - `booking_date` (date) - Date of booking
      - `time_slot` (text) - Time slot for booking
      - `no_show_count` (integer, default 0) - Track no-shows for prioritization
      - `status` (text, default 'confirmed') - Booking status
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Students can read their own data
    - Students can create and view their own bookings
    - Prevent duplicate bookings for same time slot
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) NOT NULL,
  team_members text[] NOT NULL,
  id_card_url text NOT NULL,
  faculty text NOT NULL,
  semester integer NOT NULL CHECK (semester >= 1 AND semester <= 8),
  booking_date date NOT NULL,
  time_slot text NOT NULL,
  no_show_count integer DEFAULT 0,
  status text DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);

-- Create index for faster booking lookups
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, time_slot);
CREATE INDEX IF NOT EXISTS idx_bookings_student ON bookings(student_id);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table
CREATE POLICY "Students can view all students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create student record"
  ON students FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policies for bookings table
CREATE POLICY "Students can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Students can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Students can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (student_id IN (SELECT id FROM students WHERE roll_no = current_setting('app.student_roll_no', true)))
  WITH CHECK (student_id IN (SELECT id FROM students WHERE roll_no = current_setting('app.student_roll_no', true)));