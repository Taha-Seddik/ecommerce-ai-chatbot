import 'server-only';
import Stripe from 'stripe';
import { env } from '@/lib/env';

/** Stripe client — null when no key is configured (Stripe checkout is then disabled, COD still works). */
export const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;
export const isStripeEnabled = Boolean(env.STRIPE_SECRET_KEY);
