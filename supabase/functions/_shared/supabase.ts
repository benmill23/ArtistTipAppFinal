import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

export function createSupabaseClient(authHeader: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );
}

export function getAuthUser(authHeader: string) {
  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    throw new Error('No authorization token provided');
  }
  return token;
}
