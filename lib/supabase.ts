import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client using the anon key.
 *
 * Authentication is handled by Clerk (not Supabase Auth).
 * User identity is passed via Clerk's auth() → userId in queries,
 * not through Supabase JWT tokens.
 */
export const createSupabaseClient = async () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};