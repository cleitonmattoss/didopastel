import { NextResponse, type NextRequest } from 'next/server'
import { hasSupabaseConfig } from '@/lib/supabase/env'
import { refreshSupabaseSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/entrar') {
    return NextResponse.next({ request })
  }

  if (!hasSupabaseConfig()) {
    return redirectToLogin(request)
  }

  try {
    const { response, authenticated } = await refreshSupabaseSession(request)
    if (authenticated) return response
    return redirectToLogin(request, response)
  } catch {
    return redirectToLogin(request)
  }
}

function redirectToLogin(request: NextRequest, sessionResponse?: NextResponse) {
  const url = request.nextUrl.clone()
  url.pathname = '/admin/entrar'
  url.search = ''
  const response = NextResponse.redirect(url)

  if (sessionResponse) {
    for (const cookie of sessionResponse.cookies.getAll()) {
      response.cookies.set(cookie)
    }
    for (const header of ['cache-control', 'expires', 'pragma']) {
      const value = sessionResponse.headers.get(header)
      if (value) response.headers.set(header, value)
    }
  }

  return response
}

export const config = { matcher: ['/admin/:path*'] }
