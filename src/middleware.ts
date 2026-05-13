import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  if (!supabase) {
    console.error("❌ CRITICAL: Supabase client could not be initialized in Middleware.");
    return response;
  }

  // 1. Get user session - using the most stable method
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname;
  const isAuthPage = path === '/login' || path === '/signup';
  const isProtectedPage = path.startsWith('/account') || path.startsWith('/admin');

  console.log(`[MIDDLEWARE] Path: ${path} | User: ${user?.id ? 'LOGGED_IN' : 'GUEST'}`);

  // 2. LOGGED IN -> Trying to go to Login/Signup -> SEND TO ACCOUNT
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/account', request.url))
  }

  // 3. LOGGED OUT -> Trying to go to Protected Page -> SEND TO LOGIN
  if (!user && isProtectedPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. ADMIN PROTECTION
  if (user && path.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/account', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
