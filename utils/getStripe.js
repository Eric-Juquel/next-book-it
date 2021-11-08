import { loadStripe } from '@stripe/stripe-js';
import { get } from 'mongoose';

let stripePromise;

const getStripe = () => {
  if (!stripePromise) {
    console.log('key', process.env.NEXT_PUBLIC_STRIPE_API_KEY);
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_KEY);
  }

  return stripePromise;
};

export default getStripe;
