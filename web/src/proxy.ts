import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isAdminEmail } from "@/lib/admin-emails";

/** Refresh when the access token is missing or expires within this window. */
const REFRESH_WITHIN_MS = 120_000;

// Refreshes the Supabase session cookie when needed so Server Components
// always see a valid access token. Gates /admin. Matcher excludes /api/*.
export async function proxy(request: NextRequest) {
  try {
    let response = NextResponse.next({ request });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return response;

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const path = request.nextUrl.pathname;
    const isAdminPath = path === "/admin" || path.startsWith("/admin/");

    // Cookie-only first — avoid Auth network hop on every soft navigation.
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (isAdminPath && !session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    let user = session?.user ?? null;
    if (session) {
      const expiresAtMs = (session.expires_at ?? 0) * 1000;
      const needsRefresh =
        expiresAtMs - Date.now() < REFRESH_WITHIN_MS || isAdminPath;

      if (needsRefresh) {
        try {
          const {
            data: { user: verified },
          } = await supabase.auth.getUser();
          user = verified;
        } catch {
          // If auth network check fails, fallback to session user
        }
      }
    }

    if (isAdminPath) {
      if (!user?.email || !user.email_confirmed_at) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      if (!isAdminEmail(user.email)) {
        const denied = new URL("/dashboard", request.url);
        denied.searchParams.set("admin", "denied");
        return NextResponse.redirect(denied);
      }
    }

    return response;
  } catch {
    // Fail closed on admin routes during auth infrastructure failures
    if (request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/admin/")) {
      return NextResponse.redirect(new URL("/login?error=auth_unavailable", request.url));
    }
    // Never take down public site if session refresh fails.
    return NextResponse.next({ request });
  }
}

export const config = {
  // Pages only — skip static assets and /api/* (MT5 webhooks / cron already
  // authenticate with bearer secrets; running getUser() on every tick burns
  // Edge + Auth quota for no benefit).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
