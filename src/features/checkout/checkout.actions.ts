'use server';

import { getLocale } from 'next-intl/server';
import { resolveCart } from '@/features/cart/cart.actions';
import { setUserCart } from '@/features/cart/cart.repo';
import type { SimpleLine } from '@/features/cart/cart.types';
import { createOrder, setOrderStripeSession } from '@/features/orders/orders.repo';
import { getSession } from '@/lib/auth/session';
import { type CurrencyCode, convertFromBase, isCurrency } from '@/lib/currency';
import { env } from '@/lib/env';
import { isStripeEnabled, stripe } from '@/lib/stripe';
import { checkoutSchema } from './checkout.schema';

export type CheckoutResult =
  | { ok: true; kind: 'cod'; orderId: string }
  | { ok: true; kind: 'stripe'; url: string }
  | { ok: false; error: 'validation' | 'emptyCart' | 'stripeDisabled' | 'stripeError' };

export async function placeOrderAction(
  rawLines: SimpleLine[],
  raw: Record<string, unknown>,
  currencyInput: string,
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: 'validation' };
  const input = parsed.data;

  const locale = await getLocale();
  const session = await getSession();
  const currency: CurrencyCode = isCurrency(currencyInput) ? currencyInput : 'USD';
  const view = await resolveCart(rawLines, locale);
  if (view.lines.length === 0) return { ok: false, error: 'emptyCart' };

  // Convert base (USD) prices into the selected display currency at purchase time.
  const items = view.lines.map((l) => ({
    productId: l.productId,
    titleSnapshot: l.title,
    unitPriceCents: convertFromBase(l.unitPriceCents, currency),
    quantity: l.quantity,
  }));
  const amountCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
  const address = {
    fullName: input.fullName,
    email: input.email,
    telephone: input.telephone,
    adresse: input.adresse,
    city: input.city,
    zipCode: input.zipCode,
    moreInfos: input.moreInfos || undefined,
  };

  if (input.paymentMethod === 'card') {
    if (!isStripeEnabled || !stripe) return { ok: false, error: 'stripeDisabled' };
    const order = await createOrder({
      userId: session?.userId ?? null,
      email: input.email,
      currency,
      amountCents,
      paymentMethod: 'OnlinePayment',
      onlinePaymentStatus: 'Pending',
      address,
      items,
      decrementStock: false,
    });
    try {
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: view.lines.map((l) => ({
          quantity: l.quantity,
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: convertFromBase(l.unitPriceCents, currency),
            product_data: { name: l.title },
          },
        })),
        customer_email: input.email,
        metadata: { orderId: order.id },
        success_url: `${env.NEXT_PUBLIC_BASE_URL}/${locale}/order/${order.id}/confirmation`,
        cancel_url: `${env.NEXT_PUBLIC_BASE_URL}/${locale}/checkout`,
      });
      await setOrderStripeSession(order.id, checkoutSession.id);
      if (!checkoutSession.url) return { ok: false, error: 'stripeError' };
      return { ok: true, kind: 'stripe', url: checkoutSession.url };
    } catch {
      return { ok: false, error: 'stripeError' };
    }
  }

  // Cash on delivery
  const order = await createOrder({
    userId: session?.userId ?? null,
    email: input.email,
    currency,
    amountCents,
    paymentMethod: 'CashOnDelivery',
    status: 'PendingApproval',
    address,
    items,
    decrementStock: true,
  });
  if (session) await setUserCart(session.userId, []);
  return { ok: true, kind: 'cod', orderId: order.id };
}
