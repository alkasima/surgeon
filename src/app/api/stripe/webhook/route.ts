import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { addAICredits } from '@/lib/user-api';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event;

  // Check if webhook secret is properly configured
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret === 'whsec_your_webhook_secret') {
    console.log('Webhook secret not configured - skipping signature verification for development');
    return NextResponse.json(
      { error: 'Webhook not configured - use fallback method' },
      { status: 400 }
    );
  }

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const { userId, credits } = session.metadata || {};

        if (userId && credits) {
          const creditsToAdd = parseInt(credits, 10);
          const result = await addAICredits(userId, creditsToAdd);
          
          if (result.success) {
            console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`);
          } else {
            console.error(`Failed to add credits to user ${userId}:`, result.error);
          }
        }
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const { userId: piUserId, credits: piCredits } = paymentIntent.metadata || {};

        if (piUserId && piCredits) {
          const creditsToAdd = parseInt(piCredits, 10);
          const result = await addAICredits(piUserId, creditsToAdd);
          
          if (result.success) {
            console.log(`Successfully added ${creditsToAdd} credits to user ${piUserId}`);
          } else {
            console.error(`Failed to add credits to user ${piUserId}:`, result.error);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        console.log('Payment failed:', event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
