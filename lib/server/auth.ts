import { authClient, authConfigured } from './supabase';
export async function currentUser() {
  if (!authConfigured()) return null;
  const client = await authClient();
  const { data, error } = await client.auth.getUser();
  // Identity is verified by the auth server, never inferred from request headers or user metadata.
  if (error || !data.user?.email || !data.user.email_confirmed_at) return null;
  return { userId: data.user.id, email: data.user.email.toLowerCase(), displayName: data.user.email.split('@')[0] };
}
