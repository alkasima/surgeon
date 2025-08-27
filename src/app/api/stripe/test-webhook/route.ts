import { NextRequest, NextResponse } from 'next/server';
import { addAICredits } from '@/lib/user-api';

// Test endpoint to simulate webhook for development
export async function POST(request: NextRequest) {
  try {
    const { userId, credits } = await request.json();

    if (!userId || !credits) {
      return NextResponse.json(
        { error: 'userId and credits are required' },
        { status: 400 }
      );
    }

    const result = await addAICredits(userId, parseInt(credits, 10));

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully added ${credits} credits to user ${userId}`,
        newTotal: result.newTotal
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process test webhook' },
      { status: 500 }
    );
  }
}