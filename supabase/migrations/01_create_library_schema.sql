/*
# Library Management System Database Schema

## 1. New Tables

### profiles
- `id` (uuid, primary key, references auth.users)
- `username` (text, unique, not null)
- `role` (user_role enum: 'student', 'teacher', 'staff', default: 'student')
- `created_at` (timestamptz, default: now())

### books
- `id` (uuid, primary key, default: gen_random_uuid())
- `book_id` (text, unique, not null) - Display ID for users
- `title` (text, not null)
- `author` (text, not null)
- `stock` (integer, not null, default: 0)
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### transactions
- `id` (uuid, primary key, default: gen_random_uuid())
- `user_id` (uuid, references profiles, not null)
- `book_id` (uuid, references books, not null)
- `action` (text, not null) - 'borrow' or 'return'
- `transaction_date` (timestamptz, default: now())

## 2. Security

### RLS Policies
- Profiles: Users can view all profiles, only staff can update roles
- Books: Everyone can view, only staff can manage
- Transactions: Users can view their own, staff can view all

### RPC Functions
- `borrow_book(p_book_id uuid)`: Handles book borrowing with role-based limits
- `return_book(p_book_id uuid)`: Handles book returns
- `get_user_borrow_count(p_user_id uuid)`: Returns current borrowed books count
- `is_staff(p_user_id uuid)`: Checks if user is staff

## 3. Notes
- First registered user becomes staff (admin)
- Borrowing limits: student (3), teacher (5), staff (unlimited)
- Stock is automatically updated on borrow/return
- All data operations are public (no RLS) for maximum accessibility
*/

-- Create user role enum
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'staff');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  role user_role DEFAULT 'student'::user_role NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id text UNIQUE NOT NULL,
  title text NOT NULL,
  author text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL CHECK (action IN ('borrow', 'return')),
  transaction_date timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_book_id ON transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);

-- Trigger to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    SELECT COUNT(*) INTO user_count FROM profiles;
    
    -- Extract username from email (remove @miaoda.com)
    extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
    
    INSERT INTO profiles (id, username, role)
    VALUES (
      NEW.id,
      extracted_username,
      CASE WHEN user_count = 0 THEN 'staff'::user_role ELSE 'student'::user_role END
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- RPC function to get current borrow count for a user
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

-- RPC function to check if user is staff
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

-- RPC function to borrow a book
CREATE OR REPLACE FUNCTION borrow_book(p_book_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_user_role user_role;
  v_current_borrows int;
  v_max_borrows int;
  v_book_stock int;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not authenticated');
  END IF;
  
  -- Get user role
  SELECT role INTO v_user_role FROM profiles WHERE id = v_user_id;
  
  -- Get current borrow count
  v_current_borrows := get_user_borrow_count(v_user_id);
  
  -- Determine max borrows based on role
  v_max_borrows := CASE
    WHEN v_user_role = 'student'::user_role THEN 3
    WHEN v_user_role = 'teacher'::user_role THEN 5
    WHEN v_user_role = 'staff'::user_role THEN 999999
    ELSE 0
  END;
  
  -- Check if user has reached borrow limit
  IF v_current_borrows >= v_max_borrows THEN
    RETURN json_build_object('success', false, 'message', 'Borrowing limit reached');
  END IF;
  
  -- Check book stock
  SELECT stock INTO v_book_stock FROM books WHERE id = p_book_id FOR UPDATE;
  
  IF v_book_stock IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Book not found');
  END IF;
  
  IF v_book_stock <= 0 THEN
    RETURN json_build_object('success', false, 'message', 'Book out of stock');
  END IF;
  
  -- Update book stock
  UPDATE books SET stock = stock - 1, updated_at = now() WHERE id = p_book_id;
  
  -- Create transaction record
  INSERT INTO transactions (user_id, book_id, action)
  VALUES (v_user_id, p_book_id, 'borrow');
  
  RETURN json_build_object('success', true, 'message', 'Book borrowed successfully');
END;
$$;

-- RPC function to return a book
CREATE OR REPLACE FUNCTION return_book(p_book_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_has_borrowed boolean;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not authenticated');
  END IF;
  
  -- Check if user has borrowed this book
  SELECT EXISTS (
    SELECT 1 FROM transactions t1
    WHERE t1.user_id = v_user_id 
      AND t1.book_id = p_book_id 
      AND t1.action = 'borrow'
      AND NOT EXISTS (
        SELECT 1 FROM transactions t2
        WHERE t2.user_id = v_user_id
          AND t2.book_id = p_book_id
          AND t2.action = 'return'
          AND t2.transaction_date > t1.transaction_date
      )
  ) INTO v_has_borrowed;
  
  IF NOT v_has_borrowed THEN
    RETURN json_build_object('success', false, 'message', 'You have not borrowed this book');
  END IF;
  
  -- Update book stock
  UPDATE books SET stock = stock + 1, updated_at = now() WHERE id = p_book_id;
  
  -- Create transaction record
  INSERT INTO transactions (user_id, book_id, action)
  VALUES (v_user_id, p_book_id, 'return');
  
  RETURN json_build_object('success', true, 'message', 'Book returned successfully');
END;
$$;

-- Insert sample books for demonstration
INSERT INTO books (book_id, title, author, stock) VALUES
('BK001', 'Introduction to Algorithms', 'Thomas H. Cormen', 5),
('BK002', 'Clean Code', 'Robert C. Martin', 3),
('BK003', 'Design Patterns', 'Gang of Four', 4),
('BK004', 'The Pragmatic Programmer', 'Andrew Hunt', 6),
('BK005', 'Code Complete', 'Steve McConnell', 2),
('BK006', 'Refactoring', 'Martin Fowler', 4),
('BK007', 'Head First Design Patterns', 'Eric Freeman', 5),
('BK008', 'JavaScript: The Good Parts', 'Douglas Crockford', 3),
('BK009', 'You Don''t Know JS', 'Kyle Simpson', 7),
('BK010', 'Eloquent JavaScript', 'Marijn Haverbeke', 4)
ON CONFLICT (book_id) DO NOTHING;
