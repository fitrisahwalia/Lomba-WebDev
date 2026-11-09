import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Ambil user dari session Supabase
  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()

  let role = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    role = profile?.role?.toLowerCase() ?? null
  }

  // Melindungi rute /admin (Hanya admin, adminops, superadmin)
  if (url.pathname.startsWith('/admin')) {
    if (!user || !['admin', 'adminops', 'superadmin'].includes(role || '')) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Melindungi rute /transport (Hanya admintransport, kurir, supir, superadmin)
  if (url.pathname.startsWith('/transport')) {
    if (!user || !['admintransport', 'kurir', 'supir', 'superadmin'].includes(role || '')) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/transport/:path*',
    '/buyer/:path*',
    '/nelayan/:path*'
  ],
}