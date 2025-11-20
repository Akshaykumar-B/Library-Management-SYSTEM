/*
# Add Delete All Users Function

## Changes
- Create RPC function to delete all users
- Allows staff to reset user database

## Security
- Only callable by staff members
- Deletes all profiles and auth users
- Dangerous operation - requires confirmation in UI

## Notes
- This is a destructive operation
- Cannot be undone
- Use with caution
*/

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
  -- Check if caller is staff
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only staff members can delete all users';
  END IF;

  -- Count users before deletion
  SELECT COUNT(*) INTO deleted_count FROM profiles;

  -- Delete all users from auth.users (this will cascade to profiles)
  FOR user_record IN SELECT id FROM auth.users LOOP
    DELETE FROM auth.users WHERE id = user_record.id;
  END LOOP;

  -- Return result
  RETURN json_build_object(
    'success', true,
    'deleted_count', deleted_count,
    'message', 'All users deleted successfully'
  );
END;
$$;
