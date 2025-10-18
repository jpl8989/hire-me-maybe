import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        // In middleware, request cookies are read-only. We must set cookies on the response,
        // and re-create the response with forwarded headers to ensure cookies are applied.
        supabaseResponse = NextResponse.next({
          request: { headers: new Headers(request.headers) },
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // IMPORTANT: Do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login (except for public routes)
  if (!user && !request.nextUrl.pathname.startsWith("/auth") && request.nextUrl.pathname !== "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // If user is authenticated but hasn't selected a role, redirect to role selection
  if (user && request.nextUrl.pathname === "/auth/select-role") {
    return supabaseResponse
  }

  // Check if user has a role set
  if (user && !request.nextUrl.pathname.startsWith("/auth")) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    // If no profile or no role, redirect to role selection
    if (!profile || !profile.role) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/select-role"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
