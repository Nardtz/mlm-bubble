# Super Admin Setup Guide

This guide explains how to set up and use the Super Admin feature, which allows a top-level leader to view all bubbles from all user accounts.

## Setup Steps

### 1. Run the Database Migration

First, you need to add the `is_super_admin` field to the profiles table and update the RLS policies. Run the SQL migration:

```sql
-- Run this in your Supabase SQL editor
-- File: supabase/add-super-admin.sql
```

This will:
- Add `is_super_admin` boolean field to the `profiles` table
- Update RLS policies to allow super admins to view all members
- Create necessary indexes for performance

### 2. Set a User as Super Admin

To make a user a super admin, run the SQL script:

```sql
-- Run this in your Supabase SQL editor
-- File: supabase/set-super-admin.sql
```

**Method 1: By Email**
```sql
UPDATE profiles 
SET is_super_admin = TRUE
WHERE email = 'admin@example.com';
```

**Method 2: By User ID (UUID)**
```sql
UPDATE profiles 
SET is_super_admin = TRUE
WHERE id = 'USER_ID_HERE'::UUID;
```

**Verify the update:**
```sql
SELECT id, username, email, is_super_admin 
FROM profiles 
WHERE is_super_admin = TRUE;
```

### 3. Using Super Admin Features

Once a user is set as super admin:

1. **Login** to the admin page (`/admin`)
2. You'll see a **"SUPER ADMIN"** badge next to the title
3. Toggle **"View All Users' Bubbles"** checkbox to see all bubbles from all accounts
4. In the all-users view, you'll see:
   - A grid of all users' bubbles
   - Each user's username and email
   - Statistics for each user (First Level, Second Level, Third Level counts)
   - Individual bubble visualizations for each user

## Features

### Super Admin Capabilities

- **View All Bubbles**: See all MLM structures from all user accounts
- **Read-Only Access**: Super admins can view all data but cannot modify other users' data directly through the UI
- **Database Level Access**: Super admins can view all members through the API and database queries

### Security

- Only users with `is_super_admin = TRUE` in the profiles table can access super admin features
- RLS policies ensure super admins can view all data while regular users can only see their own
- API routes check super admin status before returning all users' data

## API Endpoints

### Check Super Admin Status
```
GET /api/check-super-admin
```
Returns: `{ success: true, isSuperAdmin: boolean }`

### Get All Users' MLM Data (Super Admin Only)
```
GET /api/mlm-data?all=true
```
Returns: `{ success: true, data: Record<string, { userInfo, mlmData }>, isSuperAdmin: true }`

## Troubleshooting

### User not showing as super admin
1. Verify the user exists in the `profiles` table
2. Check that `is_super_admin` is set to `TRUE` (not just `true` - PostgreSQL is case-sensitive for booleans)
3. Ensure the user is logged in and the session is valid

### Cannot see all users' bubbles
1. Make sure you've run the `add-super-admin.sql` migration
2. Verify RLS policies are updated correctly
3. Check browser console for any API errors
4. Ensure the toggle "View All Users' Bubbles" is checked

### RLS Policy Issues
If you encounter permission errors, verify the policies in `supabase/add-super-admin.sql` were applied correctly. The policies should allow super admins to:
- SELECT all members (not just their own)
- UPDATE all members
- DELETE all members

## Notes

- Super admin status is stored in the `profiles` table
- Only one super admin is needed, but you can have multiple if required
- Super admin features are read-only in the UI - direct database access is required for modifications
- The super admin view shows all users in a grid layout for easy comparison

