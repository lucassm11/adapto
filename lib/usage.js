import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { LIMITE_GRATIS } from './constants';

const DATA_DIR = join(process.cwd(), 'data');
const USAGE_FILE = join(DATA_DIR, 'usage.json');

export function getUsage() {
  if (!existsSync(USAGE_FILE)) return {};
  try {
    return JSON.parse(readFileSync(USAGE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

export function saveUsage(data) {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2));
}

export function getUsageForUser(uid) {
  const usage = getUsage();
  const usadas = usage[uid] || 0;
  return { usadas, limite: LIMITE_GRATIS, restantes: Math.max(0, LIMITE_GRATIS - usadas) };
}

export function incrementUsage(uid) {
  const usage = getUsage();
  const count = usage[uid] || 0;
  usage[uid] = count + 1;
  saveUsage(usage);
  return count + 1;
}
