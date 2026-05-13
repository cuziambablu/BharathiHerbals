import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup')
  
  const isProtectedPage = request.nextUrl.pathname.startsWith('/account') || 
                          request.nextUrl.pathname.startsWith('/admin')

  // 2. Redirect logged-in users away from auth pages (Login/Signup)
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/account', request.url))
  }

  // 3. Redirect logged-out users away from protected pages
  if (!user && isProtectedPage) {
    // Only redirect if they are not already trying to go to /login or /signup
    // (This prevents infinite loops)
    if (!isAuthPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // 4. Role-based protection for /admin
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
