import { doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from './firebase';
import { LIMITE_GRATIS } from './constants';

export async function getUsageForUser(uid) {
  try {
    const ref = doc(db, 'usage', uid);
    const snap = await getDoc(ref);
    const usadas = snap.exists() ? (snap.data().count || 0) : 0;
    return { usadas, limite: LIMITE_GRATIS, restantes: Math.max(0, LIMITE_GRATIS - usadas) };
  } catch {
    return { usadas: 0, limite: LIMITE_GRATIS, restantes: LIMITE_GRATIS };
  }
}

export async function incrementUsage(uid) {
  const ref = doc(db, 'usage', uid);
  const snap = await getDoc(ref);
  const newCount = snap.exists() ? (snap.data().count || 0) + 1 : 1;
  await setDoc(ref, { count: newCount });
  return newCount;
}
