import { NextRequest, NextResponse } from 'next/server';
import { getUserData } from '@/lib/user-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;

    if (!uid) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const result = await getUserData(uid);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}