import { getAdminDb } from './firebase-admin';
import { LIMITE_GRATIS } from './constants';

function getMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function getUsageForUser(uid) {
  try {
    const db = getAdminDb();
    const monthKey = getMonthKey();
    const ref = db.collection('usage').doc(uid);
    const snap = await ref.get();
    const data = snap.exists ? snap.data() : {};
    const usadas = data.month === monthKey ? (data.count || 0) : 0;
    return { usadas, limite: LIMITE_GRATIS, restantes: Math.max(0, LIMITE_GRATIS - usadas) };
  } catch {
    return { usadas: 0, limite: LIMITE_GRATIS, restantes: LIMITE_GRATIS };
  }
}

export async function incrementUsage(uid) {
  const db = getAdminDb();
  const monthKey = getMonthKey();
  const ref = db.collection('usage').doc(uid);
  const snap = await ref.get();
  const data = snap.exists ? snap.data() : {};
  const newCount = data.month === monthKey ? (data.count || 0) + 1 : 1;
  await ref.set({ count: newCount, month: monthKey });
  return newCount;
}
