import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
export function authConfigured() { return !!(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY); }
export async function authClient() {
  if (!authConfigured()) throw Object.assign(new Error('El acceso por correo aún no está configurado.'), { status: 503 });
  const store = await cookies();
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookieOptions: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' },
    cookies: { getAll: () => store.getAll(), setAll: values => values.forEach(({ name, value, options }) => store.set(name, value, options)) },
  });
}
export function storageClient() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) throw Object.assign(new Error('El almacenamiento de imágenes aún no está configurado.'), { status: 503 });
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
