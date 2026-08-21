export const dynamic = 'force-dynamic';

import { getUsageForUser } from '@/lib/usage';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return Response.json({ error: 'uid requerido' }, { status: 400 });
  }

  const usage = await getUsageForUser(uid);
  return Response.json(usage);
}
