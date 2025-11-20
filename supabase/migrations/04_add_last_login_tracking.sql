/*
# Add Last Login Tracking

## Changes
- Add last_login_at column to profiles table
- Add function to update last login time
- Track when users log in

## Notes
- This allows tracking active/logged-in users
- Users logged in within last 30 minutes are considered "active"
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

-- Function to update last login time
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_login_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last login when auth session is created
DROP TRIGGER IF EXISTS on_auth_session_created ON auth.sessions;
CREATE TRIGGER on_auth_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_last_login();

-- Create view for active users (logged in within last 30 minutes)
CREATE OR REPLACE VIEW active_users AS
SELECT 
  p.id,
  p.username,
  p.role,
  p.last_login_at
FROM profiles p
WHERE p.last_login_at > now() - interval '30 minutes'
ORDER BY p.last_login_at DESC;
