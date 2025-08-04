import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { addAICredits } from '@/app/user/actions';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
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
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const { userId, credits } = paymentIntent.metadata;

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
