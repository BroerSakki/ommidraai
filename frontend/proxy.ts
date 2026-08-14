import { NextRequest, NextResponse } from 'next/server'

const LOGIN_PATH = '/login'
const REGISTER_PATH = '/register'
const HOME_PATH = '/'

interface AuthResult {
  authenticated: boolean
  newAccessToken?: string // Used to pass the fresh token up to the proxy response
}

async function checkAndRefreshAuth(request: NextRequest): Promise<AuthResult> {
  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  // Case 1: No access token AND no refresh token -> Immediately unauthenticated
  if (!accessToken && !refreshToken) {
    return { authenticated: false }
  }

  // Case 2: Access token exists, try validating it against /me
  if (accessToken) {
    try {
      const response = await fetch(`http://localhost:3000/api/backend/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        return { authenticated: true }
      }
    } catch {
      // Network error, fall back to trying refresh token if available
    }
  }

  // Case 3: Access token was missing or /me returned an error (401), but we have a refresh token
  if (refreshToken) {
    try {
      const refreshResponse = await fetch(`http://localhost:3000/api/backend/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        // Adjust data.access_token based on your actual API response structure
        return { 
          authenticated: true, 
          newAccessToken: data.access_token 
        }
      }
    } catch {
      // Refresh API failed
    }
  }

  return { authenticated: false }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check authentication and attempt silent refresh if necessary
  const { authenticated, newAccessToken } = await checkAndRefreshAuth(request)
  const isAuthPage = pathname === LOGIN_PATH || pathname === REGISTER_PATH

  let response: NextResponse

  if (authenticated) {
    if (isAuthPage) {
      response = NextResponse.redirect(new URL(HOME_PATH, request.url))
    } else {
      response = NextResponse.next()
    }
  } else {
    if (!isAuthPage) {
      response = NextResponse.redirect(new URL(LOGIN_PATH, request.url))
    } else {
      response = NextResponse.next()
    }
  }

  // CRITICAL: If a new token was generated, inject it into the response cookies
  if (newAccessToken) {
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 900,
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public|api).*)'],
}
