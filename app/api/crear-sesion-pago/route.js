import Stripe from 'stripe';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return Response.json({ error: 'Pagos no configurados todavia.' }, { status: 503 });
    }

    const body = await request.json().catch(() => null);
    const uid = body?.uid;
    const email = body?.email;

    if (!uid) {
      return Response.json({ error: 'Falta el identificador de usuario.' }, { status: 400 });
    }

    let planActivo = false;
    try {
      const snap = await getAdminDb().collection('usuarios').doc(uid).get();
      planActivo = snap.exists && snap.data()?.plan === 'pro';
    } catch {}
    if (planActivo) {
      return Response.json({ error: 'Ya tienes el plan Pro activo.' }, { status: 409 });
    }

    const stripe = new Stripe(secret);
    const priceId = process.env.STRIPE_PRICE_ID;
    const productId = process.env.STRIPE_PRODUCT_ID;

    let lineItem;
    if (priceId) {
      lineItem = { price: priceId, quantity: 1 };
    } else if (productId) {
      const prices = await stripe.prices.list({ product: productId, active: true, limit: 10 });
      const price = prices.data.find((p) => p.recurring?.interval === 'month') || prices.data.find((p) => p.recurring) || prices.data[0];
      if (!price) {
        return Response.json({ error: 'El producto no tiene ningun precio configurado en Stripe.' }, { status: 500 });
      }
      lineItem = { price: price.id, quantity: 1 };
    } else {
      lineItem = {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: 3500,
          recurring: { interval: 'month' },
          product_data: {
            name: 'Adapto Pro',
            description: 'Adaptaciones ilimitadas, 16 perfiles NEAE, PDF completo, Diagnosticador IA y AdapBot con contexto.',
          },
        },
      };
    }

    const sessionConfig = {
      mode: 'subscription',
      client_reference_id: uid,
      metadata: { uid },
      subscription_data: { metadata: { uid } },
      success_url: `${APP_URL}/precios?exito=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/precios?cancelado=1`,
      allow_promotion_codes: true,
      line_items: [lineItem],
    };
    if (email) sessionConfig.customer_email = email;

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return Response.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error('Error en /api/crear-sesion-pago:', error);
    return Response.json({ error: 'No se pudo iniciar el pago. Intenta de nuevo.' }, { status: 500 });
  }
}
