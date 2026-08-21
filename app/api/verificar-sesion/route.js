import Stripe from 'stripe';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      return Response.json({ error: 'Pagos no configurados.' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      return Response.json({ error: 'Falta session_id.' }, { status: 400 });
    }

    const stripe = new Stripe(secret);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return Response.json({ activo: false }, { status: 200 });
    }

    const uid = session.metadata?.uid || session.client_reference_id;
    if (!uid) {
      return Response.json({ activo: false }, { status: 200 });
    }

    await getAdminDb().collection('usuarios').doc(uid).set(
      {
        plan: 'pro',
        stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
        stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : null,
        fecha_pro: new Date().toISOString(),
      },
      { merge: true }
    );

    return Response.json({ activo: true, uid }, { status: 200 });
  } catch (error) {
    console.error('Error en /api/verificar-sesion:', error);
    return Response.json({ error: 'No se pudo verificar el pago.' }, { status: 500 });
  }
}
