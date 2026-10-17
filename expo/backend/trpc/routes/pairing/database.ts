const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  'https://edfhtkxslhxchckkihgx.supabase.co';

// This is the project's public anon key. Table access is denied by RLS; the app
// can only call the narrowly scoped pairing RPC functions in the migration.
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZmh0a3hzbGh4Y2hja2tpaGd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1OTUyMjUsImV4cCI6MjA3NDE3MTIyNX0.t4Mdc1qtBoyJ4KqULWDTVlPCEjA2HZtU59jDvzsqzbI';

export async function pairingRpc<T>(functionName: string, args: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Pairing storage request failed (${response.status}): ${body.slice(0, 240)}`);
  }

  return response.json() as Promise<T>;
}
