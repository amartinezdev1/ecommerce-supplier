import { authClient } from '../../../lib/server/supabase';
import { database } from '../../../lib/server/database.mjs';
import { hashToken, readBody } from '../../../lib/server/api.mjs';
import { sameOrigin, safeReturnTo } from '../../../lib/server/config.mjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
async function limit(email: string, kind: string, max: number) {
  const key = await hashToken(kind + ':' + email);
  const result = await database().query(`INSERT INTO rpm.auth_limits(key,attempts,expires_at) VALUES($1,1,now()+interval '10 minutes')
    ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN rpm.auth_limits.expires_at<now() THEN 1 ELSE rpm.auth_limits.attempts+1 END,
    expires_at=CASE WHEN rpm.auth_limits.expires_at<now() THEN now()+interval '10 minutes' ELSE rpm.auth_limits.expires_at END RETURNING attempts`, [key]);
  if (result.rows[0].attempts > max) throw Object.assign(new Error('Espera unos minutos antes de volver a intentarlo.'), { status: 429 });
  await database().query("DELETE FROM rpm.auth_limits WHERE expires_at < now()-interval '1 day'");
}
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const action = new URL(request.url).pathname.split('/').pop();
    const client = await authClient();
    if (action === 'signout') {
      const { error } = await client.auth.signOut();
      if (error) throw Object.assign(new Error('No fue posible cerrar la sesión.'), { status: 502 });
      return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    }
    const body = await readBody(request);
    const email = String(body.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw Object.assign(new Error('Escribe un correo válido.'), { status: 400 });
    if (action === 'request-code') {
      await limit(email, 'request', 3);
      const { error } = await client.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
      if (error) throw Object.assign(new Error(error.status === 429 ? 'Espera un minuto antes de solicitar otro código.' : 'No pudimos enviar el código. Intenta nuevamente en unos minutos.'), { status: error.status === 429 ? 429 : 502 });
      return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    }
    if (action === 'verify-code') {
      await limit(email, 'verify', 10);
      const token = String(body.code || '').trim();
      if (!/^\d{6,10}$/.test(token)) throw Object.assign(new Error('Escribe el código que recibiste en tu correo.'), { status: 400 });
      const { error } = await client.auth.verifyOtp({ email, token, type: 'email' });
      if (error) throw Object.assign(new Error('El código no es válido o ya venció. Solicita uno nuevo.'), { status: 401 });
      return Response.json({ ok: true, returnTo: safeReturnTo(body.returnTo) }, { headers: { 'Cache-Control': 'no-store' } });
    }
    return Response.json({ error: 'Ruta no encontrada.' }, { status: 404 });
  } catch (error: any) {
    return Response.json({ error: error.status ? error.message : 'El acceso no está disponible en este momento.' }, { status: error.status || 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
