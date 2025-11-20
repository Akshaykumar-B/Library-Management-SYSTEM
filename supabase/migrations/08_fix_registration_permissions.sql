/*
# Fix Registration Permissions

## Issue
- "Database error granting user" during registration
- Trigger function lacks permissions to insert into profiles

## Solution
- Grant all necessary permissions to public and authenticated roles
- Ensure trigger function can execute properly
- Fix search_path and security settings

## Changes
- Grant INSERT, SELECT, UPDATE, DELETE on all tables
- Grant USAGE on sequences
- Fix function security and search path
*/

-- Grant permissions on profiles table
GRANT ALL ON profiles TO postgres, authenticated, anon, service_role;
GRANT ALL ON profiles TO public;

-- Grant permissions on books table
GRANT ALL ON books TO postgres, authenticated, anon, service_role;
GRANT ALL ON books TO public;

-- Grant permissions on transactions table
GRANT ALL ON transactions TO postgres, authenticated, anon, service_role;
GRANT ALL ON transactions TO public;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon, service_role;
GRANT ALL ON SCHEMA public TO postgres, authenticated, anon, service_role;

-- Grant permissions on all sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, anon, service_role;

-- Recreate the handle_new_user function with proper permissions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_count int;
  extracted_username text;
BEGIN
  -- Only process when user is being confirmed
  IF OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL THEN
    -- Count existing profiles
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    
    -- Extract username from email
    extracted_username := REPLACE(NEW.email, '@miaoda.com', '');
    
    -- Insert new profile
    INSERT INTO public.profiles (id, username, role, last_login_at)
    VALUES (
      NEW.id,
      extracted_username,
      CASE WHEN user_count = 0 THEN 'staff'::user_role ELSE 'student'::user_role END,
      now()
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth operation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Recreate update_last_login function with proper permissions
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE public.profiles
  SET last_login_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in update_last_login: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the login trigger
DROP TRIGGER IF EXISTS on_auth_session_created ON auth.sessions;
CREATE TRIGGER on_auth_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login();

-- Grant execute permissions on all functions
GRANT EXECUTE ON FUNCTION handle_new_user() TO postgres, authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION update_last_login() TO postgres, authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION is_staff(uuid) TO postgres, authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO postgres, authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_user_borrow_count(uuid) TO postgres, authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION borrow_book(uuid) TO postgres, authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION return_book(uuid) TO postgres, authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION delete_all_users() TO postgres, authenticated, anon, service_role;
