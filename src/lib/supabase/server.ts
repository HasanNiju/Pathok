/**
 * Supabase client for use on the server — server components, route
 * handlers, and server actions. Reads/writes the auth session via
 * cookies so a logged-in user stays logged in across page loads.
 *
 * Usage (inside an async server component or route handler):
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = await createClient();
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component that can't set cookies —
            // safe to ignore as long as middleware.ts (below) is
            // refreshing the session on every request.
          }
        },
      },
    }
  );
}
