import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateSubscription } from '@/lib/firebase/users';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Gérer les événements Stripe
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error('No userId in session metadata');
          break;
        }

        // Récupérer la subscription
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Mapping des price IDs vers les plans
        const priceIdToPlan: Record<string, 'essentiel' | 'standard' | 'premium'> = {
          'price_1SO7moE0RxlSMWpMJ7Bm7jdj': 'essentiel', // Essentiel Mensuel 5.99€
          'price_1SO80GE0RxlSMWpMNLFCvsqX': 'essentiel', // Essentiel Annuel 59.90€
          'price_1SO7ooE0RxlSMWpMvyUYtN06': 'standard',   // Standard Mensuel 9.99€
        };

        const priceId = subscription.items.data[0].price.id;
        const plan = priceIdToPlan[priceId] || 'free';

        await updateSubscription(userId, {
          plan,
          status: 'active',
          stripeCustomerId: session.customer as string,
          subscriptionId: subscription.id,
          currentPrice: subscription.items.data[0].price.unit_amount! / 100,
          startDate: new Date((subscription as any).current_period_start * 1000),
          endDate: new Date((subscription as any).current_period_end * 1000),
        });

        console.log(`✅ Subscription créée pour user ${userId} - Plan: ${plan}`);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        // TODO: Mettre à jour nextBillingDate, lastPaymentDate
        console.log(`💰 Invoice payée: ${invoice.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // TODO: Notifier l'utilisateur, suspendre l'abonnement
        console.log(`❌ Paiement échoué: ${invoice.id}`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        const statusMap: Record<string, 'active' | 'canceled' | 'incomplete' | 'past_due'> = {
          active: 'active',
          canceled: 'canceled',
          incomplete: 'incomplete',
          past_due: 'past_due',
          trialing: 'active',
        };

        await updateSubscription(userId, {
          status: statusMap[subscription.status] || 'incomplete',
          endDate: new Date((subscription as any).current_period_end * 1000),
        });

        console.log(`🔄 Subscription mise à jour: ${subscription.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        await updateSubscription(userId, {
          plan: 'free',
          status: 'canceled',
          endDate: new Date(),
        });

        console.log(`🗑️ Subscription annulée: ${subscription.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
