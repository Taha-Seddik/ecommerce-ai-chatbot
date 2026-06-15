import { type NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { markOrderPaid } from '@/features/orders/orders.repo';
import { env } from '@/lib/env';
import { stripe } from '@/lib/stripe';

// Stripe webhook — verifies the signature against the raw body. Source of truth for paid orders.
export async function POST(req: NextRequest) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const paymentIntentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent?.id ?? undefined);
      await markOrderPaid(orderId, paymentIntentId);
    }
  }

  return NextResponse.json({ received: true });
}
