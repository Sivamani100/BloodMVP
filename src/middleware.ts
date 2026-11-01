import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { routing } from '@/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

const DEFAULT_SUPABASE_URL = 'https://yffjclzgracjbmqkjuon.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmZmpjbHpncmFjamJtcWtqdW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0NjUwNjMsImV4cCI6MjEwOTA0MTA2M30.wXK2Q9o6RYv54nIbi2Zc0PRCBrFjkIIwfln5ZT76ycA';

export async function middleware(request: NextRequest) {
  // Let Next.js handle internal paths and API routes directly without locale prefix
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 1. Run next-intl middleware first to get locale routing
  const response = intlMiddleware(request);

  // 2. Set up Supabase SSR client to refresh cookies safely
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const locale = routing.locales.includes(segments[0] as any) ? segments[0] : routing.defaultLocale;
    const pathWithoutLocale = '/' + segments.slice(1).join('/');

    // 3. Admin guard: 404 for non-admins
    if (pathWithoutLocale.startsWith('/admin')) {
      if (!user) {
        return new NextResponse(null, { status: 404 });
      }
      const { data: isAdmin } = await supabase.rpc('is_admin');
      if (!isAdmin) {
        return new NextResponse(null, { status: 404 });
      }
    }

    // 4. Protected routes: redirect to login if not authenticated
    const protectedPrefixes = ['/become-donor', '/donor', '/d/', '/r/', '/need-blood/details'];
    const isProtected = protectedPrefixes.some((prefix) => pathWithoutLocale.startsWith(prefix));

    if (isProtected && !user) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch (err) {
    console.error('Middleware auth check error (safely recovered):', err);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
