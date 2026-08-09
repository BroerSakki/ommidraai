import { NextRequest, NextResponse } from 'next/server'

const LOGIN_PATH = '/login'
const HOME_PATH = '/home'

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('access_token')?.value;

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

  if (!['/', '/home', '/login'].includes(pathname)) {
    return NextResponse.next()
  }

  const authenticated = await isAuthenticated(request)

  if (pathname === '/') {
    return NextResponse.redirect(new URL(authenticated ? HOME_PATH : LOGIN_PATH, request.url))
  }

  if (pathname === '/home') {
    if (!authenticated) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
    }

<<<<<<< HEAD
    return NextResponse.rewrite(new URL('/home', request.url))
=======
    return NextResponse.rewrite(new URL(HOME_PATH, request.url))
>>>>>>> 17c7d9c41d46a31d1e7c06e6f2e4d9f27cf4264b
  }

  if (pathname === '/login' && authenticated) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/home', '/login'],
}
