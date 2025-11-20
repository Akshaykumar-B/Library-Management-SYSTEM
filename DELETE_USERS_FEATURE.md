# Delete All Users Feature

## Overview
Added a powerful administrative feature to delete all users from the system with proper safety measures and confirmations.

## Features

### 🗑️ Delete All Users Button
- Located in the **Admin Users** page header
- Red destructive button with trash icon
- Only visible to staff members
- Disabled when no users exist

### ⚠️ Safety Measures

#### Multi-Level Confirmation
1. **Button Click**: User must click "Delete All Users" button
2. **Warning Dialog**: Shows detailed confirmation dialog with:
   - Warning icon and red title
   - Count of users to be deleted
   - List of what will be deleted:
     - All user accounts and profiles
     - All authentication data
     - All user sessions
   - Clear warning about logout
   - Information about next admin

#### Confirmation Dialog Details
```
⚠️ This action cannot be undone!

This will permanently delete all X users from the system, including:
• All user accounts and profiles
• All authentication data
• All user sessions

You will be logged out immediately after deletion.

The next user to register will become the new staff (admin).
```

### 🔒 Security Features

1. **Staff-Only Access**
   - Function checks if caller is staff using `is_admin()` function
   - Non-staff users cannot execute this operation
   - Returns error if unauthorized

2. **Database-Level Security**
   - Uses `SECURITY DEFINER` for controlled execution
   - Proper error handling and rollback on failure
   - Cascading deletes handled properly

3. **Session Management**
   - Automatically logs out current user after deletion
   - Clears all active sessions
   - Redirects to login page

### 📊 Deletion Process

1. **Count Users**: Records number of users before deletion
2. **Delete Auth Users**: Removes all users from `auth.users` table
3. **Cascade Delete**: Automatically removes related profiles
4. **Return Result**: Provides deletion count and success message
5. **Logout**: Signs out current user
6. **Redirect**: Navigates to login page after 2 seconds

### 🎯 Use Cases

1. **Development/Testing**
   - Quickly reset user database during development
   - Start fresh with new test users
   - Clean up test accounts

2. **System Reset**
   - Reset system to initial state
   - Remove all user data for fresh start
   - Prepare for new deployment

3. **Data Management**
   - Clean up old/unused accounts
   - Reset after demo or presentation
   - Prepare for production launch

## Technical Implementation

### Database Function
```sql
CREATE OR REPLACE FUNCTION delete_all_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
```

**Features:**
- Returns JSON with deletion count and message
- Checks staff permissions before execution
- Loops through all users for proper deletion
- Handles cascading relationships

### API Function
```typescript
async deleteAllUsers(): Promise<{ deleted_count: number; message: string }>
```

**Features:**
- Calls Supabase RPC function
- Returns deletion statistics
- Proper error handling
- Type-safe response

### UI Component
**Location:** `src/pages/AdminUsers.tsx`

**Components Used:**
- `AlertDialog` for confirmation
- `AlertDialogTrigger` for button
- `AlertDialogContent` for warning message
- `AlertDialogAction` for confirmation
- `AlertDialogCancel` for cancellation

## User Experience

### Visual Feedback

1. **Button States**
   - Normal: Red destructive button
   - Disabled: Grayed out when no users or deleting
   - Loading: Shows "Deleting..." text during operation

2. **Toast Notifications**
   - Success: Shows count of deleted users
   - Error: Shows error message if operation fails
   - Logout warning: Notifies user they will be logged out

3. **Loading States**
   - Button disabled during deletion
   - Cancel button disabled during deletion
   - Loading text in action button

### User Flow

```
1. Staff clicks "Delete All Users" button
   ↓
2. Warning dialog appears with details
   ↓
3. Staff reads warnings and consequences
   ↓
4. Staff clicks "Yes, Delete All Users" or "Cancel"
   ↓
5. If confirmed:
   - Shows "Deleting..." state
   - Executes deletion
   - Shows success toast
   - Logs out user
   - Redirects to login page (2 second delay)
   ↓
6. If cancelled:
   - Dialog closes
   - No action taken
```

## Files Modified

### New Migration
- `supabase/migrations/05_add_delete_all_users_function.sql`
  - Creates `delete_all_users()` RPC function
  - Adds security checks
  - Implements deletion logic

### Updated Files
1. **src/db/api.ts**
   - Added `deleteAllUsers()` function
   - Calls RPC and returns result

2. **src/pages/AdminUsers.tsx**
   - Added imports for AlertDialog components
   - Added `deletingAll` state
   - Added `handleDeleteAllUsers()` function
   - Added Delete All Users button with dialog
   - Added navigation for redirect

## Safety Checklist

✅ **Confirmation Required**: User must explicitly confirm action  
✅ **Clear Warnings**: Multiple warnings about consequences  
✅ **Staff Only**: Only staff members can execute  
✅ **Logout Notification**: User warned they will be logged out  
✅ **Count Display**: Shows exact number of users to be deleted  
✅ **Cannot Undo Warning**: Clearly states action is permanent  
✅ **Disabled When Empty**: Button disabled if no users exist  
✅ **Loading State**: Prevents multiple clicks during execution  
✅ **Error Handling**: Proper error messages if operation fails  
✅ **Auto Redirect**: Automatically redirects to login page  

## Testing Instructions

### Test Scenario 1: Successful Deletion
1. Log in as staff member
2. Go to Admin Users page
3. Click "Delete All Users" button
4. Read confirmation dialog
5. Click "Yes, Delete All Users"
6. Verify success toast appears
7. Verify automatic logout
8. Verify redirect to login page
9. Register new user
10. Verify new user becomes staff

### Test Scenario 2: Cancellation
1. Log in as staff member
2. Go to Admin Users page
3. Click "Delete All Users" button
4. Click "Cancel" in dialog
5. Verify dialog closes
6. Verify no users deleted
7. Verify still logged in

### Test Scenario 3: No Users
1. Delete all users (system reset)
2. Register as new staff
3. Go to Admin Users page
4. Verify "Delete All Users" button is disabled
5. Verify only 1 user exists (yourself)

### Test Scenario 4: Non-Staff Access
1. Log in as student or teacher
2. Admin Users page should not be accessible
3. If accessed via URL, should redirect or show error

## Important Notes

⚠️ **DESTRUCTIVE OPERATION**
- This operation permanently deletes ALL users
- Cannot be undone or reversed
- Use with extreme caution in production

⚠️ **LOGOUT BEHAVIOR**
- Current user will be logged out
- All sessions will be terminated
- Must register again to access system

⚠️ **FIRST USER BECOMES ADMIN**
- After deletion, system is reset
- Next user to register becomes staff
- This is by design for system initialization

## Future Enhancements (Optional)

Potential improvements:
- Add backup before deletion
- Add selective user deletion
- Add user export before deletion
- Add deletion confirmation via password
- Add deletion audit log
- Add undo functionality (within time window)
- Add soft delete option
- Add user archive feature

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify staff permissions
3. Check database connection
4. Review Supabase logs
5. Verify RPC function exists

## Conclusion

This feature provides a safe and controlled way to reset the user database while maintaining proper security measures and user experience. The multiple confirmation steps and clear warnings ensure users understand the consequences before proceeding.
