# Admin Dashboard Setup Guide

## 🚀 Automatic Admin Setup (Recommended)

### **Easy Setup with Email-Based Admin Assignment**

1. **Configure Admin Email**
   - Go to `/admin-setup` for an interactive setup guide
   - Or manually edit `src/lib/admin-config.ts`
   - Add your email to the `ADMIN_EMAILS` array

2. **Sign Up as Admin**
   - Go to `/signup` and create account with your admin email
   - You'll be **automatically redirected** to admin dashboard
   - Admin role is assigned automatically!

3. **Login as Admin**
   - Go to `/login` and sign in with your admin email
   - You'll be **automatically redirected** to admin dashboard
   - No manual configuration needed!

## 🔧 Manual Setup (Alternative)

1. **Create an Admin User Account**
   - Sign up normally through the app at `/signup`
   - Note the user's UID from Firebase Console

2. **Make User an Admin**
   - Go to Firebase Console → Firestore Database
   - Create a new collection called `admins`
   - Add a document with the user's UID as the document ID
   - The document can be empty (just the UID as document ID)

3. **Access Admin Dashboard**
   - Login with the admin account
   - Navigate to `/admin/users` to access the admin dashboard
   - You should see the admin sidebar with "User Management" option

## Admin Features Available

### User Management (`/admin/users`)
- **View All Users**: See list of all registered users with their details
- **Add New Users**: Create new user accounts directly from admin panel
- **Delete Users**: Remove user accounts permanently
- **Reset Passwords**: Change any user's password
- **Manage Credits**: Add credits to any user's account
- **View User Credits**: See current credit balance for each user

### User Actions Available
1. **Add Credits**: Click "Add Credits" button to add credits to any user
2. **Reset Password**: Click "Reset Password" to change a user's password
3. **Delete User**: Click "Delete" to permanently remove a user account

## Admin Authentication

The admin system checks for admin status by looking for a document in the `admins` collection in Firestore with the user's UID as the document ID.

## Security Notes

- Only users with documents in the `admins` collection can access admin features
- Admin actions require Firebase Admin SDK to be properly configured
- All admin actions are logged and can be tracked

## Troubleshooting

If you can't access admin features:
1. Check that your user UID exists in the `admins` collection
2. Verify Firebase Admin SDK is configured (check console for errors)
3. Make sure you're logged in with the correct account
4. Check browser console for any authentication errors
