import { NextRequest, NextResponse } from 'next/server';
import { stripe, CREDIT_PACKAGES } from '@/lib/stripe';

// For MVP, we'll skip Firebase Admin verification
// In production, you'd want to properly set up Firebase Admin SDK

export async function POST(request: NextRequest) {
  try {
    const { packageId, userToken } = await request.json();

    // Verify user authentication
    if (!userToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For MVP, we'll use a simple user ID
    // In production, you'd want to verify the Firebase token properly
    const userId = 'user-' + Date.now(); // Simple fallback for MVP

    // Find the credit package
    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
    if (!creditPackage) {
      return NextResponse.json(
        { error: 'Invalid package selected' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: creditPackage.price,
      currency: 'usd',
      metadata: {
        userId,
        packageId: creditPackage.id,
        credits: creditPackage.credits.toString(),
      },
      description: `${creditPackage.name} - ${creditPackage.credits} AI Credits`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      packageInfo: creditPackage,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
