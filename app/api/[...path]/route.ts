import { createApi } from '../../../lib/server/api.mjs';
import { database } from '../../../lib/server/database.mjs';
import { currentUser } from '../../../lib/server/auth';
import { ownerEmail } from '../../../lib/server/config.mjs';
import { putImage } from '../../../lib/server/storage';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
async function handle(request: Request) {
  try { return await createApi({ db: database(), getUser: currentUser, ownerEmail: ownerEmail(), putImage })(request); }
  catch { return Response.json({ error: 'El servicio aún no está configurado. Revisa la conexión con la base de datos.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
}
export const GET = handle;
export const POST = handle;
