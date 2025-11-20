/*
# Fix Database Permissions and Reset System

## Changes
- Drop and recreate all tables with proper permissions
- Fix RLS policies to allow public access
- Ensure first user becomes staff
- Fix all RPC functions with proper permissions
- Clear all existing data for fresh start

## Security
- No RLS enabled (public access for all operations)
- Staff-only operations controlled via RPC functions
- Proper CASCADE deletes configured

## Notes
- This is a complete reset
- All existing data will be deleted
- First user to register will become staff
*/

-- Drop existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
DROP TRIGGER IF EXISTS on_auth_session_created ON auth.sessions;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_last_login() CASCADE;
DROP FUNCTION IF EXISTS delete_all_users() CASCADE;
DROP FUNCTION IF EXISTS is_staff(uuid) CASCADE;
DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_borrow_count(uuid) CASCADE;
DROP FUNCTION IF EXISTS borrow_book(uuid) CASCADE;
DROP FUNCTION IF EXISTS return_book(uuid) CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS active_users CASCADE;

-- Drop existing tables (CASCADE will handle foreign keys)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop and recreate enum type
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'staff');

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role user_role DEFAULT 'student'::user_role NOT NULL,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create books table
CREATE TABLE books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id text UNIQUE NOT NULL,
  title text NOT NULL,
  author text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  content text,
  cover_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL CHECK (action IN ('borrow', 'return')),
  transaction_date timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_book_id ON transactions(book_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_books_book_id ON books(book_id);

-- NO RLS - All tables are publicly accessible
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE books DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
    
    INSERT INTO profiles (id, username, role, last_login_at)
    VALUES (
      NEW.id,
      extracted_username,
      CASE WHEN user_count = 0 THEN 'staff'::user_role ELSE 'student'::user_role END,
      now()
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update last login time
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET last_login_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Trigger to update last login
CREATE TRIGGER on_auth_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login();

-- View for active users
CREATE VIEW active_users AS
SELECT 
  p.id,
  p.username,
  p.role,
  p.last_login_at
FROM profiles p
WHERE p.last_login_at > now() - interval '30 minutes'
ORDER BY p.last_login_at DESC;

-- Helper function to check if user is staff
CREATE OR REPLACE FUNCTION is_staff(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_user_id AND role = 'staff'::user_role
  );
END;
$$;

-- Alias for is_admin (same as is_staff)
CREATE OR REPLACE FUNCTION is_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN is_staff(p_user_id);
END;
$$;

-- Function to get user borrow count
CREATE OR REPLACE FUNCTION get_user_borrow_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  borrow_count int;
  return_count int;
BEGIN
  SELECT COUNT(*) INTO borrow_count
  FROM transactions
  WHERE user_id = p_user_id AND action = 'borrow';
  
  SELECT COUNT(*) INTO return_count
  FROM transactions
  WHERE user_id = p_user_id AND action = 'return';
  
  RETURN borrow_count - return_count;
END;
$$;

-- Function to borrow a book
CREATE OR REPLACE FUNCTION borrow_book(p_book_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_user_role user_role;
  v_current_borrows int;
  v_borrow_limit int;
  v_book_stock int;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not authenticated');
  END IF;
  
  SELECT role INTO v_user_role FROM profiles WHERE id = v_user_id;
  SELECT stock INTO v_book_stock FROM books WHERE id = p_book_id;
  
  IF v_book_stock IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Book not found');
  END IF;
  
  IF v_book_stock <= 0 THEN
    RETURN json_build_object('success', false, 'message', 'Book is out of stock');
  END IF;
  
  v_current_borrows := get_user_borrow_count(v_user_id);
  
  v_borrow_limit := CASE v_user_role
    WHEN 'student'::user_role THEN 3
    WHEN 'teacher'::user_role THEN 5
    WHEN 'staff'::user_role THEN 999999
    ELSE 0
  END;
  
  IF v_current_borrows >= v_borrow_limit THEN
    RETURN json_build_object('success', false, 'message', 'Borrow limit reached');
  END IF;
  
  UPDATE books SET stock = stock - 1 WHERE id = p_book_id;
  INSERT INTO transactions (user_id, book_id, action) VALUES (v_user_id, p_book_id, 'borrow');
  
  RETURN json_build_object('success', true, 'message', 'Book borrowed successfully');
END;
$$;

-- Function to return a book
CREATE OR REPLACE FUNCTION return_book(p_book_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not authenticated');
  END IF;
  
  UPDATE books SET stock = stock + 1 WHERE id = p_book_id;
  INSERT INTO transactions (user_id, book_id, action) VALUES (v_user_id, p_book_id, 'return');
  
  RETURN json_build_object('success', true, 'message', 'Book returned successfully');
END;
$$;

-- Function to delete all users (staff only)
CREATE OR REPLACE FUNCTION delete_all_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
  user_record record;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only staff members can delete all users';
  END IF;

  SELECT COUNT(*) INTO deleted_count FROM profiles;

  FOR user_record IN SELECT id FROM auth.users LOOP
    DELETE FROM auth.users WHERE id = user_record.id;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'message', 'All users deleted successfully'
  );
END;
$$;
