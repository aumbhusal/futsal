CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) NOT NULL,
  team_members text[] NOT NULL,
  id_card_url text NOT NULL,
  faculty text NOT NULL,
  semester integer NOT NULL CHECK (semester >= 1 AND semester <= 8),
  booking_date date NOT NULL,
  time_slot text NOT NULL,
  email text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  no_show_count integer DEFAULT 0,
  status text DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);

