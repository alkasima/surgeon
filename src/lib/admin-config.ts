// Admin configuration - List of emails that should automatically get admin access
export const ADMIN_EMAILS = [
  'admin@myhaircrm.com',
  'superadmin@myhaircrm.com',
  // Add your admin emails here
  // Example: 'your-email@gmail.com',
  
  // TEMPORARY: Add your email here for testing
  // Replace 'your-email@example.com' with your actual email
  // 'your-email@example.com',
];

// Check if an email should have admin access
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

// Admin role assignment function
export async function assignAdminRoleIfNeeded(uid: string, email: string): Promise<boolean> {
  if (!isAdminEmail(email)) {
    return false;
  }

  try {
    // Import Firebase admin here to avoid issues with client-side code
    const { adminDb } = await import('@/lib/firebase-admin');
    
    if (!adminDb) {
      console.error('Firebase Admin not initialized');
      return false;
    }

    // Add user to admins collection
    await adminDb.collection('admins').doc(uid).set({
      email: email,
      assignedAt: new Date(),
      assignedBy: 'system'
    });

    console.log(`Admin role assigned to ${email} (${uid})`);
    return true;
  } catch (error) {
    console.error('Error assigning admin role:', error);
    return false;
  }
}
