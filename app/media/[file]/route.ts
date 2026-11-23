import { getImage } from '../../../lib/server/storage';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const key = new URL(request.url).pathname.split('/').pop()!;
  if (!/^[a-f\d-]+\.(jpg|png|webp)$/.test(key)) return new Response('No encontrado', { status: 404 });
  const file = await getImage(key);
  if (!file) return new Response('No encontrado', { status: 404 });
  return new Response(file, { headers: { 'Content-Type': file.type || 'image/webp', 'Cache-Control': 'public,max-age=86400', 'X-Content-Type-Options': 'nosniff' } });
}
