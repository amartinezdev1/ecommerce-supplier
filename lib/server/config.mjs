export function ownerEmail() { return (process.env.RPM_ADMIN_EMAIL || '').trim().toLowerCase(); }
export function originOf(request) {
  const configured = process.env.APP_URL;
  if (configured) return new URL(configured).origin;
  return new URL(request.url).origin;
}
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== originOf(request)) throw Object.assign(new Error('Origen de solicitud inválido.'), { status: 403 });
}
export function safeReturnTo(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/?cuenta=1';
  const u = new URL(value, 'https://rpm.local');
  if (u.origin !== 'https://rpm.local' || u.pathname.startsWith('/auth/') || u.pathname.startsWith('/acceso')) return '/?cuenta=1';
  return u.pathname + u.search + u.hash;
}
