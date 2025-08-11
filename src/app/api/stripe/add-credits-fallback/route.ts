import { NextRequest, NextResponse } from 'next/server';
import { addAICredits } from '@/app/user/actions';
import { stripe } from '@/lib/stripe';

// Fallback endpoint to add credits when webhook isn't configured
export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Session ID and User ID are required' },
        { status: 400 }
      );
    }

    // Verify the session exists and was paid
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get credits from session metadata
    const credits = session.metadata?.credits ? parseInt(session.metadata.credits, 10) : 0;
    
    if (credits <= 0) {
      return NextResponse.json(
        { error: 'No credits found in session' },
        { status: 400 }
      );
    }

    // Add credits to user account
    const result = await addAICredits(userId, credits);

    if (result.success) {
      console.log(`Fallback: Successfully added ${credits} credits to user ${userId}`);
      return NextResponse.json({
        success: true,
        creditsAdded: credits,
        newTotal: result.newTotal
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in fallback credit addition:', error);
    return NextResponse.json(
      { error: 'Failed to add credits' },
      { status: 500 }
    );
  }
}