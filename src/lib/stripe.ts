import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Credit packages configuration
export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 25,
    price: 999, // $9.99 in cents
    description: 'Perfect for trying out AI features',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 100,
    price: 2999, // $29.99 in cents
    description: 'Great for active researchers',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    credits: 250,
    price: 5999, // $59.99 in cents
    description: 'Best value for power users',
    popular: false,
  },
];

export const formatPrice = (priceInCents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100);
};
