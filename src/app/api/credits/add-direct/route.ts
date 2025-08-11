import { NextRequest, NextResponse } from 'next/server';
import { addAICredits } from '@/app/user/actions';

// Direct credit addition for development/testing
export async function POST(request: NextRequest) {
  try {
    const { userId, credits, reason } = await request.json();

    if (!userId || !credits) {
      return NextResponse.json(
        { error: 'User ID and credits are required' },
        { status: 400 }
      );
    }

    console.log(`Adding ${credits} credits to user ${userId} - Reason: ${reason || 'Direct addition'}`);

    const result = await addAICredits(userId, parseInt(credits, 10));

    if (result.success) {
      console.log(`Successfully added ${credits} credits. New total: ${result.newTotal}`);
      return NextResponse.json({
        success: true,
        creditsAdded: credits,
        newTotal: result.newTotal,
        message: `Successfully added ${credits} credits`
      });
    } else {
      console.error(`Failed to add credits:`, result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error adding credits:', error);
    return NextResponse.json(
      { error: 'Failed to add credits' },
      { status: 500 }
    );
  }
}