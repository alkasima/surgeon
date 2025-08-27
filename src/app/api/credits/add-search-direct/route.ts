import { NextRequest, NextResponse } from 'next/server';
import { addSearchCredits } from '@/lib/user-api';

// Direct search credit addition for development/testing
export async function POST(request: NextRequest) {
  try {
    const { userId, credits, reason } = await request.json();

    if (!userId || !credits) {
      return NextResponse.json(
        { error: 'User ID and credits are required' },
        { status: 400 }
      );
    }

    console.log(`Adding ${credits} search credits to user ${userId} - Reason: ${reason || 'Direct addition'}`);

    const result = await addSearchCredits(userId, parseInt(credits, 10));

    if (result.success) {
      console.log(`Successfully added ${credits} search credits. New total: ${result.newTotal}`);
      return NextResponse.json({
        success: true,
        creditsAdded: credits,
        newTotal: result.newTotal,
        message: `Successfully added ${credits} search credits`
      });
    } else {
      console.error(`Failed to add search credits:`, result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error adding search credits:', error);
    return NextResponse.json(
      { error: 'Failed to add search credits' },
      { status: 500 }
    );
  }
}