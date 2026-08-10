import { NextRequest, NextResponse } from 'next/server'

const LOGIN_PATH = '/login'
const REGISTER_PATH = '/register'
const HOME_PATH = '/'

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('access_token')?.value
  if (!token) return false

  try {
    if (token) {
      const response = await fetch(`http://localhost:3000/api/backend/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      return response.ok
    } else {
      return false
    }
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.includes('.')) {
    return NextResponse.next()
  }

  const authenticated = await isAuthenticated(request)
  const isAuthPage = pathname === LOGIN_PATH || pathname === REGISTER_PATH

  if (authenticated) {
    if (isAuthPage) {
      return NextResponse.redirect(new URL(HOME_PATH, request.url))
    } else {
      return NextResponse.next()
    }
  } else {
    if (!(isAuthPage)) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
    } else {
      return NextResponse.next()
    }
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api).*)',],
}
