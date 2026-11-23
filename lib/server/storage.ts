import { storageClient } from './supabase';
const bucket = () => process.env.SUPABASE_STORAGE_BUCKET || 'rpm-products';
export async function putImage(key: string, bytes: ArrayBuffer, contentType: string) {
  const { error } = await storageClient().storage.from(bucket()).upload(key, bytes, { contentType, upsert: false, cacheControl: '86400' });
  if (error) throw Object.assign(new Error('No fue posible guardar la fotografía.'), { status: 502 });
}
export async function getImage(key: string) {
  const { data, error } = await storageClient().storage.from(bucket()).download(key);
  if (error || !data) return null;
  return data;
}
