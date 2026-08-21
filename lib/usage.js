import { getAdminDb } from './firebase-admin';
import { LIMITE_GRATIS } from './constants';

export async function getUsageForUser(uid) {
  try {
    const db = getAdminDb();
    const ref = db.collection('usage').doc(uid);
    const snap = await ref.get();
    const usadas = snap.exists ? (snap.data().count || 0) : 0;
    return { usadas, limite: LIMITE_GRATIS, restantes: Math.max(0, LIMITE_GRATIS - usadas) };
  } catch {
    return { usadas: 0, limite: LIMITE_GRATIS, restantes: LIMITE_GRATIS };
  }
}

export async function incrementUsage(uid) {
  const db = getAdminDb();
  const ref = db.collection('usage').doc(uid);
  const snap = await ref.get();
  const newCount = snap.exists ? (snap.data().count || 0) + 1 : 1;
  await ref.set({ count: newCount });
  return newCount;
}
