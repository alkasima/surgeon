import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { isAdminEmail } from '@/lib/admin-config';

export async function POST(request: NextRequest) {
  try {
    const { uid, email } = await request.json();
    
    if (!uid || !email) {
      return NextResponse.json({ error: 'UID and email are required' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firestore Admin not initialized' }, { status: 500 });
    }

    // Check if email should have admin access
    if (!isAdminEmail(email)) {
      return NextResponse.json({ isAdmin: false, message: 'Email not in admin list' });
    }

    // Add user to admins collection
    await adminDb.collection('admins').doc(uid).set({
      email: email,
      assignedAt: new Date(),
      assignedBy: 'system'
    });

    return NextResponse.json({ 
      isAdmin: true, 
      message: 'Admin role assigned successfully' 
    });
  } catch (error) {
    console.error('Error assigning admin role:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
