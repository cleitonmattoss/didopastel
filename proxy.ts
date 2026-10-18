import { NextResponse, type NextRequest } from 'next/server'

/**
 * Bloqueia o painel sem sessão.
 * PONTO DE INTEGRAÇÃO: hoje verifica apenas o cookie de demonstração. Com Supabase Auth, trocar por
 * validação da sessão + papel do funcionário (ex.: tabela `staff` com role admin/atendente/cozinha).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/admin') && pathname !== '/admin/entrar') {
    if (request.cookies.get('admin_demo_session')?.value !== '1') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/entrar'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
