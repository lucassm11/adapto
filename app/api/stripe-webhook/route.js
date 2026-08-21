import Stripe from 'stripe';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    return Response.json({ error: 'Webhook no configurado.' }, { status: 503 });
  }

  let event;
  try {
    const stripe = new Stripe(secret);
    const firma = request.headers.get('stripe-signature');
    const payload = await request.text();
    event = stripe.webhooks.constructEvent(payload, firma, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return Response.json({ error: 'Firma invalida.' }, { status: 400 });
  }

  try {
    const db = getAdminDb();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const uid = session.metadata?.uid || session.client_reference_id;
        if (uid && session.payment_status === 'paid') {
          await db.collection('usuarios').doc(uid).set(
            {
              plan: 'pro',
              stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
              stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : null,
              fecha_pro: new Date().toISOString(),
            },
            { merge: true }
          );
        }
        break;
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused': {
        const sub = event.data.object;
        const uid = sub.metadata?.uid;
        if (uid) {
          await db.collection('usuarios').doc(uid).set({ plan: 'gratis' }, { merge: true });
        } else if (typeof sub.customer === 'string') {
          const snap = await db.collection('usuarios').where('stripe_customer_id', '==', sub.customer).limit(1).get();
          snap.forEach((docu) => docu.ref.set({ plan: 'gratis' }, { merge: true }));
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
    return Response.json({ error: 'Error procesando el evento.' }, { status: 500 });
  }

  return Response.json({ recibido: true }, { status: 200 });
}
